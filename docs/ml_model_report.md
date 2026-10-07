# Machine Learning Model Report
## Gujarat Real Estate Intelligence - Property Price Prediction

**Training Date:** 2026-10-06 23:01:29

## 1. Dataset & Scope
- **Dataset:** `data/gujarat final.csv`
- **Total Rows (before split):** 40000
- **Features Used:** 21
- **Target Variable:** `price_lakh` (Primary), `price_per_sqft` is excluded to prevent leakage.
- **Train/Test Split:** 80% / 20% (Random Seed: 42)

> **IMPORTANT WARNING:** 
> The current dataset contains synthetic/estimated records. Therefore, model performance on this dataset must NOT be presented as real-world market accuracy.

## 2. Feature Engineering & Preprocessing
- **Derived Features:** `floor_ratio` (current floor / total floors), `area_per_bhk` (area / bhk)
- **Leaky Features Excluded:** `price_per_sqft`, `estimated_market_value_lakh`, `estimated_low_lakh`, `estimated_high_lakh`, `deal_score`.
- **Identifiers Excluded:** `property_id`, `project_name`, `data_source`, `synthetic_method`, `data_quality_flag`.
- **Numerical Processing:** Median Imputation + Standard Scaling
- **Categorical Processing:** Constant Imputation ('missing') + One-Hot Encoding (Ignore Unknown)

## 3. Model Comparison (Source-Labelled Holdout)
| Model | MAE | RMSE | R² |
|-------|-----|------|----|
| Gradient Boosting Regressor | 5.11 | 6.94 | 0.773 |

## 4. Model Selection
- **Selected Model:** Gradient Boosting Regressor
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
