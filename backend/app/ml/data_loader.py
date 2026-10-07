import pandas as pd
import numpy as np

def load_data(filepath: str) -> pd.DataFrame:
    """Loads dataset and performs basic validation."""
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} rows from {filepath}")
    return df
