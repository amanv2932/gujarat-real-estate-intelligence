import sys
import json
from fastapi.testclient import TestClient

# Must add backend path to import main
sys.path.append('backend')

try:
    from backend.app.main import app
except Exception as e:
    print(f"Error importing app: {e}")
    sys.exit(1)

client = TestClient(app)

endpoints = [
    ("GET", "/api/health", None),
    ("GET", "/api/dataset/info", None),
    ("GET", "/api/properties?limit=5", None),
    ("GET", "/api/properties/filters", None),
    ("POST", "/api/predict/property-value", {
        "city": "Ahmedabad",
        "locality": "SG Highway",
        "bhk": 3,
        "property_type": "Apartment",
        "area_sqft": 1500,
        "bathrooms": 3,
        "furnishing": "Semi-Furnished",
        "floor_current": 5,
        "total_floors": 10,
        "age_years": 5,
        "lift_available": 1,
        "facing": "East",
        "status": "Ready to Move",
        "transaction_type": "Resale",
        "jantri_rate_per_sqft": 4000,
        "development_score": 8,
        "rera_project_match": 1,
        "development_potential": "High",
        "tp_scheme": "Draft"
    }),
    ("POST", "/api/deal-analysis", {
        "city": "Ahmedabad",
        "locality": "SG Highway",
        "bhk": 3,
        "property_type": "Apartment",
        "area_sqft": 1500,
        "bathrooms": 3,
        "furnishing": "Semi-Furnished",
        "floor_current": 5,
        "total_floors": 10,
        "age_years": 5,
        "lift_available": 1,
        "facing": "East",
        "status": "Ready to Move",
        "transaction_type": "Resale",
        "jantri_rate_per_sqft": 4000,
        "development_score": 8,
        "rera_project_match": 1,
        "development_potential": "High",
        "tp_scheme": "Draft",
        "asking_price_lakh": 65.0
    }),
    ("GET", "/api/market/overview", None),
    ("GET", "/api/market/cities", None),
    ("GET", "/api/development/overview", None),
    ("GET", "/api/development/location/SG%20Highway", None),
    ("POST", "/api/investment-analysis", {
        "property_value_lakh": 60,
        "monthly_rent": 25000,
        "holding_period_years": 5,
        "expected_annual_appreciation_percent": 6
    })
]

passed = 0
failed = 0

print("--- RUNNING API TESTS ---")
with TestClient(app) as client:
    for method, url, payload in endpoints:
        try:
            if method == "GET":
                response = client.get(url)
            else:
                response = client.post(url, json=payload)
                
            if response.status_code == 200:
                print(f"[PASS] {method} {url}")
                passed += 1
            else:
                print(f"[FAIL] {method} {url} - Status: {response.status_code} - Body: {response.text}")
                failed += 1
        except Exception as e:
            print(f"[ERROR] {method} {url} - {str(e)}")
            failed += 1

print(f"--- TEST SUMMARY ---")
print(f"Passed: {passed}")
print(f"Failed: {failed}")
