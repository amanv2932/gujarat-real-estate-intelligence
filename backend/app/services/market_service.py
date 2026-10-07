import pandas as pd
from typing import List, Dict, Any, Optional
from app.services.dataset_service import DatasetService

class MarketService:
    def __init__(self):
        self.dataset_service = DatasetService()

    @property
    def _df(self) -> pd.DataFrame:
        return self.dataset_service._df

    def _get_filtered_df(self, city: str = None, property_type: str = None, bhk: int = None, locality: str = None) -> pd.DataFrame:
        df = self._df
        if city:
            df = df[df['city'].str.lower() == city.lower()]
        if property_type:
            df = df[df['property_type'].str.lower() == property_type.lower()]
        if bhk is not None:
            df = df[df['bhk'] == bhk]
        if locality:
            df = df[df['locality'].str.lower() == locality.lower()]
        return df

    def get_overview(self, city: str = None, property_type: str = None, bhk: int = None, locality: str = None) -> Dict[str, Any]:
        df = self._get_filtered_df(city, property_type, bhk, locality)
        
        if df.empty:
            return {
                "total_properties": 0, "cities_count": 0, "localities_count": 0,
                "average_price_lakh": 0, "median_price_lakh": 0,
                "average_price_per_sqft": 0, "median_price_per_sqft": 0,
                "minimum_price_lakh": 0, "maximum_price_lakh": 0
            }

        return {
            "total_properties": len(df),
            "cities_count": df['city'].nunique(),
            "localities_count": df['locality'].nunique(),
            "average_price_lakh": round(df['price_lakh'].mean(), 2),
            "median_price_lakh": round(df['price_lakh'].median(), 2),
            "average_price_per_sqft": round(df['price_per_sqft'].mean(), 2),
            "median_price_per_sqft": round(df['price_per_sqft'].median(), 2),
            "minimum_price_lakh": round(df['price_lakh'].min(), 2),
            "maximum_price_lakh": round(df['price_lakh'].max(), 2)
        }

    def get_cities_analytics(self) -> List[Dict[str, Any]]:
        df = self._df
        grouped = df.groupby('city').agg(
            property_count=('property_id', 'count'),
            average_price_lakh=('price_lakh', 'mean'),
            median_price_lakh=('price_lakh', 'median'),
            average_price_per_sqft=('price_per_sqft', 'mean'),
            median_price_per_sqft=('price_per_sqft', 'median'),
            average_area_sqft=('area_sqft', 'mean')
        ).reset_index()
        
        grouped = grouped.sort_values(by='property_count', ascending=False)
        return grouped.round(2).to_dict(orient='records')

    def get_localities_analytics(self, city: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        df = self._get_filtered_df(city=city)
        grouped = df.groupby(['locality', 'city']).agg(
            property_count=('property_id', 'count'),
            average_price_lakh=('price_lakh', 'mean'),
            median_price_lakh=('price_lakh', 'median'),
            average_price_per_sqft=('price_per_sqft', 'mean'),
            median_price_per_sqft=('price_per_sqft', 'median'),
            average_area_sqft=('area_sqft', 'mean')
        ).reset_index()
        
        # Minimum sample threshold of 10 properties per locality for reliable stats
        grouped = grouped[grouped['property_count'] >= 10]
        grouped = grouped.sort_values(by='property_count', ascending=False).head(limit)
        return grouped.round(2).to_dict(orient='records')

    def get_property_types_analytics(self, city: str = None) -> List[Dict[str, Any]]:
        df = self._get_filtered_df(city=city)
        grouped = df.groupby('property_type').agg(
            property_count=('property_id', 'count'),
            average_price_lakh=('price_lakh', 'mean'),
            median_price_lakh=('price_lakh', 'median'),
            average_price_per_sqft=('price_per_sqft', 'mean'),
            average_area_sqft=('area_sqft', 'mean')
        ).reset_index()
        
        grouped = grouped.sort_values(by='property_count', ascending=False)
        return grouped.round(2).to_dict(orient='records')

    def get_bhk_analytics(self, city: str = None) -> List[Dict[str, Any]]:
        df = self._get_filtered_df(city=city)
        grouped = df.groupby('bhk').agg(
            property_count=('property_id', 'count'),
            average_price_lakh=('price_lakh', 'mean'),
            median_price_lakh=('price_lakh', 'median'),
            average_price_per_sqft=('price_per_sqft', 'mean'),
            average_area_sqft=('area_sqft', 'mean')
        ).reset_index()
        
        grouped = grouped.sort_values(by='bhk')
        return grouped.round(2).to_dict(orient='records')

    def get_furnishing_analytics(self, city: str = None) -> List[Dict[str, Any]]:
        df = self._get_filtered_df(city=city)
        furnishing_col = "furnishing_status" if "furnishing_status" in df.columns else "furnishing"
        grouped = df.groupby(furnishing_col).agg(
            property_count=('property_id', 'count'),
            average_price_lakh=('price_lakh', 'mean'),
            average_price_per_sqft=('price_per_sqft', 'mean')
        ).reset_index()
        
        if furnishing_col != "furnishing":
            grouped = grouped.rename(columns={furnishing_col: "furnishing"})
            
        grouped = grouped.sort_values(by='property_count', ascending=False)
        return grouped.round(2).to_dict(orient='records')

    def get_price_distribution(self, city: str = None) -> List[Dict[str, Any]]:
        df = self._get_filtered_df(city=city)
        
        if df.empty:
            return []
            
        bins = [0, 25, 50, 75, 100, 150, 250, float('inf')]
        labels = ['0-25 Lakh', '25-50 Lakh', '50-75 Lakh', '75-100 Lakh', '100-150 Lakh', '150-250 Lakh', '250+ Lakh']
        
        df_copy = df.copy()
        df_copy['bucket'] = pd.cut(df_copy['price_lakh'], bins=bins, labels=labels, right=False)
        
        distribution = df_copy['bucket'].value_counts().reindex(labels, fill_value=0).reset_index()
        distribution.columns = ['bucket', 'property_count']
        
        return distribution.to_dict(orient='records')

    def get_area_price_scatter(self, city: str = None) -> List[Dict[str, Any]]:
        df = self._get_filtered_df(city=city)
        
        if df.empty:
            return []
            
        # Sample deterministically to max 500 points to prevent overloading the frontend
        # Seed ensures consistent representation
        sample_size = min(len(df), 500)
        sampled = df[['area_sqft', 'price_lakh', 'city']].sample(n=sample_size, random_state=42)
        
        # Round numericals
        sampled['area_sqft'] = sampled['area_sqft'].round(2)
        sampled['price_lakh'] = sampled['price_lakh'].round(2)
        
        return sampled.to_dict(orient='records')
