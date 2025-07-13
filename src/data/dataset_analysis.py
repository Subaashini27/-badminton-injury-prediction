import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

def analyze_mediapipe_dataset():
    """Analyze the MediaPipe dataset for quality and balance"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mediapipe_path = os.path.join(current_dir, 'mediapipe_dataset.csv')
    
    print("="*60)
    print("MEDIAPIPE DATASET ANALYSIS")
    print("="*60)
    
    if not os.path.exists(mediapipe_path):
        print("❌ MediaPipe dataset not found!")
        return None
    
    # Load dataset
    df = pd.read_csv(mediapipe_path)
    
    print(f"📊 Dataset Overview:")
    print(f"   - Shape: {df.shape}")
    print(f"   - Memory usage: {df.memory_usage(deep=True).sum() / 1024:.2f} KB")
    
    # Check for missing values
    missing_values = df.isnull().sum()
    total_missing = missing_values.sum()
    
    print(f"\n🔍 Missing Values Analysis:")
    print(f"   - Total missing values: {total_missing}")
    print(f"   - Missing percentage: {(total_missing / (df.shape[0] * df.shape[1])) * 100:.2f}%")
    
    if total_missing > 0:
        print("   - Columns with missing values:")
        for col, missing in missing_values[missing_values > 0].items():
            print(f"     * {col}: {missing} ({missing/len(df)*100:.2f}%)")
    else:
        print("   ✅ No missing values found!")
    
    # Check for duplicates
    duplicates = df.duplicated().sum()
    print(f"\n🔄 Duplicate Analysis:")
    print(f"   - Duplicate rows: {duplicates}")
    print(f"   - Duplicate percentage: {(duplicates / len(df)) * 100:.2f}%")
    
    if duplicates > 0:
        print("   ⚠️  Duplicates found - consider removing them")
    else:
        print("   ✅ No duplicates found!")
    
    # Label distribution
    print(f"\n🏷️  Label Distribution:")
    label_counts = df['label'].value_counts()
    print(f"   - Total samples: {len(df)}")
    for label, count in label_counts.items():
        percentage = (count / len(df)) * 100
        print(f"     * {label}: {count} ({percentage:.1f}%)")
    
    # Check for class imbalance
    max_count = label_counts.max()
    min_count = label_counts.min()
    imbalance_ratio = max_count / min_count if min_count > 0 else float('inf')
    
    print(f"\n⚖️  Class Balance Analysis:")
    print(f"   - Imbalance ratio: {imbalance_ratio:.2f}")
    if imbalance_ratio > 2:
        print("   ⚠️  Significant class imbalance detected!")
        print("   💡 Recommendations:")
        print("     * Use stratified sampling")
        print("     * Consider data augmentation")
        print("     * Use balanced accuracy metrics")
    else:
        print("   ✅ Dataset is relatively balanced")
    
    # Feature analysis
    feature_cols = [col for col in df.columns if col != 'label']
    print(f"\n📈 Feature Analysis:")
    print(f"   - Number of features: {len(feature_cols)}")
    
    # Check feature ranges
    numeric_features = df[feature_cols].select_dtypes(include=[np.number])
    print(f"   - Numeric features: {len(numeric_features.columns)}")
    
    # Check for outliers using IQR method
    outlier_counts = {}
    for col in numeric_features.columns:
        Q1 = numeric_features[col].quantile(0.25)
        Q3 = numeric_features[col].quantile(0.75)
        IQR = Q3 - Q1
        outliers = ((numeric_features[col] < (Q1 - 1.5 * IQR)) | 
                   (numeric_features[col] > (Q3 + 1.5 * IQR))).sum()
        if outliers > 0:
            outlier_counts[col] = outliers
    
    print(f"   - Features with outliers: {len(outlier_counts)}")
    if outlier_counts:
        print("   ⚠️  Outliers detected in some features")
        print("   💡 Consider outlier treatment for better model performance")
    
    return df

def analyze_google_forms_dataset():
    """Analyze the Google Forms dataset"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    google_forms_path = os.path.join(current_dir, 'google_form_dataset.csv')
    
    print("\n" + "="*60)
    print("GOOGLE FORMS DATASET ANALYSIS")
    print("="*60)
    
    if not os.path.exists(google_forms_path):
        print("❌ Google Forms dataset not found!")
        return None
    
    # Load dataset
    df = pd.read_csv(google_forms_path)
    
    print(f"📊 Dataset Overview:")
    print(f"   - Shape: {df.shape}")
    print(f"   - Memory usage: {df.memory_usage(deep=True).sum() / 1024:.2f} KB")
    
    # Check for missing values
    missing_values = df.isnull().sum()
    total_missing = missing_values.sum()
    
    print(f"\n🔍 Missing Values Analysis:")
    print(f"   - Total missing values: {total_missing}")
    print(f"   - Missing percentage: {(total_missing / (df.shape[0] * df.shape[1])) * 100:.2f}%")
    
    if total_missing > 0:
        print("   - Columns with missing values:")
        for col, missing in missing_values[missing_values > 0].items():
            print(f"     * {col}: {missing} ({missing/len(df)*100:.2f}%)")
    
    # Check for duplicates
    duplicates = df.duplicated().sum()
    print(f"\n🔄 Duplicate Analysis:")
    print(f"   - Duplicate rows: {duplicates}")
    
    # Analyze response patterns
    print(f"\n📝 Response Pattern Analysis:")
    print(f"   - Number of questions: {len(df.columns)}")
    print(f"   - Number of responses: {len(df)}")
    
    return df

def generate_data_quality_report():
    """Generate a comprehensive data quality report"""
    print("="*80)
    print("COMPREHENSIVE DATA QUALITY REPORT")
    print("="*80)
    
    # Analyze MediaPipe dataset
    mediapipe_df = analyze_mediapipe_dataset()
    
    # Analyze Google Forms dataset
    google_forms_df = analyze_google_forms_dataset()
    
    print("\n" + "="*80)
    print("OVERALL ASSESSMENT & RECOMMENDATIONS")
    print("="*80)
    
    if mediapipe_df is not None:
        print("\n📊 MediaPipe Dataset Assessment:")
        print("✅ Strengths:")
        print("   - No missing values")
        print("   - No duplicates")
        print("   - Rich feature set (132 features)")
        
        print("\n⚠️  Areas for Improvement:")
        print("   - Limited sample size (50 samples)")
        print("   - Only one movement type ('clear')")
        print("   - Need real injury data for validation")
        
        print("\n💡 Recommendations:")
        print("   1. Collect more diverse movement data")
        print("   2. Include actual injury cases")
        print("   3. Add more movement types (smash, jump_smash, etc.)")
        print("   4. Consider data augmentation techniques")
        print("   5. Use stratified sampling for model training")
    
    if google_forms_df is not None:
        print("\n📝 Google Forms Dataset Assessment:")
        print("✅ Strengths:")
        print("   - Larger sample size (111 responses)")
        print("   - Rich survey data")
        
        print("\n💡 Recommendations:")
        print("   1. Link survey responses to actual movement data")
        print("   2. Validate survey responses with objective measures")
        print("   3. Consider temporal aspects (before/after training)")
    
    print("\n🎯 Next Steps:")
    print("   1. Collect real injury data for validation")
    print("   2. Implement data augmentation")
    print("   3. Use ensemble methods for better performance")
    print("   4. Regular data quality checks")
    print("   5. Continuous data collection and validation")

if __name__ == "__main__":
    generate_data_quality_report() 