from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from dotenv import load_dotenv

from app.services.dataset_service import DatasetService
from app.services.prediction_service import PredictionService
from app.schemas.property import (
    PropertyDetail, 
    PropertyListResponse, 
    DatasetInfo, 
    FilterOptions,
    ErrorResponse
)
from app.schemas.prediction import PredictRequest, PredictResponse, DealAnalysisRequest, DealAnalysisResponse
from app.services.deal_intelligence_service import DealIntelligenceService
from app.services.market_service import MarketService
from app.services.development_service import DevelopmentService
from app.schemas.market import (
    MarketOverview, CityAnalytics, LocalityAnalytics, PropertyTypeAnalytics, 
    BhkAnalytics, FurnishingAnalytics, PriceDistributionBucket, AreaPriceDataPoint
)
from app.schemas.development import (
    DevelopmentOverview, ReraLocalityAnalysis, TpScheme, LocalityDevelopmentInfo, DevelopmentSignal
)
from app.schemas.investment import InvestmentAnalysisRequest, InvestmentAnalysisResponse
from app.services.investment_service import InvestmentService

load_dotenv()

app = FastAPI(title="Gujarat Real Estate Intelligence API")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dataset_service = None
prediction_service = None
market_service = None
development_service = None

@app.on_event("startup")
async def startup_event():
    global dataset_service, prediction_service, market_service, development_service
    try:
        dataset_service = DatasetService()
        market_service = MarketService()
        development_service = DevelopmentService()
    except Exception as e:
        print(f"Failed to load dataset on startup: {str(e)}")
        raise e
        
    try:
        prediction_service = PredictionService()
    except Exception as e:
        print(f"Failed to load prediction service on startup: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Gujarat Real Estate Intelligence API is running"
    }

@app.get("/api/dataset/info", response_model=DatasetInfo)
async def get_dataset_info():
    if not dataset_service:
        raise HTTPException(status_code=503, detail="Dataset service unavailable")
    return dataset_service.get_info()

@app.get("/api/properties/filters", response_model=FilterOptions)
async def get_filters():
    if not dataset_service:
        raise HTTPException(status_code=503, detail="Dataset service unavailable")
    return dataset_service.get_filters()

@app.get("/api/properties", response_model=PropertyListResponse)
async def list_properties(
    city: Optional[str] = None,
    locality: Optional[str] = None,
    property_type: Optional[str] = None,
    bhk: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    if not dataset_service:
        raise HTTPException(status_code=503, detail="Dataset service unavailable")
        
    result = dataset_service.get_properties(
        city=city,
        locality=locality,
        property_type=property_type,
        bhk=bhk,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        page=page,
        limit=limit
    )
    return result

@app.get("/api/properties/{property_id}", response_model=PropertyDetail, responses={404: {"model": ErrorResponse}})
async def get_property(property_id: str):
    if not dataset_service:
        raise HTTPException(status_code=503, detail="Dataset service unavailable")
        
    prop = dataset_service.get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    return prop

@app.post("/api/predict/property-value", response_model=PredictResponse)
async def predict_property_value(request: PredictRequest):
    if not prediction_service or not prediction_service.is_ready():
        raise HTTPException(status_code=503, detail="Prediction service is currently unavailable.")
        
    try:
        result = prediction_service.predict(request)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail="Unable to generate valuation.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Please check the property details and try again.")

@app.post("/api/deal-analysis", response_model=DealAnalysisResponse)
async def analyze_deal(request: DealAnalysisRequest):
    if not prediction_service or not prediction_service.is_ready():
        raise HTTPException(status_code=503, detail="Prediction service is currently unavailable.")
        
    try:
        # 1. Get base ML prediction (converts request to standard prediction request implicitly based on fields)
        predict_request = PredictRequest(**request.dict(exclude={'asking_price_lakh'}))
        prediction_result = prediction_service.predict(predict_request)
        
        # 2. Get Deal Intelligence
        deal_info = DealIntelligenceService.analyze_deal(
            estimated_market_value_lakh=prediction_result.estimated_market_value_lakh,
            asking_price_lakh=request.asking_price_lakh
        )
        
        # 3. Combine response
        return DealAnalysisResponse(
            **prediction_result.dict(),
            **deal_info
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail="Unable to generate valuation.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Please check the property details and try again.")

# --- Market Intelligence APIs ---

@app.get("/api/market/overview", response_model=MarketOverview)
async def get_market_overview(
    city: Optional[str] = None, 
    property_type: Optional[str] = None, 
    bhk: Optional[int] = None, 
    locality: Optional[str] = None
):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_overview(city, property_type, bhk, locality)

@app.get("/api/market/cities", response_model=List[CityAnalytics])
async def get_market_cities():
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_cities_analytics()

@app.get("/api/market/localities", response_model=List[LocalityAnalytics])
async def get_market_localities(city: Optional[str] = None, limit: int = 50):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_localities_analytics(city, limit)

@app.get("/api/market/property-types", response_model=List[PropertyTypeAnalytics])
async def get_market_property_types(city: Optional[str] = None):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_property_types_analytics(city)

@app.get("/api/market/bhk", response_model=List[BhkAnalytics])
async def get_market_bhk(city: Optional[str] = None):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_bhk_analytics(city)

@app.get("/api/market/furnishing", response_model=List[FurnishingAnalytics])
async def get_market_furnishing(city: Optional[str] = None):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_furnishing_analytics(city)

@app.get("/api/market/price-distribution", response_model=List[PriceDistributionBucket])
async def get_market_price_distribution(city: Optional[str] = None):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_price_distribution(city)

@app.get("/api/market/area-price", response_model=List[AreaPriceDataPoint])
async def get_market_area_price(city: Optional[str] = None):
    if not market_service: raise HTTPException(status_code=503)
    return market_service.get_area_price_scatter(city)

@app.get("/api/market/filters", response_model=FilterOptions)
async def get_market_filters():
    if not dataset_service: raise HTTPException(status_code=503)
    return dataset_service.get_filters()

# --- Development Intelligence APIs ---

@app.get("/api/development/overview", response_model=DevelopmentOverview)
async def get_development_overview():
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_overview()

@app.get("/api/development/rera-projects")
async def get_development_rera_projects(
    locality: Optional[str] = None,
    project_type: Optional[str] = None,
    project_status: Optional[str] = None,
    tp_scheme: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_rera_projects(locality, project_type, project_status, tp_scheme, page, limit)

@app.get("/api/development/rera-localities", response_model=List[ReraLocalityAnalysis])
async def get_development_rera_localities():
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_rera_localities()

@app.get("/api/development/tp-schemes", response_model=List[TpScheme])
async def get_development_tp_schemes():
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_tp_schemes()

@app.get("/api/development/zones")
async def get_development_zones():
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_dp_zones()

@app.get("/api/development/signals", response_model=List[DevelopmentSignal])
async def get_development_signals():
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_signals()

@app.get("/api/development/location/{locality}", response_model=LocalityDevelopmentInfo)
async def get_development_location(locality: str):
    if not development_service: raise HTTPException(status_code=503)
    return development_service.get_location_intelligence(locality)

# --- Investment Intelligence APIs ---

@app.post("/api/investment-analysis", response_model=InvestmentAnalysisResponse)
async def analyze_investment(request: InvestmentAnalysisRequest):
    try:
        return InvestmentService.analyze_investment(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
