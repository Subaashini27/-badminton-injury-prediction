import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_curve, auc, confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf

def load_and_preprocess_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Load MediaPipe dataset
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    mediapipe_df = pd.read_csv(mediapipe_path)
    
    # Process MediaPipe data
    # Keep only the landmark coordinates and visibility scores
    X = mediapipe_df.drop(['label'], axis=1)
    
    # Create labels based on the movement type
    # Assuming higher risk movements are: smash, jump_smash
    y = (mediapipe_df['label'].isin(['smash', 'jump_smash'])).astype(int)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test

def plot_roc_curve(y_true, y_pred_proba):
    fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
    roc_auc = auc(fpr, tpr)
    
    plt.figure()
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    
    # Save the plot
    current_dir = os.path.dirname(os.path.abspath(__file__))
    plt.savefig(os.path.join(current_dir, 'roc_curve.png'))
    plt.close()
    
    return roc_auc

def plot_confusion_matrix(y_true, y_pred):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Save the plot
    current_dir = os.path.dirname(os.path.abspath(__file__))
    plt.savefig(os.path.join(current_dir, 'confusion_matrix.png'))
    plt.close()

def evaluate_model():
    print("Loading and preprocessing data...")
    X_train_scaled, X_test_scaled, y_train, y_test = load_and_preprocess_data()
    
    print("Loading model...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, '..', 'models', 'best_pose_model.h5')
    model = tf.keras.models.load_model(model_path)
    
    print("Making predictions...")
    y_pred_proba = model.predict(X_test_scaled)
    # Take the maximum probability across classes for binary classification
    y_pred_proba = y_pred_proba.max(axis=1)
    y_pred = (y_pred_proba > 0.5).astype(int)
    
    print("\nCalculating ROC curve and AUC...")
    roc_auc = plot_roc_curve(y_test, y_pred_proba)
    print(f"ROC AUC: {roc_auc:.4f}")
    
    print("\nGenerating confusion matrix...")
    plot_confusion_matrix(y_test, y_pred)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\nAccuracy:", np.mean(y_test == y_pred))

if __name__ == "__main__":
    evaluate_model() 