import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from fastapi.testclient import TestClient
from app.main import app

print("Starting API tests...")

# Sample properties
test_cases = [
    {
        "city": "Ahmedabad",
        "locality": "Bopal",
        "property_type": "Apartment",
        "area_sqft": 1500,
        "bhk": 3,
        "bathrooms": 3,
        "floor_current": 5,
        "total_floors": 10,
        "age_years": 2,
        "lift_available": 1,
        "furnishing": "Semi-Furnished",
        "facing": "East",
        "status": "Ready to Move",
        "transaction_type": "Resale",
        "jantri_rate_per_sqft": 4000.0,
        "development_score": 8.0,
        "rera_project_match": 1,
        "development_potential": "High",
        "tp_scheme": "TP 1"
    },
    {
        "city": "Surat",
        "locality": "Vesu",
        "property_type": "Independent House",
        "area_sqft": 2500,
        "bhk": 4,
        "bathrooms": 4,
        "floor_current": 1,
        "total_floors": 2,
        "age_years": 5,
        "lift_available": 0,
        "furnishing": "Furnished",
        "facing": "North",
        "status": "Ready to Move",
        "transaction_type": "New Property",
        "jantri_rate_per_sqft": 5000.0,
        "development_score": 7.5,
        "rera_project_match": 0,
        "development_potential": "Medium",
        "tp_scheme": "TP 2"
    },
    {
        "city": "Vadodara",
        "locality": "Alkapuri",
        "property_type": "Apartment",
        "area_sqft": 1100,
        "bhk": 2,
        "bathrooms": 2,
        "floor_current": 3,
        "total_floors": 5,
        "age_years": 10,
        "lift_available": 1,
        "furnishing": "Unfurnished",
        "facing": "West",
        "status": "Ready to Move",
        "transaction_type": "Resale",
        "jantri_rate_per_sqft": 3500.0,
        "development_score": 6.0,
        "rera_project_match": 1,
        "development_potential": "Low",
        "tp_scheme": "TP 3"
    },
    {
        "city": "Rajkot",
        "locality": "Kalawad Road",
        "property_type": "Apartment",
        "area_sqft": 1800,
        "bhk": 3,
        "bathrooms": 3,
        "floor_current": 7,
        "total_floors": 12,
        "age_years": 1,
        "lift_available": 1,
        "furnishing": "Semi-Furnished",
        "facing": "South",
        "status": "Under Construction",
        "transaction_type": "New Property",
        "jantri_rate_per_sqft": 3000.0,
        "development_score": 9.0,
        "rera_project_match": 1,
        "development_potential": "High",
        "tp_scheme": "TP 4"
    },
    {
        "city": "Gandhinagar",
        "locality": "Sargasan",
        "property_type": "Villa",
        "area_sqft": 3000,
        "bhk": 5,
        "bathrooms": 5,
        "floor_current": 1,
        "total_floors": 2,
        "age_years": 0,
        "lift_available": 0,
        "furnishing": "Unfurnished",
        "facing": "East",
        "status": "Ready to Move",
        "transaction_type": "New Property",
        "jantri_rate_per_sqft": 6000.0,
        "development_score": 8.5,
        "rera_project_match": 1,
        "development_potential": "High",
        "tp_scheme": "TP 5"
    }
]

with TestClient(app) as client:
    # Health Check
    response = client.get("/api/health")
    print("Health Check:", response.status_code, response.json())

    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTesting Prediction {i}...")
        response = client.post("/api/predict/property-value", json=test_case)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            
            # Verify conditions
            assert data["estimated_market_value_lakh"] > 0, "Prediction is not positive"
            assert data["estimated_price_per_sqft"] > 0, "Price per sqft is not positive"
            assert "model_name" in data, "Model name missing"
            assert data["prediction_status"] == "Model estimate", "Prediction status mismatch"
        else:
            print(f"Error: {response.text}")

print("\nAll tests finished!")
