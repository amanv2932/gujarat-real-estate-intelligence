import joblib
import pandas as pd
from app.ml.config import MODELS_DIR, DATA_PATH
from app.ml.feature_engineering import apply_feature_engineering
import os
import json

def validate_model():
    model_path = os.path.join(MODELS_DIR, "property_price_model.joblib")
    pipeline = joblib.load(model_path)
    
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
        
    df = pd.read_csv(DATA_PATH)
    
    # Take the last 10 rows to simulate inference on new/unseen-like data
    sample = df.tail(10)
    
    # Apply standard feature engineering
    engineered = apply_feature_engineering(sample)
    
    # Perform prediction
    predictions = pipeline.predict(engineered)
    
    print("Validation Successful.")
    print("Model was loaded properly and predicted values:")
    for real, pred in zip(sample['price_lakh'], predictions):
        print(f"Real: {real:.2f} -> Predicted: {pred:.2f}")

if __name__ == "__main__":
    validate_model()
