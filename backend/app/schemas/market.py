from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MarketOverview(BaseModel):
    total_properties: int
    cities_count: int
    localities_count: int
    average_price_lakh: float
    median_price_lakh: float
    average_price_per_sqft: float
    median_price_per_sqft: float
    minimum_price_lakh: float
    maximum_price_lakh: float

class CityAnalytics(BaseModel):
    city: str
    property_count: int
    average_price_lakh: float
    median_price_lakh: float
    average_price_per_sqft: float
    median_price_per_sqft: float
    average_area_sqft: float

class LocalityAnalytics(BaseModel):
    locality: str
    city: str
    property_count: int
    average_price_lakh: float
    median_price_lakh: float
    average_price_per_sqft: float
    median_price_per_sqft: float
    average_area_sqft: float

class PropertyTypeAnalytics(BaseModel):
    property_type: str
    property_count: int
    average_price_lakh: float
    median_price_lakh: float
    average_price_per_sqft: float
    average_area_sqft: float

class BhkAnalytics(BaseModel):
    bhk: int
    property_count: int
    average_price_lakh: float
    median_price_lakh: float
    average_price_per_sqft: float
    average_area_sqft: float

class FurnishingAnalytics(BaseModel):
    furnishing: str
    property_count: int
    average_price_lakh: float
    average_price_per_sqft: float

class PriceDistributionBucket(BaseModel):
    bucket: str
    property_count: int

class AreaPriceDataPoint(BaseModel):
    area_sqft: float
    price_lakh: float
    city: str
