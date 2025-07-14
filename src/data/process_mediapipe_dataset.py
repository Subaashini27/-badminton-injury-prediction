import os
import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
from tqdm import tqdm
import time

def extract_pose_landmarks(image_path):
    """
    Extract pose landmarks from an image using MediaPipe
    """
    try:
        # Initialize MediaPipe Pose
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Read and process the image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Failed to read image: {image_path}")
            return None
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process the image
        results = pose.process(image_rgb)
        
        if not results.pose_landmarks:
            print(f"No pose landmarks detected in: {image_path}")
            return None
        
        # Extract landmarks
        landmarks = results.pose_landmarks.landmark
        
        # Convert landmarks to a flat list of coordinates
        pose_data = []
        for landmark in landmarks:
            pose_data.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
        
        return pose_data
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")
        return None

def get_label_from_filename(filename):
    """
    Extract the label from the filename
    """
    try:
        # Remove file extension and Roboflow suffix
        base_name = os.path.splitext(filename)[0]
        base_name = base_name.split('_rf.')[0]
        
        # Extract the main label (e.g., 'smash', 'serve-backhand', etc.)
        label = base_name.split('-')[0]
        
        return label
    except Exception as e:
        print(f"Error extracting label from {filename}: {str(e)}")
        return None

def process_dataset(batch_size=50):
    """
    Process all images in the dataset and create a CSV file
    """
    # Path to the dataset
    dataset_path = os.path.join(os.path.dirname(__file__), 'train')
    
    # Initialize lists to store data
    pose_data_list = []
    labels = []
    
    # Get all image files
    image_files = [f for f in os.listdir(dataset_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    total_files = len(image_files)
    
    print(f"Found {total_files} images to process")
    
    # Process images in batches
    for i in range(0, total_files, batch_size):
        batch_files = image_files[i:i + batch_size]
        
        # Process each image in the batch
        for image_file in tqdm(batch_files, desc=f"Processing batch {i//batch_size + 1}"):
            image_path = os.path.join(dataset_path, image_file)
            
            # Extract pose landmarks
            pose_data = extract_pose_landmarks(image_path)
            
            if pose_data is not None:
                # Get label from filename
                label = get_label_from_filename(image_file)
                
                if label is not None:
                    # Add to lists
                    pose_data_list.append(pose_data)
                    labels.append(label)
        
        # Add a small delay between batches to prevent overheating
        time.sleep(1)

    # Save results after all batches are processed
    if pose_data_list:
        # Create column names for the DataFrame
        columns = []
        for j in range(len(pose_data_list[0]) // 4):  # 4 values per landmark (x, y, z, visibility)
            columns.extend([
                f'landmark_{j}_x',
                f'landmark_{j}_y',
                f'landmark_{j}_z',
                f'landmark_{j}_visibility'
            ])
        
        # Create DataFrame
        df = pd.DataFrame(pose_data_list, columns=columns)
        df['label'] = labels
        
        # Save to CSV
        output_path = os.path.join(os.path.dirname(__file__), 'mediapipe_dataset.csv')
        df.to_csv(output_path, index=False)
        
        print(f"\nProcessing complete!")
        print(f"Total samples processed: {len(df)}")
        print(f"Dataset saved to: {output_path}")
    else:
        print("No valid pose data was extracted from the images.")

if __name__ == "__main__":
    process_dataset(batch_size=50) 