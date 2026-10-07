# Configuration for ML Pipeline
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_PATH = os.path.join(BASE_DIR, "data", "gujarat final.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

TARGET = "price_lakh"

# Features that directly leak the target
LEAKAGE_FEATURES = [
    "price_per_sqft",
    "estimated_market_value_lakh",
    "estimated_low_lakh",
    "estimated_high_lakh",
    "deal_score",  # deal_score might be derived from price vs estimated value
]

# Identifiers / Non-predictive
DROP_FEATURES = [
    "property_id",
    "project_name",
    "data_source",
    "synthetic_method",
    "data_quality_flag"
]

NUMERICAL_FEATURES = [
    "area_sqft",
    "bhk",
    "bathrooms",
    "floor_current",
    "total_floors",
    "age_years",
    "lift_available",
    "jantri_rate_per_sqft",
    "development_score",
    "rera_project_match"
]

CATEGORICAL_FEATURES = [
    "city",
    "locality",
    "property_type",
    "transaction_type",
    "furnishing",
    "facing",
    "status",
    "development_potential",
    "tp_scheme"
]

RANDOM_SEED = 42
TEST_SIZE = 0.2
