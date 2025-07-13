import pandas as pd
import numpy as np
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

def load_and_preprocess_data(mediapipe_path, google_form_path):
    # Load datasets
    mediapipe_df = pd.read_csv(mediapipe_path)
    google_form_df = pd.read_csv(google_form_path)
    
    # Separate features and labels
    mediapipe_X = mediapipe_df.drop('label', axis=1)
    mediapipe_y = (mediapipe_df['label'] == 'injury').astype(int)
    
    google_form_X = google_form_df.drop('label', axis=1)
    google_form_y = (google_form_df['label'] == 'injury').astype(int)
    
    # Standardize features
    scaler = StandardScaler()
    mediapipe_X_scaled = scaler.fit_transform(mediapipe_X)
    google_form_X_scaled = scaler.fit_transform(google_form_X)
    
    return mediapipe_X_scaled, mediapipe_y, google_form_X_scaled, google_form_y

def calculate_metrics(y_true, y_pred_proba):
    # Calculate ROC curve
    fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
    roc_auc = auc(fpr, tpr)
    
    # Calculate PR curve
    precision, recall, _ = precision_recall_curve(y_true, y_pred_proba)
    pr_auc = average_precision_score(y_true, y_pred_proba)
    
    return fpr, tpr, roc_auc, precision, recall, pr_auc

def plot_curves(mediapipe_metrics, google_form_metrics):
    fpr_mp, tpr_mp, roc_auc_mp, prec_mp, rec_mp, pr_auc_mp = mediapipe_metrics
    fpr_gf, tpr_gf, roc_auc_gf, prec_gf, rec_gf, pr_auc_gf = google_form_metrics
    
    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Plot ROC curves
    ax1.plot(fpr_mp, tpr_mp, label=f'MediaPipe (AUC = {roc_auc_mp:.2f})')
    ax1.plot(fpr_gf, tpr_gf, label=f'Google Form (AUC = {roc_auc_gf:.2f})')
    ax1.plot([0, 1], [0, 1], 'k--')
    ax1.set_xlabel('False Positive Rate')
    ax1.set_ylabel('True Positive Rate')
    ax1.set_title('ROC Curves')
    ax1.legend()
    ax1.grid(True)
    
    # Plot PR curves
    ax2.plot(rec_mp, prec_mp, label=f'MediaPipe (AP = {pr_auc_mp:.2f})')
    ax2.plot(rec_gf, prec_gf, label=f'Google Form (AP = {pr_auc_gf:.2f})')
    ax2.set_xlabel('Recall')
    ax2.set_ylabel('Precision')
    ax2.set_title('Precision-Recall Curves')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('evaluation_curves.png')
    plt.close()

def main():
    # Load and preprocess data
    mediapipe_X, mediapipe_y, google_form_X, google_form_y = load_and_preprocess_data(
        'src/data/mediapipe_dataset.csv',
        'src/data/google_form_dataset.csv'
    )
    
    # Load models and get predictions
    # TODO: Add model loading and prediction code here
    # For now, using random predictions for demonstration
    mediapipe_pred = np.random.random(len(mediapipe_y))
    google_form_pred = np.random.random(len(google_form_y))
    
    # Calculate metrics
    mediapipe_metrics = calculate_metrics(mediapipe_y, mediapipe_pred)
    google_form_metrics = calculate_metrics(google_form_y, google_form_pred)
    
    # Plot results
    plot_curves(mediapipe_metrics, google_form_metrics)
    
    # Print summary metrics
    print("\nMediaPipe Metrics:")
    print(f"ROC AUC: {mediapipe_metrics[2]:.3f}")
    print(f"PR AUC: {mediapipe_metrics[5]:.3f}")
    
    print("\nGoogle Form Metrics:")
    print(f"ROC AUC: {google_form_metrics[2]:.3f}")
    print(f"PR AUC: {google_form_metrics[5]:.3f}")

if __name__ == "__main__":
    main() 