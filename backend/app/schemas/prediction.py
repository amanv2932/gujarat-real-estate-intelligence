from pydantic import BaseModel, Field, root_validator
from typing import Optional

class PredictRequest(BaseModel):
    # Location
    city: str
    locality: str
    
    # Details
    property_type: str
    area_sqft: float = Field(gt=0, description="Area must be positive")
    bhk: int = Field(ge=0, description="BHK cannot be negative")
    bathrooms: int = Field(ge=0, description="Bathrooms cannot be negative")
    floor_current: int = Field(ge=0, description="Floor cannot be negative")
    total_floors: int = Field(ge=0, description="Total floors cannot be negative")
    age_years: int = Field(ge=0, description="Age cannot be negative")
    lift_available: int = Field(ge=0, description="0 or 1 for lift availability")
    furnishing: str
    facing: str
    status: str
    transaction_type: str
    
    # Market/Dev
    jantri_rate_per_sqft: float = Field(ge=0, description="Jantri rate cannot be negative")
    development_score: float = Field(ge=0, description="Development score cannot be negative")
    rera_project_match: int = Field(ge=0, description="0 or 1")
    development_potential: str
    tp_scheme: str

    @root_validator(skip_on_failure=True)
    def validate_floors(cls, values):
        floor = values.get('floor_current')
        total = values.get('total_floors')
        
        if floor is not None and total is not None and floor > total:
            raise ValueError('floor_current cannot exceed total_floors')
        return values

class PredictResponse(BaseModel):
    estimated_market_value_lakh: float
    estimated_price_per_sqft: float
    model_name: str
    prediction_status: str

class DealAnalysisRequest(PredictRequest):
    asking_price_lakh: float = Field(gt=0, description="Asking price must be positive")

class DealAnalysisResponse(PredictResponse):
    asking_price_lakh: float
    price_difference_lakh: float
    price_difference_percent: float
    deal_score: int
    deal_status: str
    negotiation_range_low_lakh: float
    negotiation_range_high_lakh: float
    explanation: str
