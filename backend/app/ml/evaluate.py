import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
import pandas as pd

def evaluate_model(y_true, y_pred, model_name):
    """Calculates and returns various evaluation metrics."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    # MAPE handling zeros in y_true
    mask = y_true != 0
    if mask.sum() > 0:
        mape = mean_absolute_percentage_error(y_true[mask], y_pred[mask])
    else:
        mape = np.nan
        
    medae = np.median(np.abs(y_true - y_pred))
    
    # +/- 10% and 20%
    abs_pct_error = np.abs((y_true - y_pred) / y_true)
    within_10 = np.mean(abs_pct_error <= 0.1) * 100
    within_20 = np.mean(abs_pct_error <= 0.2) * 100
    
    return {
        "model": model_name,
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "mape": float(mape),
        "medae": float(medae),
        "within_10_pct": float(within_10),
        "within_20_pct": float(within_20)
    }
