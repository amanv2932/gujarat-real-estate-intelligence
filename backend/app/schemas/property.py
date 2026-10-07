from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PropertyBase(BaseModel):
    property_id: str
    city: str
    locality: str
    property_type: str
    area_sqft: float
    bhk: int
    price_lakh: float
    price_per_sqft: float

class PropertyDetail(PropertyBase):
    data_source: str
    synthetic_method: str
    project_name: str
    bathrooms: int
    floor_current: int
    total_floors: int
    transaction_type: str
    furnishing: str
    facing: str
    status: str
    age_years: int
    lift_available: int
    jantri_rate_per_sqft: float
    estimated_market_value_lakh: float
    estimated_low_lakh: float
    estimated_high_lakh: float
    deal_score: float
    development_score: float
    development_potential: str
    tp_scheme: str
    rera_project_match: int
    data_quality_flag: str

class PropertyListResponse(BaseModel):
    data: List[PropertyDetail]
    total_records: int
    current_page: int
    total_pages: int
    limit: int

class DatasetInfo(BaseModel):
    total_properties: int
    total_columns: int
    columns: List[str]
    cities: List[str]
    property_types: List[str]
    data_sources: Dict[str, int]

class FilterOptions(BaseModel):
    cities: List[str]
    localities: List[str]
    property_types: List[str]
    bhk_options: List[int]
    furnishing_options: List[str]
    transaction_types: List[str]
    facing_options: List[str]

class ErrorResponse(BaseModel):
    detail: str
