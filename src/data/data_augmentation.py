import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

def augment_mediapipe_data():
    """Augment the MediaPipe dataset to improve model performance"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    
    print("="*60)
    print("DATA AUGMENTATION FOR MEDIAPIPE DATASET")
    print("="*60)
    
    if not os.path.exists(mediapipe_path):
        print("❌ MediaPipe dataset not found!")
        return None
    
    # Load original dataset
    df = pd.read_csv(mediapipe_path)
    original_size = len(df)
    
    print(f"📊 Original dataset size: {original_size}")
    print(f"📊 Target size: {original_size * 5} (5x augmentation)")
    
    # Separate features and labels
    feature_cols = [col for col in df.columns if col != 'label']
    X = df[feature_cols]
    y = df['label']
    
    # Create augmented data
    augmented_data = []
    
    # Method 1: Add Gaussian noise
    print("\n🔄 Method 1: Adding Gaussian noise...")
    for i in range(2):  # Create 2x data with noise
        noise_factor = 0.01  # 1% noise
        noise = np.random.normal(0, noise_factor, X.shape)
        X_noisy = X + noise
        augmented_data.append(pd.concat([X_noisy, y], axis=1))
    
    # Method 2: Scaling variations
    print("🔄 Method 2: Creating scaling variations...")
    for scale_factor in [0.95, 1.05]:  # 5% scaling variations
        X_scaled = X * scale_factor
        augmented_data.append(pd.concat([X_scaled, y], axis=1))
    
    # Method 3: Random rotation (for coordinate data)
    print("🔄 Method 3: Adding coordinate variations...")
    for i in range(2):
        # Add small random variations to coordinate-like features
        coord_variation = np.random.uniform(-0.02, 0.02, X.shape)
        X_varied = X + coord_variation
        augmented_data.append(pd.concat([X_varied, y], axis=1))
    
    # Combine all augmented data
    all_data = [df] + augmented_data
    augmented_df = pd.concat(all_data, ignore_index=True)
    
    print(f"\n✅ Augmentation complete!")
    print(f"   - Original samples: {original_size}")
    print(f"   - Augmented samples: {len(augmented_df)}")
    print(f"   - Total increase: {len(augmented_df) / original_size:.1f}x")
    
    # Save augmented dataset
    augmented_path = os.path.join(current_dir, 'mediapipe_dataset_augmented.csv')
    try:
        augmented_df.to_csv(augmented_path, index=False)
        print(f"💾 Augmented dataset saved to: {augmented_path}")
    except Exception as e:
        print(f"⚠️  Warning: Could not save to {augmented_path}: {e}")
        # Try saving to current working directory
        fallback_path = 'mediapipe_dataset_augmented.csv'
        augmented_df.to_csv(fallback_path, index=False)
        print(f"💾 Augmented dataset saved to: {fallback_path}")
    
    return augmented_df

def create_synthetic_injury_data():
    """Create synthetic injury data for testing (NOT for production)"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    
    print("\n" + "="*60)
    print("SYNTHETIC INJURY DATA GENERATION")
    print("="*60)
    print("⚠️  WARNING: This is for testing only!")
    print("   Real injury data should be collected for production use.")
    
    if not os.path.exists(mediapipe_path):
        print("❌ MediaPipe dataset not found!")
        return None
    
    # Load original dataset
    df = pd.read_csv(mediapipe_path)
    feature_cols = [col for col in df.columns if col != 'label']
    
    # Create synthetic injury data by modifying healthy data
    print("\n🔄 Creating synthetic injury data...")
    
    # Method 1: Extreme joint angles (simulating poor form)
    injury_data_1 = df.copy()
    # Modify joint angle features to simulate poor form
    angle_features = [col for col in feature_cols if 'angle' in col.lower() or 'rotation' in col.lower()]
    for col in angle_features:
        injury_data_1[col] = injury_data_1[col] * np.random.uniform(1.2, 1.5, len(injury_data_1))
    injury_data_1['label'] = 'injury'
    
    # Method 2: Asymmetric movements
    injury_data_2 = df.copy()
    # Add asymmetry to left/right features
    left_features = [col for col in feature_cols if 'left' in col.lower()]
    right_features = [col for col in feature_cols if 'right' in col.lower()]
    
    for left_col, right_col in zip(left_features, right_features):
        if left_col in injury_data_2.columns and right_col in injury_data_2.columns:
            injury_data_2[left_col] = injury_data_2[left_col] * np.random.uniform(0.8, 0.9, len(injury_data_2))
            injury_data_2[right_col] = injury_data_2[right_col] * np.random.uniform(1.1, 1.2, len(injury_data_2))
    injury_data_2['label'] = 'injury'
    
    # Method 3: Unstable movements (high variance)
    injury_data_3 = df.copy()
    # Add high variance to simulate unstable movements
    for col in feature_cols:
        noise = np.random.normal(0, 0.1, len(injury_data_3))
        injury_data_3[col] = injury_data_3[col] + noise
    injury_data_3['label'] = 'injury'
    
    # Combine synthetic injury data
    synthetic_injury = pd.concat([injury_data_1, injury_data_2, injury_data_3], ignore_index=True)
    
    print(f"✅ Synthetic injury data created!")
    print(f"   - Synthetic injury samples: {len(synthetic_injury)}")
    print(f"   - Injury label distribution: {synthetic_injury['label'].value_counts()}")
    
    # Save synthetic injury data
    synthetic_path = os.path.join(current_dir, 'synthetic_injury_data.csv')
    try:
        synthetic_injury.to_csv(synthetic_path, index=False)
        print(f"💾 Synthetic injury data saved to: {synthetic_path}")
    except Exception as e:
        print(f"⚠️  Warning: Could not save to {synthetic_path}: {e}")
        # Try saving to current working directory
        fallback_path = 'synthetic_injury_data.csv'
        synthetic_injury.to_csv(fallback_path, index=False)
        print(f"💾 Synthetic injury data saved to: {fallback_path}")
    
    return synthetic_injury

def create_balanced_dataset():
    """Create a balanced dataset combining original and synthetic data"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("\n" + "="*60)
    print("CREATING BALANCED DATASET")
    print("="*60)
    
    # Load datasets
    original_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    augmented_path = os.path.join(current_dir, 'mediapipe_dataset_augmented.csv')
    synthetic_path = os.path.join(current_dir, 'synthetic_injury_data.csv')
    
    datasets = {}
    
    if os.path.exists(original_path):
        datasets['original'] = pd.read_csv(original_path)
        print(f"📊 Original dataset: {len(datasets['original'])} samples")
    
    if os.path.exists(augmented_path):
        datasets['augmented'] = pd.read_csv(augmented_path)
        print(f"📊 Augmented dataset: {len(datasets['augmented'])} samples")
    
    if os.path.exists(synthetic_path):
        datasets['synthetic'] = pd.read_csv(synthetic_path)
        print(f"📊 Synthetic injury dataset: {len(datasets['synthetic'])} samples")
    
    if not datasets:
        print("❌ No datasets found!")
        return None
    
    # Combine datasets
    combined_data = []
    
    # Add original data
    if 'original' in datasets:
        combined_data.append(datasets['original'])
    
    # Add augmented data (if available)
    if 'augmented' in datasets:
        # Use only a portion to avoid overwhelming the dataset
        augmented_sample = datasets['augmented'].sample(n=min(200, len(datasets['augmented'])), random_state=42)
        combined_data.append(augmented_sample)
    
    # Add synthetic injury data (if available)
    if 'synthetic' in datasets:
        # Use only a portion to maintain balance
        synthetic_sample = datasets['synthetic'].sample(n=min(150, len(datasets['synthetic'])), random_state=42)
        combined_data.append(synthetic_sample)
    
    # Combine all data
    balanced_df = pd.concat(combined_data, ignore_index=True)
    
    # Shuffle the data
    balanced_df = balanced_df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    print(f"\n✅ Balanced dataset created!")
    print(f"   - Total samples: {len(balanced_df)}")
    print(f"   - Label distribution:")
    for label, count in balanced_df['label'].value_counts().items():
        percentage = (count / len(balanced_df)) * 100
        print(f"     * {label}: {count} ({percentage:.1f}%)")
    
    # Save balanced dataset
    balanced_path = os.path.join(current_dir, 'balanced_dataset.csv')
    try:
        balanced_df.to_csv(balanced_path, index=False)
        print(f"💾 Balanced dataset saved to: {balanced_path}")
    except Exception as e:
        print(f"⚠️  Warning: Could not save to {balanced_path}: {e}")
        # Try saving to current working directory
        fallback_path = 'balanced_dataset.csv'
        balanced_df.to_csv(fallback_path, index=False)
        print(f"💾 Balanced dataset saved to: {fallback_path}")
    
    return balanced_df

def main():
    """Run the complete data augmentation pipeline"""
    print("🚀 Starting Data Augmentation Pipeline")
    print("="*80)
    
    # Step 1: Augment existing data
    augmented_data = augment_mediapipe_data()
    
    # Step 2: Create synthetic injury data (for testing)
    synthetic_data = create_synthetic_injury_data()
    
    # Step 3: Create balanced dataset
    balanced_data = create_balanced_dataset()
    
    print("\n" + "="*80)
    print("PIPELINE COMPLETE!")
    print("="*80)
    
    if balanced_data is not None:
        print("✅ All datasets created successfully!")
        print("\n📁 Generated files:")
        print("   - mediapipe_dataset_augmented.csv")
        print("   - synthetic_injury_data.csv")
        print("   - balanced_dataset.csv")
        
        print("\n🎯 Next steps:")
        print("   1. Use balanced_dataset.csv for model training")
        print("   2. Implement stratified sampling")
        print("   3. Add cross-validation")
        print("   4. Collect real injury data for validation")
    else:
        print("❌ Pipeline failed!")

if __name__ == "__main__":
    main() 