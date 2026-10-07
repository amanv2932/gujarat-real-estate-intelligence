import joblib
import json
import os
import datetime

def save_model(model, metadata, model_dir, model_name="property_price_model"):
    """Saves the trained model and metadata."""
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, f"{model_name}.joblib")
    joblib.dump(model, model_path)
    
    metadata_path = os.path.join(model_dir, "model_metadata.json")
    metadata["training_date"] = datetime.datetime.now().isoformat()
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Model saved to {model_path}")
    print(f"Metadata saved to {metadata_path}")
