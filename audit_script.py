import pandas as pd

df = pd.read_csv("c:/Users/amanv/OneDrive/Desktop/gujarat-real-estate-intelligence/data/gujarat final.csv")

print("Rows:", len(df))
print("Columns:", len(df.columns))
print("Column Names:")
for col in df.columns:
    print(f" - {col}")

print("\nData Types:")
print(df.dtypes)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicates:", df.duplicated().sum())

# check provenance columns
provenance_cols = ['is_synthetic', 'data_source', 'source_name', 'source_url', 'source_record_id', 'synthetic_method', 'price_type']
for col in provenance_cols:
    if col in df.columns:
        print(f"\n{col} distribution:")
        print(df[col].value_counts(dropna=False))

print("\nTarget/Price column options:")
price_cols = [c for c in df.columns if 'price' in c.lower() or 'value' in c.lower() or 'lakh' in c.lower() or 'cr' in c.lower() or 'cost' in c.lower()]
print(price_cols)
