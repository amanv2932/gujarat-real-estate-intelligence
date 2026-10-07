import pandas as pd
import numpy as np
import json
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. Load data
df = pd.read_csv("c:/Users/amanv/OneDrive/Desktop/gujarat-real-estate-intelligence/data/gujarat final.csv", low_memory=False)

# 2. Select Features and Target
target = 'price_lakh'

# Identifying valid features
numerical_features = ['area_sqft', 'bhk', 'bathrooms', 'floor_current', 'total_floors', 'age_years', 'parking_available', 'lift_available', 'latitude', 'longitude']
categorical_features = ['city', 'district', 'region', 'locality', 'property_type_std', 'transaction_type', 'furnishing_status', 'facing', 'construction_status']

all_features = numerical_features + categorical_features

# Check if features exist
numerical_features = [f for f in numerical_features if f in df.columns]
categorical_features = [f for f in categorical_features if f in df.columns]

# Remove rows with NaN target
df = df.dropna(subset=[target])

# 3. Split Dataset
# Source-labelled (real) records for holdout
real_mask = ~df['is_synthetic']
df_real = df[real_mask]
df_synth = df[~real_mask]

# Split synthetic data into train and test
X_synth = df_synth[numerical_features + categorical_features]
y_synth = df_synth[target]
X_train, X_val, y_train, y_val = train_test_split(X_synth, y_synth, test_size=0.2, random_state=42)

# Holdout set
X_holdout = df_real[numerical_features + categorical_features]
y_holdout = df_real[target]

print(f"Training set (synthetic): {len(X_train)}")
print(f"Validation set (synthetic): {len(X_val)}")
print(f"Holdout set (real): {len(X_holdout)}")

# 4. Preprocessing Pipeline
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# 5. Models to train
models = {
    "Linear Regression": LinearRegression(),
    "Ridge Regression": Ridge(random_state=42),
    "Random Forest Regressor": RandomForestRegressor(random_state=42, n_estimators=50),
    "Gradient Boosting Regressor": GradientBoostingRegressor(random_state=42),
    "XGBoost Regressor": XGBRegressor(random_state=42)
}

results = []
best_model_name = None
best_model = None
best_score = float('-inf')
best_metrics = {}

for name, model in models.items():
    print(f"Training {name}...")
    pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])
    
    # Train
    pipeline.fit(X_train, y_train)
    
    # Evaluate on validation (synthetic)
    y_val_pred = pipeline.predict(X_val)
    val_mae = mean_absolute_error(y_val, y_val_pred)
    val_rmse = np.sqrt(mean_squared_error(y_val, y_val_pred))
    val_r2 = r2_score(y_val, y_val_pred)
    
    # Evaluate on holdout (real)
    y_holdout_pred = pipeline.predict(X_holdout)
    holdout_mae = mean_absolute_error(y_holdout, y_holdout_pred)
    holdout_rmse = np.sqrt(mean_squared_error(y_holdout, y_holdout_pred))
    holdout_r2 = r2_score(y_holdout, y_holdout_pred)
    
    results.append({
        "Model": name,
        "Val_MAE": val_mae,
        "Val_RMSE": val_rmse,
        "Val_R2": val_r2,
        "Holdout_MAE": holdout_mae,
        "Holdout_RMSE": holdout_rmse,
        "Holdout_R2": holdout_r2
    })
    
    # Select best model based on Holdout R2
    if holdout_r2 > best_score:
        best_score = holdout_r2
        best_model_name = name
        best_model = pipeline
        best_metrics = {
            "model": name,
            "val_mae": val_mae,
            "val_rmse": val_rmse,
            "val_r2": val_r2,
            "holdout_mae": holdout_mae,
            "holdout_rmse": holdout_rmse,
            "holdout_r2": holdout_r2
        }

print("\nModel Comparison:")
for r in results:
    print(r)

print(f"\nBest Model: {best_model_name}")

# 6. Save Model and Metadata
joblib.dump(best_model, "c:/Users/amanv/OneDrive/Desktop/gujarat-real-estate-intelligence/models/property_price_model.joblib")

metadata = {
    "target": target,
    "features": {
        "numerical": numerical_features,
        "categorical": categorical_features
    },
    "training_rows": len(X_train),
    "test_rows": len(X_val) + len(X_holdout),
    "model_name": best_model_name,
    "metrics": best_metrics,
    "random_seed": 42,
    "dataset_version": "gujarat final.csv",
    "training_date": datetime.now().isoformat()
}

with open("c:/Users/amanv/OneDrive/Desktop/gujarat-real-estate-intelligence/models/model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=4)

print("\nModel saved successfully!")
