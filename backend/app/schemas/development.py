from pydantic import BaseModel
from typing import List, Optional

class DevelopmentOverview(BaseModel):
    total_rera_projects: int
    active_rera_projects: int
    completed_rera_projects: int
    total_tp_schemes: int
    tp_schemes_under_preparation: int
    total_dp_zones: int

class ReraProject(BaseModel):
    project_name: Optional[str] = None
    project_address: Optional[str] = None
    project_status: Optional[str] = None
    startdate: Optional[str] = None
    enddate: Optional[str] = None
    district_name: Optional[str] = None
    project_type: Optional[str] = None
    approvedon: Optional[str] = None
    projectcost: Optional[str] = None
    locality_text: Optional[str] = None
    tp_scheme: Optional[str] = None
    fp_number: Optional[str] = None
    op_number: Optional[str] = None

class ReraLocalityAnalysis(BaseModel):
    locality: str
    project_count: int
    active_project_count: int
    completed_project_count: int

class TpScheme(BaseModel):
    tp_scheme: Optional[str] = None
    area_village: Optional[str] = None
    zone: Optional[str] = None
    area_ha: Optional[float] = None
    source: Optional[str] = None
    source_date: Optional[str] = None

class DpZone(BaseModel):
    zone_name: Optional[str] = None
    zone_code: Optional[str] = None
    area_sq_km: Optional[float] = None
    source: Optional[str] = None
    source_date: Optional[str] = None

class ZoneSummary(BaseModel):
    zone_category: str
    total_area: float
    zone_count: int

class DevelopmentSignal(BaseModel):
    location: str
    signal_type: str
    signal_strength: str
    evidence_count: int
    explanation: str

class LocalityDevelopmentInfo(BaseModel):
    locality: str
    matching_rera_projects: List[ReraProject] = []
    matching_tp_schemes: List[TpScheme] = []
    matching_zones: List[DpZone] = []
    development_signals: List[DevelopmentSignal] = []
    message: Optional[str] = None

