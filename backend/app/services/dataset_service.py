import pandas as pd
import os
from typing import Dict, Any, List, Optional
import math

class DatasetService:
    _instance = None
    _df = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatasetService, cls).__new__(cls)
            cls._instance._load_dataset()
        return cls._instance
        
    def _load_dataset(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        dataset_path = os.getenv("DATASET_PATH", os.path.join(base_dir, 'data', 'gujarat final.csv'))
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset not found at {dataset_path}")
            
        try:
            self._df = pd.read_csv(dataset_path, low_memory=False)
            self._validate_dataset()
        except Exception as e:
            raise RuntimeError(f"Failed to load dataset: {str(e)}")
            
    def _validate_dataset(self):
        if self._df is None or self._df.empty:
            raise ValueError("Dataset is empty.")
            
        if "property_id" not in self._df.columns:
            raise ValueError("Missing 'property_id' column.")
            
        if not self._df["property_id"].is_unique:
            raise ValueError("property_id column contains duplicates.")
            
        # Removed null check as new dataset has valid nulls
            
    def get_info(self) -> Dict[str, Any]:
        return {
            "total_properties": len(self._df),
            "total_columns": len(self._df.columns),
            "columns": self._df.columns.tolist(),
            "cities": self._df["city"].unique().tolist() if "city" in self._df.columns else [],
            "property_types": self._df["property_type"].unique().tolist() if "property_type" in self._df.columns else [],
            "data_sources": self._df["data_source"].value_counts().to_dict() if "data_source" in self._df.columns else {}
        }
        
    def get_filters(self) -> Dict[str, List[Any]]:
        furnishing_col = "furnishing_status" if "furnishing_status" in self._df.columns else "furnishing"
        return {
            "cities": sorted(self._df["city"].dropna().unique().tolist()) if "city" in self._df.columns else [],
            "localities": sorted(self._df["locality"].dropna().unique().tolist()) if "locality" in self._df.columns else [],
            "property_types": sorted(self._df["property_type"].dropna().unique().tolist()) if "property_type" in self._df.columns else [],
            "bhk_options": sorted(self._df["bhk"].dropna().unique().tolist()) if "bhk" in self._df.columns else [],
            "furnishing_options": sorted(self._df[furnishing_col].dropna().unique().tolist()) if furnishing_col in self._df.columns else [],
            "transaction_types": sorted(self._df["transaction_type"].dropna().unique().tolist()) if "transaction_type" in self._df.columns else [],
            "facing_options": sorted(self._df["facing"].dropna().unique().tolist()) if "facing" in self._df.columns else []
        }
        
    def get_property_by_id(self, property_id: str) -> Optional[Dict[str, Any]]:
        record = self._df[self._df["property_id"] == property_id]
        if record.empty:
            return None
        record_dict = record.iloc[0].to_dict()
        return {k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in record_dict.items()}
        
    def get_properties(
        self, 
        city: str = None, 
        locality: str = None, 
        property_type: str = None, 
        bhk: int = None, 
        min_price: float = None, 
        max_price: float = None,
        min_area: float = None,
        max_area: float = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        filtered_df = self._df.copy()
        
        if city:
            filtered_df = filtered_df[filtered_df["city"].str.lower() == city.lower()]
        if locality:
            filtered_df = filtered_df[filtered_df["locality"].str.lower() == locality.lower()]
        if property_type:
            filtered_df = filtered_df[filtered_df["property_type"].str.lower() == property_type.lower()]
        if bhk is not None:
            filtered_df = filtered_df[filtered_df["bhk"] == bhk]
        if min_price is not None:
            filtered_df = filtered_df[filtered_df["price_lakh"] >= min_price]
        if max_price is not None:
            filtered_df = filtered_df[filtered_df["price_lakh"] <= max_price]
        if min_area is not None:
            filtered_df = filtered_df[filtered_df["area_sqft"] >= min_area]
        if max_area is not None:
            filtered_df = filtered_df[filtered_df["area_sqft"] <= max_area]
            
        total_records = len(filtered_df)
        total_pages = math.ceil(total_records / limit) if limit > 0 else 1
        
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_df = filtered_df.iloc[start_idx:end_idx]
        records = paginated_df.to_dict(orient='records')
        
        return {
            "data": records,
            "total_records": total_records,
            "current_page": page,
            "total_pages": total_pages,
            "limit": limit
        }
