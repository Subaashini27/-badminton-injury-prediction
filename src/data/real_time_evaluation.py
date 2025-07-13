import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score, KFold
from sklearn.ensemble import RandomForestClassifier
import tensorflow as tf
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score
import matplotlib.pyplot as plt
import seaborn as sns
import time
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import cv2
import mediapipe as mp
from datetime import datetime

class RealTimeRiskPredictor:
    def __init__(self, mediapipe_path, google_forms_path):
        self.mediapipe_path = mediapipe_path
        self.google_forms_path = google_forms_path
        self.scaler = StandardScaler()
        self.kmeans = None
        self.movement_thresholds = None
        self.cluster_risk_mapping = None
        self.optimal_clusters = None
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
    def extract_advanced_features(self, landmarks):
        """Extract advanced movement pattern features"""
        features = []
        
        # Joint angles
        def calculate_angle(a, b, c):
            a = np.array(a)
            b = np.array(b)
            c = np.array(c)
            
            radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
            angle = np.abs(radians*180.0/np.pi)
            
            if angle > 180.0:
                angle = 360-angle
                
            return angle
        
        # Calculate key joint angles
        # Shoulder angle
        shoulder_angle = calculate_angle(
            [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y],
            [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y],
            [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]
        )
        features.append(shoulder_angle)
        
        # Hip angle
        hip_angle = calculate_angle(
            [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y],
            [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y],
            [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        )
        features.append(hip_angle)
        
        # Knee angle
        knee_angle = calculate_angle(
            [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y],
            [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y],
            [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
             landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        )
        features.append(knee_angle)
        
        # Movement velocity (approximated from landmark positions)
        velocities = []
        for i in range(len(landmarks)-1):
            dx = landmarks[i+1].x - landmarks[i].x
            dy = landmarks[i+1].y - landmarks[i].y
            velocity = np.sqrt(dx*dx + dy*dy)
            velocities.append(velocity)
        features.append(np.mean(velocities))
        
        # Balance metrics
        left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value]
        left_ankle = landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value]
        right_ankle = landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value]
        
        hip_balance = abs(left_hip.y - right_hip.y)
        ankle_balance = abs(left_ankle.y - right_ankle.y)
        features.extend([hip_balance, ankle_balance])
        
        # Posture alignment
        spine_alignment = abs(
            landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y -
            landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y
        )
        features.append(spine_alignment)
        
        return np.array(features)
    
    def collect_training_data(self, video_path, output_path, num_frames=100):
        """Collect training data from video"""
        print(f"Collecting training data from {video_path}...")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("Error: Could not open video file")
            return
        
        frames = []
        frame_count = 0
        
        while frame_count < num_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the frame
            results = self.pose.process(frame_rgb)
            
            if results.pose_landmarks:
                # Extract basic landmark features
                landmark_features = []
                for landmark in results.pose_landmarks.landmark:
                    landmark_features.extend([landmark.x, landmark.y, landmark.z])
                
                # Extract advanced features
                advanced_features = self.extract_advanced_features(results.pose_landmarks.landmark)
                
                # Combine features
                combined_features = np.concatenate([landmark_features, advanced_features])
                frames.append(combined_features)
                
                frame_count += 1
                
                # Visualize the frame
                cv2.imshow('Collecting Training Data', frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        
        cap.release()
        cv2.destroyAllWindows()
        
        if frames:
            # Save collected data
            data = pd.DataFrame(frames)
            data.to_csv(output_path, index=False)
            print(f"Collected {len(frames)} frames and saved to {output_path}")
        else:
            print("No valid frames collected")
    
    def load_and_preprocess_data(self):
        """Load and preprocess MediaPipe dataset"""
        mediapipe_df = pd.read_csv(self.mediapipe_path)
        
        # Extract landmark columns
        landmark_cols = [col for col in mediapipe_df.columns 
                        if col.startswith('landmark_') and not col.endswith('_visibility')]
        
        X = mediapipe_df[landmark_cols]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled, mediapipe_df
    
    def find_optimal_clusters(self, X_scaled):
        """Find optimal number of clusters using silhouette score"""
        silhouette_scores = []
        n_clusters_range = range(2, 6)
        
        for n_clusters in n_clusters_range:
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(X_scaled)
            silhouette_avg = silhouette_score(X_scaled, cluster_labels)
            silhouette_scores.append(silhouette_avg)
        
        optimal_clusters = n_clusters_range[np.argmax(silhouette_scores)]
        self.optimal_clusters = optimal_clusters
        self.kmeans = KMeans(n_clusters=optimal_clusters, random_state=42)
        
        return optimal_clusters
    
    def calculate_movement_risk(self, X_scaled):
        """Calculate movement risk scores using clustering"""
        cluster_labels = self.kmeans.fit_predict(X_scaled)
        
        # Calculate movement intensity for each cluster
        movement_intensity = []
        cluster_sizes = []
        for i in range(self.optimal_clusters):
            cluster_data = X_scaled[cluster_labels == i]
            cluster_sizes.append(len(cluster_data))
            
            # Calculate intensity based on multiple factors
            magnitude = np.mean(np.abs(cluster_data))
            variation = np.std(cluster_data)
            velocity = np.mean(np.abs(np.diff(cluster_data, axis=0)))
            
            # Combine factors with weights
            intensity = (0.4 * magnitude + 0.3 * variation + 0.3 * velocity)
            movement_intensity.append(intensity)
        
        # Normalize movement intensity scores
        movement_intensity = np.array(movement_intensity)
        movement_intensity = (movement_intensity - movement_intensity.min()) / (movement_intensity.max() - movement_intensity.min())
        
        # Adjust risk scores based on cluster size and density
        total_samples = sum(cluster_sizes)
        size_weights = [size/total_samples for size in cluster_sizes]
        
        # Calculate cluster density
        cluster_density = []
        for i in range(self.optimal_clusters):
            cluster_data = X_scaled[cluster_labels == i]
            if len(cluster_data) > 1:
                # Calculate average distance between points in cluster
                distances = np.mean(np.abs(cluster_data[:, np.newaxis] - cluster_data), axis=1)
                density = 1 / (1 + np.mean(distances))
            else:
                density = 1.0
            cluster_density.append(density)
        
        # Combine size and density weights
        combined_weights = np.array(size_weights) * np.array(cluster_density)
        combined_weights = combined_weights / np.sum(combined_weights)
        
        # Apply weights to movement intensity
        movement_intensity = movement_intensity * combined_weights
        
        # Map clusters to risk levels
        self.cluster_risk_mapping = {i: intensity for i, intensity in enumerate(movement_intensity)}
        movement_risk_scores = [self.cluster_risk_mapping[label] for label in cluster_labels]
        
        return movement_risk_scores, cluster_labels
    
    def tune_thresholds(self, movement_risk_scores):
        """Tune risk thresholds using cross-validation"""
        # Calculate dynamic thresholds based on distribution
        scores = np.array(movement_risk_scores)
        
        # Use more balanced thresholds with overlapping ranges
        self.movement_thresholds = {
            'low': np.percentile(scores, 20),  # Bottom fifth
            'medium': np.percentile(scores, 50),  # Median
            'high': np.percentile(scores, 80)  # Top fifth
        }
        
        # Add larger overlap between categories
        overlap = 0.1
        self.movement_thresholds['medium'] = (self.movement_thresholds['low'] + self.movement_thresholds['high']) / 2
        self.movement_thresholds['low'] = max(0, self.movement_thresholds['low'] - overlap)
        self.movement_thresholds['high'] = min(1, self.movement_thresholds['high'] + overlap)
        
        return self.movement_thresholds['medium']
    
    def train(self):
        """Train the risk predictor"""
        print("Loading and preprocessing data...")
        X_scaled, mediapipe_df = self.load_and_preprocess_data()
        
        print("Finding optimal number of clusters...")
        optimal_clusters = self.find_optimal_clusters(X_scaled)
        print(f"Optimal number of clusters: {optimal_clusters}")
        
        print("Calculating movement risk scores...")
        movement_risk_scores, cluster_labels = self.calculate_movement_risk(X_scaled)
        
        print("Tuning risk thresholds...")
        optimal_threshold = self.tune_thresholds(movement_risk_scores)
        
        # Perform cross-validation
        print("\nPerforming cross-validation...")
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = []
        
        movement_risk_scores = np.array(movement_risk_scores)
        
        for train_idx, val_idx in kf.split(X_scaled):
            # Split data
            X_train = X_scaled[train_idx]
            X_val = X_scaled[val_idx]
            movement_risk_train = movement_risk_scores[train_idx]
            movement_risk_val = movement_risk_scores[val_idx]
            
            # Fit KMeans on training data
            kmeans = KMeans(n_clusters=self.optimal_clusters, random_state=42)
            kmeans.fit(X_train)
            
            # Predict on validation data
            val_clusters = kmeans.predict(X_val)
            
            # Map clusters to risk scores using training data
            cluster_risk_mapping = {}
            for i in range(self.optimal_clusters):
                cluster_mask = (kmeans.labels_ == i)
                if np.any(cluster_mask):
                    cluster_risk_mapping[i] = np.mean(movement_risk_train[cluster_mask])
                else:
                    cluster_risk_mapping[i] = 0.0
            
            val_risk_scores = np.array([cluster_risk_mapping[label] for label in val_clusters])
            
            # Calculate accuracy (within 0.1 threshold)
            accuracy = np.mean(np.abs(val_risk_scores - movement_risk_val) < 0.1)
            cv_scores.append(accuracy)
            
            print(f"Fold accuracy: {accuracy:.3f}")
        
        print(f"\nCross-validation accuracy: {np.mean(cv_scores):.3f} (+/- {np.std(cv_scores):.3f})")
        
        # Plot learning curves
        plt.figure(figsize=(10, 6))
        plt.plot(range(1, len(cv_scores) + 1), cv_scores, marker='o')
        plt.xlabel('Fold')
        plt.ylabel('Accuracy')
        plt.title('Cross-validation Accuracy Across Folds')
        plt.savefig('learning_curves.png')
        plt.close()
        
        # Plot cluster distribution
        plt.figure(figsize=(10, 6))
        sns.histplot(data=pd.DataFrame({
            'Cluster': cluster_labels,
            'Risk Score': movement_risk_scores
        }), x='Risk Score', hue='Cluster', bins=20)
        plt.title('Risk Score Distribution by Cluster')
        plt.savefig('cluster_risk_distribution.png')
        plt.close()
        
        return optimal_threshold
    
    def predict_risk(self, landmark_data, confidence_threshold=0.7):
        """Predict risk in real-time with confidence scores"""
        # Scale the input data
        landmark_scaled = self.scaler.transform(landmark_data)
        
        # Get cluster prediction
        cluster = self.kmeans.predict(landmark_scaled)[0]
        
        # Calculate movement risk score
        movement_risk = self.cluster_risk_mapping[cluster]
        
        # Calculate confidence score based on multiple factors
        cluster_center = self.kmeans.cluster_centers_[cluster]
        distance = np.linalg.norm(landmark_scaled - cluster_center)
        
        # Get all points in this cluster from training
        cluster_points = self.kmeans.labels_ == cluster
        if np.any(cluster_points):
            # Calculate cluster statistics
            cluster_data = self.kmeans.cluster_centers_[cluster]
            cluster_std = np.std(cluster_data)
            cluster_density = len(cluster_data) / (cluster_std + 1e-6)
            
            # Calculate normalized distance
            normalized_distance = distance / (cluster_std + 1e-6)
            
            # Calculate confidence based on multiple factors
            distance_confidence = 1 / (1 + normalized_distance)
            density_confidence = np.clip(cluster_density / 100, 0, 1)
            
            # Combine confidence factors
            confidence = 0.6 * distance_confidence + 0.4 * density_confidence
        else:
            confidence = 0.0
        
        # Scale confidence to be between 0 and 1
        confidence = np.clip(confidence, 0, 1)
        
        # Determine risk level with overlapping thresholds and soft boundaries
        if movement_risk < self.movement_thresholds['low']:
            risk_level = 'low'
        elif movement_risk < self.movement_thresholds['medium']:
            # Use sigmoid function for smooth transition
            transition = 1 / (1 + np.exp(-10 * (movement_risk - self.movement_thresholds['low'])))
            if np.random.random() < transition:
                risk_level = 'low'
            else:
                risk_level = 'medium'
        else:
            # Use sigmoid function for smooth transition
            transition = 1 / (1 + np.exp(-10 * (movement_risk - self.movement_thresholds['high'])))
            if np.random.random() < transition:
                risk_level = 'medium'
            else:
                risk_level = 'high'
        
        return {
            'risk_level': risk_level,
            'movement_risk_score': movement_risk,
            'confidence': confidence,
            'cluster': cluster
        }
    
    def evaluate_real_time_performance(self, num_samples=100):
        """Evaluate real-time performance"""
        print("\nEvaluating real-time performance...")
        
        # Load test data
        X_scaled, _ = self.load_and_preprocess_data()
        
        # Measure prediction time
        prediction_times = []
        predictions = []
        
        for _ in range(num_samples):
            # Randomly select a sample
            sample_idx = np.random.randint(0, len(X_scaled))
            sample = X_scaled[sample_idx:sample_idx+1]
            
            # Measure prediction time
            start_time = time.time()
            prediction = self.predict_risk(sample)
            end_time = time.time()
            
            prediction_times.append(end_time - start_time)
            predictions.append(prediction)
        
        avg_time = np.mean(prediction_times)
        std_time = np.std(prediction_times)
        
        print(f"Average prediction time: {avg_time*1000:.2f}ms (+/- {std_time*1000:.2f}ms)")
        
        # Plot prediction time distribution
        plt.figure(figsize=(10, 6))
        sns.histplot(prediction_times, bins=20)
        plt.xlabel('Prediction Time (seconds)')
        plt.ylabel('Count')
        plt.title('Distribution of Real-time Prediction Times')
        plt.savefig('prediction_times.png')
        plt.close()
        
        # Plot risk level distribution
        risk_levels = [p['risk_level'] for p in predictions]
        plt.figure(figsize=(10, 6))
        sns.countplot(x=risk_levels)
        plt.xlabel('Risk Level')
        plt.ylabel('Count')
        plt.title('Distribution of Predicted Risk Levels')
        plt.savefig('risk_level_distribution.png')
        plt.close()
        
        # Print prediction statistics
        print("\nPrediction Statistics:")
        print(f"Risk Level Distribution:")
        for level in ['low', 'medium', 'high']:
            count = risk_levels.count(level)
            percentage = (count / len(risk_levels)) * 100
            print(f"- {level}: {count} ({percentage:.1f}%)")
        
        print(f"\nAverage Confidence: {np.mean([p['confidence'] for p in predictions]):.3f}")
        print(f"Confidence Range: {np.min([p['confidence'] for p in predictions]):.3f} - {np.max([p['confidence'] for p in predictions]):.3f}")

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    
    # Initialize and train the predictor
    predictor = RealTimeRiskPredictor(mediapipe_path, None)
    
    # Collect additional training data from video
    video_path = os.path.join(current_dir, 'training_video.mp4')
    output_path = os.path.join(current_dir, 'additional_training_data.csv')
    predictor.collect_training_data(video_path, output_path)
    
    # Train the model
    optimal_threshold = predictor.train()
    
    # Evaluate real-time performance
    predictor.evaluate_real_time_performance()
    
    # Example real-time prediction
    print("\nExample real-time prediction:")
    X_scaled, _ = predictor.load_and_preprocess_data()
    sample = X_scaled[0:1]
    prediction = predictor.predict_risk(sample)
    print(f"Risk Level: {prediction['risk_level']}")
    print(f"Movement Risk Score: {prediction['movement_risk_score']:.3f}")
    print(f"Confidence: {prediction['confidence']:.3f}")
    print(f"Cluster: {prediction['cluster']}")

if __name__ == "__main__":
    main() 