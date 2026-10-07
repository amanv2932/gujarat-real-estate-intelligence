# Gujarat Real Estate Intelligence

Machine learning based property valuation and real estate analysis for Gujarat.

This is a comprehensive college project built to analyze the real estate landscape of Gujarat, India. It provides a transparent Deal Intelligence layer, data-driven Market Intelligence, and a transparent, calculation-based Investment Intelligence module.

## Modules

1. **Property Valuation**: Uses an XGBoost regression model trained on a 40,000-row real estate dataset to estimate property values.
2. **Deal Intelligence**: Provides a transparent comparison between the user's asking price and the ML-estimated market value.
3. **Market Intelligence**: Uses raw data to present actual market trends across cities, property types, and configurations.
4. **Gujarat Development Intelligence**: Integrates data from GujRERA, AUDA TP (Town Planning), and AUDA DP (Development Plan) to identify localized development signals.
5. **Investment Intelligence**: Offers scenario-based, calculation-driven ROI estimates. Calculations are deterministic and explicitly show assumptions to ensure transparency.

## Project Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend**: FastAPI (Python)
- **Machine Learning**: XGBoost (scikit-learn pipeline), model saved as `.joblib`

## Disclaimers & Transparency
- **Estimates, Not Guarantees**: ML predictions are strictly estimated market values based on historical data. They do not constitute guaranteed property values.
- **Scenario-Based Calculations**: Investment Intelligence is based on scenarios and mathematical calculations of provided assumptions. Returns are not guaranteed.
- **Authentic Data**: The datasets utilized are unaltered representations of real-world statistics. No synthetic or generated fallback data is used in the final version.

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Build for Production
```bash
cd frontend
npm run build
```

---
*Note: This project is strictly a college assignment and does not feature authentication, databases (PostgreSQL), or enterprise modules.*
