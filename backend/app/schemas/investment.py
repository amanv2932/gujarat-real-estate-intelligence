from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class InvestmentAnalysisRequest(BaseModel):
    property_value_lakh: float = Field(..., gt=0, description="Current property value in Lakhs")
    monthly_rent: Optional[float] = Field(None, ge=0, description="Monthly rent in INR")
    annual_rent: Optional[float] = Field(None, ge=0, description="Annual rent in INR")
    holding_period_years: int = Field(..., gt=0, description="Holding period in years")
    expected_annual_appreciation_percent: Optional[float] = Field(None, description="Expected annual appreciation percentage")
    annual_expense_percent: Optional[float] = Field(None, ge=0, description="Annual expenses as percentage of rent")
    transaction_cost_percent: Optional[float] = Field(None, ge=0, description="Transaction cost as percentage of property value")

class InvestmentScoreFactor(BaseModel):
    factor: str
    impact: str
    explanation: str

class InvestmentAnalysisResponse(BaseModel):
    current_property_value_lakh: float
    annual_rent_lakh: Optional[float]
    gross_rental_yield_percent: Optional[float]
    net_rental_yield_percent: Optional[float]
    future_value_conservative_lakh: Optional[float]
    future_value_base_lakh: Optional[float]
    future_value_optimistic_lakh: Optional[float]
    cumulative_rent_lakh: Optional[float]
    transaction_cost_lakh: Optional[float]
    estimated_total_return_lakh: Optional[float]
    estimated_roi_percent: Optional[float]
    investment_score: Optional[int]
    investment_category: Optional[str]
    factors: List[InvestmentScoreFactor]
    assumptions: Dict[str, Any]
    warnings: List[str]
