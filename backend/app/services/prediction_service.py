import os
import joblib
import pandas as pd
import json
from app.ml.config import MODELS_DIR
from app.ml.feature_engineering import apply_feature_engineering
from app.schemas.prediction import PredictRequest, PredictResponse

class PredictionService:
    _instance = None
    _pipeline = None
    _metadata = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PredictionService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            model_path = os.path.join(base_dir, "models", "property_price_model.joblib")
            metadata_path = os.path.join(base_dir, "models", "model_metadata.json")
            
            if not os.path.exists(model_path) or not os.path.exists(metadata_path):
                raise FileNotFoundError("Model artifacts not found.")
                
            self._pipeline = joblib.load(model_path)
            with open(metadata_path, 'r') as f:
                self._metadata = json.load(f)
                
            print(f"Model {self._metadata.get('model_name', 'Unknown')} loaded successfully.")
        except Exception as e:
            print(f"Failed to load model: {str(e)}")
            self._pipeline = None
            self._metadata = None

    def is_ready(self):
        return self._pipeline is not None

    def predict(self, request_data: PredictRequest) -> PredictResponse:
        if not self.is_ready():
            raise RuntimeError("Prediction model is currently unavailable.")
            
        # Convert request to single-row dataframe
        df = pd.DataFrame([request_data.dict()])
        
        # Apply feature engineering (generates floor_ratio, area_per_bhk, etc.)
        try:
            engineered_df = apply_feature_engineering(df)
        except Exception as e:
            raise RuntimeError(f"Failed to process features: {str(e)}")
            
        # Ensure we only pass required numerical + categorical features defined in metadata
        # Some are dropped in apply_feature_engineering, but just to be safe
        num_cols = self._metadata['features']['numerical']
        cat_cols = self._metadata['features']['categorical']
        
        for col in num_cols + cat_cols:
            if col not in engineered_df.columns:
                raise ValueError(f"Missing required feature after engineering: {col}")
                
        # Slice to exact required columns in case extra exist
        model_input = engineered_df[num_cols + cat_cols]
        
        # Predict
        try:
            prediction_array = self._pipeline.predict(model_input)
            predicted_price_lakh = float(prediction_array[0])
        except Exception as e:
            raise RuntimeError(f"Model inference failed: {str(e)}")
            
        # Calculate price per sqft
        if request_data.area_sqft > 0:
            price_per_sqft = (predicted_price_lakh * 100000) / request_data.area_sqft
        else:
            price_per_sqft = 0.0
            
        return PredictResponse(
            estimated_market_value_lakh=round(predicted_price_lakh, 2),
            estimated_price_per_sqft=round(price_per_sqft, 2),
            model_name=self._metadata.get("model_name", "Unknown ML Model"),
            prediction_status="Model estimate"
        )
