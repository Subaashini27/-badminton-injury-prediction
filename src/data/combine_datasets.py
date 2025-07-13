import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam
import os

def load_mediapipe_dataset(mediapipe_path):
    """
    Load the MediaPipe dataset
    Expected format: CSV with pose keypoints and labels
    """
    try:
        df = pd.read_csv(mediapipe_path)
        # Assuming the last column is the label
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        return X, y
    except Exception as e:
        print(f"Error loading MediaPipe dataset: {e}")
        return None, None

def load_google_form_dataset(google_form_path):
    """
    Load the Google Form dataset
    Expected format: CSV with pose keypoints and labels
    """
    try:
        df = pd.read_csv(google_form_path)
        # Assuming the last column is the label
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        return X, y
    except Exception as e:
        print(f"Error loading Google Form dataset: {e}")
        return None, None

def combine_datasets(X1, y1, X2, y2):
    """
    Combine two datasets and ensure they have the same structure
    """
    if X1 is None or X2 is None:
        return None, None
    
    # Combine features
    X_combined = np.vstack((X1, X2))
    y_combined = np.concatenate((y1, y2))
    
    return X_combined, y_combined

def preprocess_data(X, y):
    """
    Preprocess the combined dataset
    """
    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )
    
    return X_train, X_test, y_train, y_test, scaler

def create_model(input_shape):
    """
    Create a new model with the same architecture as the original
    """
    model = Sequential([
        Dense(128, activation='relu', input_shape=input_shape),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def main():
    # Paths to your datasets
    mediapipe_path = "path/to/your/mediapipe_dataset.csv"
    google_form_path = "path/to/your/google_form_dataset.csv"
    model_path = "../models/best_pose_model.h5"
    
    # Load datasets
    print("Loading datasets...")
    X_mediapipe, y_mediapipe = load_mediapipe_dataset(mediapipe_path)
    X_google, y_google = load_google_form_dataset(google_form_path)
    
    # Combine datasets
    print("Combining datasets...")
    X_combined, y_combined = combine_datasets(X_mediapipe, y_mediapipe, X_google, y_google)
    
    if X_combined is None:
        print("Failed to combine datasets. Please check your data files.")
        return
    
    # Preprocess data
    print("Preprocessing data...")
    X_train, X_test, y_train, y_test, scaler = preprocess_data(X_combined, y_combined)
    
    # Load the existing model
    print("Loading existing model...")
    try:
        model = load_model(model_path)
        print("Successfully loaded existing model")
    except:
        print("Creating new model...")
        model = create_model((X_train.shape[1],))
    
    # Train the model
    print("Training model...")
    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.2,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True
            )
        ]
    )
    
    # Evaluate the model
    print("Evaluating model...")
    test_loss, test_accuracy = model.evaluate(X_test, y_test)
    print(f"Test accuracy: {test_accuracy:.4f}")
    
    # Save the new model
    print("Saving model...")
    model.save(model_path)
    print(f"Model saved to {model_path}")
    
    # Save the scaler
    import joblib
    joblib.dump(scaler, 'pose_scaler.joblib')
    print("Scaler saved as pose_scaler.joblib")

if __name__ == "__main__":
    main() 