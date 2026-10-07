import pandas as pd
import numpy as np

def apply_feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Creates derived features and aligns frontend schema to model features."""
    df = df.copy()
    
    # Map frontend API fields to new dataset model features
    if 'property_type' in df.columns and 'property_type_std' not in df.columns:
        df['property_type_std'] = df['property_type']
    
    if 'furnishing' in df.columns and 'furnishing_status' not in df.columns:
        df['furnishing_status'] = df['furnishing']
        
    if 'status' in df.columns and 'construction_status' not in df.columns:
        df['construction_status'] = df['status']
        
    if 'parking_available' not in df.columns:
        df['parking_available'] = 1
        
    if 'district' not in df.columns:
        df['district'] = df.get('city', 'Unknown')
        
    if 'region' not in df.columns:
        df['region'] = df.get('city', 'Unknown')
        
    if 'latitude' not in df.columns:
        df['latitude'] = 23.0225
        
    if 'longitude' not in df.columns:
        df['longitude'] = 72.5714
    
    return df
