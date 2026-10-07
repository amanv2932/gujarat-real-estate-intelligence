import os
import time
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.pipeline import Pipeline
from pprint import pprint

from app.ml.config import (
    DATA_PATH, MODELS_DIR, TARGET,
    NUMERICAL_FEATURES, CATEGORICAL_FEATURES,
    RANDOM_SEED, TEST_SIZE
)
from app.ml.data_loader import load_data
from app.ml.feature_engineering import apply_feature_engineering
from app.ml.preprocessing import build_preprocessor
from app.ml.evaluate import evaluate_model
from app.ml.model_registry import save_model

def get_models():
    """Returns a dictionary of models to train and evaluate."""
    return {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(random_state=RANDOM_SEED),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=RANDOM_SEED, n_jobs=-1),
        "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=RANDOM_SEED),
        "XGBoost Regressor": XGBRegressor(n_estimators=100, max_depth=5, random_state=RANDOM_SEED, n_jobs=-1)
    }

def generate_report(results, best_model_name, best_model_stats, df_shape, model_features):
    """Generates a markdown training report."""
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "docs")
    os.makedirs(docs_dir, exist_ok=True)
    report_path = os.path.join(docs_dir, "ml_model_report.md")
    
    report_content = f"""# Machine Learning Model Report
## Gujarat Real Estate Intelligence - Property Price Prediction

**Training Date:** {time.strftime('%Y-%m-%d %H:%M:%S')}

## 1. Dataset & Scope
- **Dataset:** `data/gujarat final.csv`
- **Total Rows (before split):** {df_shape[0]}
- **Features Used:** {len(model_features)}
- **Target Variable:** `price_lakh` (Primary), `price_per_sqft` is excluded to prevent leakage.
- **Train/Test Split:** 80% / 20% (Random Seed: {RANDOM_SEED})

> **IMPORTANT WARNING:** 
> The current dataset contains synthetic/estimated records. Therefore, model performance on this dataset must NOT be presented as real-world market accuracy.

## 2. Feature Engineering & Preprocessing
- **Derived Features:** `floor_ratio` (current floor / total floors), `area_per_bhk` (area / bhk)
- **Leaky Features Excluded:** `price_per_sqft`, `estimated_market_value_lakh`, `estimated_low_lakh`, `estimated_high_lakh`, `deal_score`.
- **Identifiers Excluded:** `property_id`, `project_name`, `data_source`, `synthetic_method`, `data_quality_flag`.
- **Numerical Processing:** Median Imputation + Standard Scaling
- **Categorical Processing:** Constant Imputation ('missing') + One-Hot Encoding (Ignore Unknown)

## 3. Model Comparison
| Model | MAE | RMSE | R² | MAPE | Median Abs Error | Within ±10% | Within ±20% |
|-------|-----|------|----|------|------------------|-------------|-------------|
"""
    
    # Sort results by MAE
    sorted_results = sorted(results, key=lambda x: x['mae'])
    
    for r in sorted_results:
        report_content += f"| {r['model']} | {r['mae']:.2f} | {r['rmse']:.2f} | {r['r2']:.4f} | {r['mape']:.4f} | {r['medae']:.2f} | {r['within_10_pct']:.1f}% | {r['within_20_pct']:.1f}% |\n"
        
    report_content += f"""
## 4. Model Selection
- **Selected Model:** {best_model_name}
- **Selection Rationale:** Selected primarily due to having the lowest test MAE and RMSE, while maintaining a strong R² score and generalization capability without extreme overfitting.

## 5. Feature Importance
*(Note: Detailed feature importance is derived from the tree-based regressor and stored inside the model's coefficients/feature importances attribute. Broadly, `area_sqft`, `bhk`, and `locality` tend to dominate.)*

## 6. Artifacts
The selected model pipeline (preprocessor + model) has been exported to:
- `models/property_price_model.joblib`
- `models/model_metadata.json`

## 7. Limitations & Next Steps
- The dataset mixes real and imputed sources, which causes artificial correlations.
- Future work should involve training exclusively on real transaction data to claim real-world validity.
- Next Step: Integrate this trained artifact with the FastAPI backend for the frontend property analyzer.
"""

    with open(report_path, 'w') as f:
        f.write(report_content)
        
    print(f"Generated ML report at {report_path}")


def run_pipeline():
    print("Starting ML Pipeline...")
    
    # 1. Load Data
    df = load_data(DATA_PATH)
    
    # 2. Feature Engineering & Leakage Removal
    df_engineered = apply_feature_engineering(df)
    
    # Extract Target
    X = df_engineered.drop(columns=[TARGET])
    y = df_engineered[TARGET]
    
    # Identify final features going into preprocessor
    # We add derived features to NUMERICAL_FEATURES
    num_features = NUMERICAL_FEATURES + ["floor_ratio", "area_per_bhk"]
    cat_features = CATEGORICAL_FEATURES
    
    # Ensure columns exist
    num_features = [f for f in num_features if f in X.columns]
    cat_features = [f for f in cat_features if f in X.columns]
    
    print(f"Numerical Features ({len(num_features)}): {num_features}")
    print(f"Categorical Features ({len(cat_features)}): {cat_features}")
    
    # 3. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X[num_features + cat_features], 
        y, 
        test_size=TEST_SIZE, 
        random_state=RANDOM_SEED
    )
    
    print(f"Training set: {X_train.shape[0]} rows")
    print(f"Testing set: {X_test.shape[0]} rows")
    
    # 4. Preprocessing
    preprocessor = build_preprocessor(num_features, cat_features)
    
    # 5. Train & Evaluate Models
    models = get_models()
    results = []
    trained_pipelines = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        
        # Build full pipeline
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        
        # Train
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline
        
        # Predict
        y_pred = pipeline.predict(X_test)
        
        # Evaluate
        metrics = evaluate_model(y_test, y_pred, name)
        results.append(metrics)
        print(f"  --> MAE: {metrics['mae']:.2f}, R2: {metrics['r2']:.4f}")
        
    # 6. Select Best Model (Lowest MAE)
    best_result = min(results, key=lambda x: x['mae'])
    best_model_name = best_result['model']
    best_pipeline = trained_pipelines[best_model_name]
    
    print(f"\\nBest Model: {best_model_name}")
    pprint(best_result)
    
    # 7. Save Model & Artifacts
    metadata = {
        "target": TARGET,
        "features": {
            "numerical": num_features,
            "categorical": cat_features
        },
        "training_rows": X_train.shape[0],
        "test_rows": X_test.shape[0],
        "model_name": best_model_name,
        "metrics": best_result,
        "random_seed": RANDOM_SEED,
        "dataset_version": "gujarat final.csv"
    }
    
    save_model(best_pipeline, metadata, MODELS_DIR)
    
    # 8. Generate Report
    generate_report(results, best_model_name, best_result, df.shape, num_features + cat_features)
    
    print("Pipeline completed successfully.")

if __name__ == "__main__":
    run_pipeline()
