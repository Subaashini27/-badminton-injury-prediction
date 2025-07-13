import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
import tensorflow as tf
import warnings
warnings.filterwarnings('ignore')

def load_and_analyze_data():
    """Load and analyze the available datasets"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("="*60)
    print("COMPREHENSIVE MODEL EVALUATION")
    print("="*60)
    
    # Load MediaPipe dataset
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    if os.path.exists(mediapipe_path):
        mediapipe_df = pd.read_csv(mediapipe_path)
        print(f"\nMediaPipe Dataset:")
        print(f"- Shape: {mediapipe_df.shape}")
        print(f"- Labels: {mediapipe_df['label'].value_counts().to_dict()}")
    else:
        print("MediaPipe dataset not found")
        mediapipe_df = None
    
    # Load Google Forms dataset
    google_forms_path = os.path.join(current_dir, 'google_form_dataset.csv')
    if os.path.exists(google_forms_path):
        google_forms_df = pd.read_csv(google_forms_path)
        print(f"\nGoogle Forms Dataset:")
        print(f"- Shape: {google_forms_df.shape}")
        print(f"- Columns: {len(google_forms_df.columns)}")
    else:
        print("Google Forms dataset not found")
        google_forms_df = None
    
    return mediapipe_df, google_forms_df

def create_synthetic_labels(mediapipe_df):
    """Create synthetic labels for evaluation since we only have 'clear' movements"""
    print("\nCreating synthetic labels for evaluation...")
    
    # Extract features
    X = mediapipe_df.drop(['label'], axis=1)
    
    # Create synthetic labels based on movement patterns
    # We'll use the magnitude of movement as a proxy for injury risk
    movement_magnitude = np.sqrt(np.sum(X**2, axis=1))
    
    # Create synthetic labels: higher magnitude = higher injury risk
    threshold = np.percentile(movement_magnitude, 70)  # Top 30% as high risk
    synthetic_labels = (movement_magnitude > threshold).astype(int)
    
    print(f"Synthetic label distribution:")
    print(f"- Low risk (0): {np.sum(synthetic_labels == 0)}")
    print(f"- High risk (1): {np.sum(synthetic_labels == 1)}")
    
    return X, synthetic_labels

def evaluate_traditional_models(X, y):
    """Evaluate traditional machine learning models"""
    print("\n" + "="*50)
    print("TRADITIONAL ML MODELS EVALUATION")
    print("="*50)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Define models
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\nEvaluating {name}...")
        
        # Train model
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='accuracy')
        
        results[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
        
        print(f"  Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall: {recall:.4f}")
        print(f"  F1-Score: {f1:.4f}")
        print(f"  CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
    
    return results

def evaluate_neural_network(X, y):
    """Evaluate the neural network model"""
    print("\n" + "="*50)
    print("NEURAL NETWORK MODEL EVALUATION")
    print("="*50)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Load the trained model
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, '..', 'models', 'best_pose_model.h5')
    
    try:
        model = tf.keras.models.load_model(model_path)
        print("Loaded trained neural network model")
        
        # Make predictions
        y_pred_proba = model.predict(X_test_scaled)
        
        # Handle different output formats
        if len(y_pred_proba.shape) > 1 and y_pred_proba.shape[1] > 1:
            y_pred_proba = y_pred_proba.max(axis=1)
        
        y_pred = (y_pred_proba > 0.5).astype(int)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        print(f"Neural Network Results:")
        print(f"  Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall: {recall:.4f}")
        print(f"  F1-Score: {f1:.4f}")
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
        
    except Exception as e:
        print(f"Error loading neural network model: {e}")
        return None

def generate_comprehensive_report(traditional_results, nn_results, X, y):
    """Generate a comprehensive evaluation report"""
    print("\n" + "="*60)
    print("COMPREHENSIVE EVALUATION REPORT")
    print("="*60)
    
    # Compare all models
    all_results = traditional_results.copy()
    if nn_results:
        all_results['Neural Network'] = nn_results
    
    print("\nModel Performance Comparison:")
    print("-" * 80)
    print(f"{'Model':<20} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12}")
    print("-" * 80)
    
    best_model = None
    best_accuracy = 0
    
    for name, results in all_results.items():
        print(f"{name:<20} {results['accuracy']:<12.4f} {results['precision']:<12.4f} "
              f"{results['recall']:<12.4f} {results['f1']:<12.4f}")
        
        if results['accuracy'] > best_accuracy:
            best_accuracy = results['accuracy']
            best_model = name
    
    print("-" * 80)
    print(f"Best performing model: {best_model} (Accuracy: {best_accuracy:.4f})")
    
    # Detailed analysis of best model
    if best_model and best_model in all_results:
        best_results = all_results[best_model]
        print(f"\nDetailed Analysis - {best_model}:")
        print(f"- Overall Accuracy: {best_results['accuracy']:.4f} ({best_results['accuracy']*100:.2f}%)")
        print(f"- Precision: {best_results['precision']:.4f}")
        print(f"- Recall: {best_results['recall']:.4f}")
        print(f"- F1-Score: {best_results['f1']:.4f}")
        
        if 'cv_mean' in best_results:
            print(f"- Cross-validation Accuracy: {best_results['cv_mean']:.4f} (+/- {best_results['cv_std']*2:.4f})")
    
    # Risk assessment
    print(f"\nRisk Assessment:")
    print(f"- Dataset size: {len(X)} samples")
    print(f"- Feature count: {X.shape[1]} features")
    print(f"- Class distribution: {np.bincount(y)}")
    
    # Recommendations
    print(f"\nRecommendations:")
    if best_accuracy < 0.7:
        print("- Model accuracy is below 70%. Consider:")
        print("  * Collecting more diverse training data")
        print("  * Including actual injury cases")
        print("  * Feature engineering")
        print("  * Hyperparameter tuning")
    else:
        print("- Model shows good performance")
    
    print("- For production use, validate with real injury data")
    print("- Consider ensemble methods for improved robustness")

def main():
    """Main evaluation function"""
    # Load and analyze data
    mediapipe_df, google_forms_df = load_and_analyze_data()
    
    if mediapipe_df is None:
        print("No MediaPipe data available for evaluation")
        return
    
    # Create synthetic labels for evaluation
    X, y = create_synthetic_labels(mediapipe_df)
    
    # Evaluate traditional models
    traditional_results = evaluate_traditional_models(X, y)
    
    # Evaluate neural network
    nn_results = evaluate_neural_network(X, y)
    
    # Generate comprehensive report
    generate_comprehensive_report(traditional_results, nn_results, X, y)

if __name__ == "__main__":
    main() 