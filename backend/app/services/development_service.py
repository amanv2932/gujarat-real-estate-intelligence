import pandas as pd
import os
import math
from typing import Dict, Any, List, Optional
from app.schemas.development import (
    DevelopmentOverview, ReraProject, ReraLocalityAnalysis, 
    TpScheme, DpZone, ZoneSummary, DevelopmentSignal, LocalityDevelopmentInfo
)

class DevelopmentService:
    def __init__(self):
        self.rera_df = None
        self.tp_df = None
        self.dp_df = None
        self._load_datasets()

    def _load_datasets(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        rera_path = os.path.join(base_dir, 'data', 'gujrera_ahmedabad_development_intelligence(3).csv')
        tp_path = os.path.join(base_dir, 'data', 'auda_development_tp_under_preparation(3).csv')
        dp_path = os.path.join(base_dir, 'data', 'auda_dp2021_zone_summary(3).csv')

        try:
            self.rera_df = pd.read_csv(rera_path).astype(str) if os.path.exists(rera_path) else pd.DataFrame()
            self.tp_df = pd.read_csv(tp_path).astype(str) if os.path.exists(tp_path) else pd.DataFrame()
            self.dp_df = pd.read_csv(dp_path).astype(str) if os.path.exists(dp_path) else pd.DataFrame()
            
            # Fill NaNs with empty string or sensible defaults
            if not self.rera_df.empty: self.rera_df = self.rera_df.replace('nan', '')
            if not self.tp_df.empty: self.tp_df = self.tp_df.replace('nan', '')
            if not self.dp_df.empty: self.dp_df = self.dp_df.replace('nan', '')
            
            print(f"Loaded development datasets:")
            print(f"- GujRERA: {len(self.rera_df)} rows")
            print(f"- AUDA TP: {len(self.tp_df)} rows")
            print(f"- AUDA DP: {len(self.dp_df)} rows")
        except Exception as e:
            print(f"Failed to load development datasets: {e}")
            self.rera_df = pd.DataFrame()
            self.tp_df = pd.DataFrame()
            self.dp_df = pd.DataFrame()

    def get_overview(self) -> DevelopmentOverview:
        total_rera = len(self.rera_df)
        
        active_rera = 0
        completed_rera = 0
        if not self.rera_df.empty and 'project_status' in self.rera_df.columns:
            status_counts = self.rera_df['project_status'].str.lower().value_counts()
            active_rera = status_counts.get('active', 0) + status_counts.get('new', 0)
            completed_rera = status_counts.get('completed', 0)
            
        total_tp = len(self.tp_df)
        total_dp = len(self.dp_df)

        return DevelopmentOverview(
            total_rera_projects=total_rera,
            active_rera_projects=active_rera,
            completed_rera_projects=completed_rera,
            total_tp_schemes=total_tp,
            tp_schemes_under_preparation=total_tp,
            total_dp_zones=total_dp
        )

    def get_rera_projects(self, locality: str = None, project_type: str = None, project_status: str = None, tp_scheme: str = None, page: int = 1, limit: int = 20):
        df = self.rera_df
        if df.empty: return {"data": [], "total": 0}
        
        if locality:
            df = df[df['locality_text'].str.lower().str.contains(locality.lower(), na=False)]
        if project_type:
            df = df[df['project_type'].str.lower() == project_type.lower()]
        if project_status:
            df = df[df['project_status'].str.lower() == project_status.lower()]
        if tp_scheme:
            df = df[df['tp_scheme'].str.lower().str.contains(tp_scheme.lower(), na=False)]
            
        total = len(df)
        start = (page - 1) * limit
        end = start + limit
        
        records = df.iloc[start:end].to_dict(orient='records')
        return {"data": records, "total": total}

    def get_rera_localities(self) -> List[ReraLocalityAnalysis]:
        df = self.rera_df
        if df.empty or 'locality_text' not in df.columns: return []
        
        # Add helper columns for aggregation
        df['is_active'] = df['project_status'].str.lower().isin(['active', 'new']).astype(int)
        df['is_completed'] = df['project_status'].str.lower().isin(['completed']).astype(int)
        
        grouped = df.groupby('locality_text').agg(
            project_count=('project_name', 'count'),
            active_project_count=('is_active', 'sum'),
            completed_project_count=('is_completed', 'sum')
        ).reset_index()
        
        grouped = grouped.rename(columns={'locality_text': 'locality'})
        grouped = grouped[grouped['locality'].str.strip() != ""]
        grouped = grouped.sort_values('project_count', ascending=False)
        
        return [ReraLocalityAnalysis(**row) for row in grouped.to_dict(orient='records')]

    def get_tp_schemes(self) -> List[TpScheme]:
        if self.tp_df.empty: return []
        return [TpScheme(**{k: (None if v == "" else v) for k,v in row.items()}) for row in self.tp_df.to_dict(orient='records')]

    def get_dp_zones(self) -> Dict[str, Any]:
        if self.dp_df.empty: return {"zones": [], "summary": []}
        
        zones = [DpZone(**{k: (None if v == "" else v) for k,v in row.items()}) for row in self.dp_df.to_dict(orient='records')]
        
        # Summary
        summary_data = []
        if 'zone_name' in self.dp_df.columns:
            grouped = self.dp_df.groupby('zone_name').agg(
                total_area=('area_sq_km', lambda x: pd.to_numeric(x, errors='coerce').sum()),
                zone_count=('zone_code', 'count')
            ).reset_index()
            
            for _, row in grouped.iterrows():
                summary_data.append(ZoneSummary(
                    zone_category=str(row['zone_name']),
                    total_area=float(row['total_area']),
                    zone_count=int(row['zone_count'])
                ))
                
        return {"zones": zones, "summary": summary_data}

    def get_signals(self) -> List[DevelopmentSignal]:
        signals = []
        # Generate some high level signals based on the localities with most activity
        localities = self.get_rera_localities()
        for loc in localities[:10]:
            strength = "High" if loc.project_count > 5 else "Medium"
            signals.append(DevelopmentSignal(
                location=loc.locality,
                signal_type="RERA Project Activity",
                signal_strength=strength,
                evidence_count=loc.project_count,
                explanation=f"Strong planning activity signal based on {loc.project_count} registered projects."
            ))
        return signals

    def get_location_intelligence(self, locality: str) -> LocalityDevelopmentInfo:
        if not locality or self.rera_df.empty:
            return LocalityDevelopmentInfo(locality=locality, matching_rera_projects=[], matching_tp_schemes=[], matching_zones=[], development_signals=[], message="No reliable development record found.")
            
        loc_lower = locality.lower().strip()
        
        # Match RERA
        matching_rera = self.rera_df[self.rera_df['locality_text'].str.lower().str.contains(loc_lower, na=False)]
        
        # Match TP (area_village)
        matching_tp = self.tp_df[self.tp_df['area_village'].str.lower().str.contains(loc_lower, na=False)] if not self.tp_df.empty and 'area_village' in self.tp_df.columns else pd.DataFrame()
        
        if matching_rera.empty and matching_tp.empty:
            return LocalityDevelopmentInfo(locality=locality, matching_rera_projects=[], matching_tp_schemes=[], matching_zones=[], development_signals=[], message="No reliable development record found.")
            
        rera_projects = [ReraProject(**{k: (None if v == "" else v) for k,v in row.items()}) for row in matching_rera.to_dict(orient='records')]
        tp_schemes = [TpScheme(**{k: (None if v == "" else v) for k,v in row.items()}) for row in matching_tp.to_dict(orient='records')]
        
        signals = []
        total_evidence = len(rera_projects) + len(tp_schemes)
        if total_evidence > 0:
            signals.append(DevelopmentSignal(
                location=locality,
                signal_type="Planning Activity",
                signal_strength="High" if total_evidence > 3 else "Medium",
                evidence_count=total_evidence,
                explanation=f"Found {len(rera_projects)} RERA projects and {len(tp_schemes)} TP schemes."
            ))
            
        return LocalityDevelopmentInfo(
            locality=locality,
            matching_rera_projects=rera_projects,
            matching_tp_schemes=tp_schemes,
            matching_zones=[],
            development_signals=signals
        )
