import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
from imblearn.over_sampling import SMOTE
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

def calculate_risk_score(row):
    """Calculate a risk score from Google Form responses"""
    score = 0
    
    # Fatigue level (1-10 scale)
    fatigue_col = "  On a scale of 1-10, how fatigued do you feel after a typical training session?  \n 1 =No Fatigue \n10 =Extreme Fatigue  "
    if pd.notna(row[fatigue_col]):
        score += row[fatigue_col] / 2  # Scale to 0-5
        
    # Discomfort frequency
    discomfort_col = "  How often do you experience muscle/joint discomfort after training?  "
    if pd.notna(row[discomfort_col]):
        if row[discomfort_col] == 'Almost every training session':
            score += 5
        elif row[discomfort_col] == 'Frequently (1-2 times a week)':
            score += 4
        elif row[discomfort_col] == 'Occasionally (1-2 times a month)':
            score += 2
            
    # Experience level (inverse relationship)
    experience_col = "  How many years of experience do you have in sports-related activities?  "
    if pd.notna(row[experience_col]):
        if row[experience_col] == 'Less than 1 year':
            score += 4
        elif row[experience_col] == 'Less than 5 years':
            score += 2
        elif row[experience_col] == 'More than 1 year':
            score += 3
        elif row[experience_col] == 'More than 5 years':
            score += 1
            
    # Training frequency
    training_col = "  How often do you train per week?  "
    if pd.notna(row[training_col]):
        if row[training_col] == 'More than 5 times per week':
            score += 4
        elif row[training_col] == '3–5 times per week':
            score += 2
        elif row[training_col] == 'Less than 3 times per week':
            score += 1
            
    # Sleep hours
    sleep_col = "How many hours of sleep do you get per night?"
    if pd.notna(row[sleep_col]):
        if row[sleep_col] == 'Less than 5 hours':
            score += 4
        elif row[sleep_col] == '5-7 hours':
            score += 2
            
    # Hydration
    hydration_col = "Do you drink enough water before, during, and after training?"
    if pd.notna(row[hydration_col]):
        if row[hydration_col] == 'No':
            score += 3
        elif row[hydration_col] == 'Sometimes':
            score += 2
            
    # Nutrition
    nutrition_col = "Do you follow a structured nutrition plan for recovery?"
    if pd.notna(row[nutrition_col]):
        if row[nutrition_col] == 'No, I eat whatever is available':
            score += 3
        elif row[nutrition_col] == 'Yes, but self-managed':
            score += 1
            
    return score

def analyze_movement_patterns(mediapipe_df):
    """Analyze movement patterns using clustering"""
    # Extract only the landmark coordinates (excluding visibility)
    landmark_cols = [col for col in mediapipe_df.columns 
                    if col.startswith('landmark_') and not col.endswith('_visibility')]
    
    print("\nLandmark columns found:", len(landmark_cols))
    if len(landmark_cols) == 0:
        print("No landmark columns found. Available columns:")
        print(mediapipe_df.columns.tolist())
        return None, None, 0
        
    X = mediapipe_df[landmark_cols]
    
    # Check for valid data
    if X.empty or X.isnull().all().all():
        print("No valid data found in landmark columns")
        return None, None, 0
        
    print(f"Shape of landmark data: {X.shape}")
    print("Sample of landmark values:")
    print(X.head())
    
    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Find optimal number of clusters
    silhouette_scores = []
    n_clusters_range = range(2, 6)
    
    for n_clusters in n_clusters_range:
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(X_scaled)
        silhouette_avg = silhouette_score(X_scaled, cluster_labels)
        silhouette_scores.append(silhouette_avg)
    
    # Plot silhouette scores
    plt.figure(figsize=(10, 6))
    plt.plot(list(n_clusters_range), silhouette_scores, marker='o')
    plt.xlabel('Number of Clusters')
    plt.ylabel('Silhouette Score')
    plt.title('Silhouette Score vs Number of Clusters')
    plt.savefig('silhouette_scores.png')
    plt.close()
    
    # Use optimal number of clusters
    optimal_clusters = n_clusters_range[np.argmax(silhouette_scores)]
    kmeans = KMeans(n_clusters=optimal_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(X_scaled)
    
    # Calculate movement intensity for each cluster
    movement_intensity = []
    for i in range(optimal_clusters):
        cluster_data = X_scaled[cluster_labels == i]
        # Calculate intensity based on the magnitude of movement
        intensity = np.mean(np.abs(cluster_data))
        movement_intensity.append(intensity)
    
    # Normalize movement intensity scores
    movement_intensity = np.array(movement_intensity)
    movement_intensity = (movement_intensity - movement_intensity.min()) / (movement_intensity.max() - movement_intensity.min())
    
    # Map clusters to risk levels based on movement intensity
    cluster_risk_mapping = {i: intensity for i, intensity in enumerate(movement_intensity)}
    movement_risk_scores = [cluster_risk_mapping[label] for label in cluster_labels]
    
    # Print cluster information
    print("\nCluster Analysis:")
    for i in range(optimal_clusters):
        cluster_size = np.sum(cluster_labels == i)
        cluster_intensity = movement_intensity[i]
        print(f"Cluster {i}: Size = {cluster_size}, Intensity = {cluster_intensity:.3f}")
    
    return movement_risk_scores, cluster_labels, optimal_clusters

def analyze_survey_data(google_forms_df):
    """Analyze survey data and calculate risk scores"""
    # Calculate risk scores
    google_forms_df['risk_score'] = google_forms_df.apply(calculate_risk_score, axis=1)
    max_possible_score = 28
    google_forms_df['normalized_risk_score'] = google_forms_df['risk_score'] / max_possible_score
    
    # Plot risk score distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(data=google_forms_df, x='normalized_risk_score', bins=20)
    plt.xlabel('Normalized Risk Score')
    plt.ylabel('Count')
    plt.title('Distribution of Risk Scores from Survey Data')
    plt.savefig('risk_score_distribution.png')
    plt.close()
    
    # Calculate risk factors correlation
    risk_factors = {
        'Fatigue': "  On a scale of 1-10, how fatigued do you feel after a typical training session?  \n 1 =No Fatigue \n10 =Extreme Fatigue  ",
        'Training Frequency': "  How often do you train per week?  ",
        'Experience': "  How many years of experience do you have in sports-related activities?  ",
        'Sleep': "How many hours of sleep do you get per night?",
        'Hydration': "Do you drink enough water before, during, and after training?",
        'Nutrition': "Do you follow a structured nutrition plan for recovery?"
    }
    
    # Create correlation matrix visualization
    plt.figure(figsize=(12, 8))
    correlation_data = []
    for factor, col in risk_factors.items():
        if col in google_forms_df.columns:
            correlation = np.corrcoef(google_forms_df['risk_score'], 
                                    pd.Categorical(google_forms_df[col]).codes)[0, 1]
            correlation_data.append({'Factor': factor, 'Correlation': correlation})
    
    correlation_df = pd.DataFrame(correlation_data)
    sns.barplot(data=correlation_df, x='Correlation', y='Factor')
    plt.title('Correlation of Risk Factors with Overall Risk Score')
    plt.savefig('risk_factor_correlation.png')
    plt.close()
    
    return google_forms_df['normalized_risk_score'].mean(), google_forms_df['normalized_risk_score'].std()

def evaluate_combined_risk():
    """Evaluate risk using both movement patterns and survey data"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load datasets
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    google_forms_path = os.path.join(current_dir, 'google_form_dataset.csv')
    
    mediapipe_df = pd.read_csv(mediapipe_path)
    google_forms_df = pd.read_csv(google_forms_path)
    
    print("\nDataset Information:")
    print(f"MediaPipe dataset shape: {mediapipe_df.shape}")
    print(f"Google Forms dataset shape: {google_forms_df.shape}")
    
    # Analyze movement patterns
    print("\nAnalyzing movement patterns...")
    movement_results = analyze_movement_patterns(mediapipe_df)
    
    if movement_results[0] is None:
        print("\nSkipping movement pattern analysis due to insufficient data")
        movement_risk_scores = []
        n_clusters = 0
    else:
        movement_risk_scores, cluster_labels, n_clusters = movement_results
    
    if len(movement_risk_scores) > 0:
        print(f"\nIdentified {n_clusters} distinct movement patterns")
        print("Movement risk score statistics:")
        print(f"Mean: {np.mean(movement_risk_scores):.3f}")
        print(f"Std: {np.std(movement_risk_scores):.3f}")
    
    # Analyze survey data
    print("\nAnalyzing survey data...")
    survey_risk_mean, survey_risk_std = analyze_survey_data(google_forms_df)
    
    print("\nSurvey risk score statistics:")
    print(f"Mean: {survey_risk_mean:.3f}")
    print(f"Std: {survey_risk_std:.3f}")
    
    if len(movement_risk_scores) > 0:
        # Plot combined risk assessment
        plt.figure(figsize=(12, 6))
        plt.subplot(1, 2, 1)
        sns.histplot(movement_risk_scores, bins=20)
        plt.xlabel('Movement Risk Score')
        plt.ylabel('Count')
        plt.title('Distribution of Movement Risk Scores')
        
        plt.subplot(1, 2, 2)
        sns.histplot(data=google_forms_df['normalized_risk_score'], bins=20)
        plt.xlabel('Survey Risk Score')
        plt.ylabel('Count')
        plt.title('Distribution of Survey Risk Scores')
        
        plt.tight_layout()
        plt.savefig('combined_risk_distribution.png')
        plt.close()
        
        # Generate risk assessment report
        print("\nRisk Assessment Summary:")
        print("-" * 50)
        print("Movement Pattern Analysis:")
        print(f"- Number of distinct movement patterns: {n_clusters}")
        print(f"- Average movement risk score: {np.mean(movement_risk_scores):.3f}")
        print(f"- Movement risk score variation: {np.std(movement_risk_scores):.3f}")
        
        # Save cluster visualization
        plt.figure(figsize=(10, 6))
        for i in range(n_clusters):
            cluster_scores = [score for score, label in zip(movement_risk_scores, cluster_labels) if label == i]
            plt.scatter(np.full_like(cluster_scores, i), cluster_scores, alpha=0.5, label=f'Cluster {i}')
        
        plt.xlabel('Cluster')
        plt.ylabel('Risk Score')
        plt.title('Risk Scores by Movement Pattern Cluster')
        plt.legend()
        plt.savefig('cluster_risk_scores.png')
        plt.close()
    
    print("\nSurvey Data Analysis:")
    print(f"- Average risk score from surveys: {survey_risk_mean:.3f}")
    print(f"- Risk score variation from surveys: {survey_risk_std:.3f}")

if __name__ == "__main__":
    evaluate_combined_risk() 