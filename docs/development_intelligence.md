# Development Intelligence Module

The Development Intelligence module surfaces regional planning, zoning, and project execution activity to provide contextual intelligence alongside individual property valuations. It aggregates real-world data from Gujarat Real Estate Regulatory Authority (GujRERA) and Ahmedabad Urban Development Authority (AUDA).

## Source Datasets

1. **GujRERA Ahmedabad Development Intelligence**
   - **Records**: ~5,480 projects
   - **Key Fields**: `project_name`, `project_address`, `project_status`, `startdate`, `enddate`, `project_type`, `approvedon`, `locality_text`, `tp_scheme`

2. **AUDA TP Schemes**
   - **Records**: Town Planning schemes under preparation
   - **Key Fields**: `tp_scheme`, `area_village`, `zone`, `area_ha`

3. **AUDA DP 2021 Zoning**
   - **Records**: Summary of designated development zones
   - **Key Fields**: `zone_name`, `zone_code`, `area_sq_km`

> **Note**: For this specific demonstration, synthetic stubs of these datasets were created because the original source CSVs were unavailable in the working directory. The application handles them gracefully via the `DevelopmentService`.

## API Endpoints

- `GET /api/development/overview`: Aggregated KPI counts.
- `GET /api/development/rera-projects`: Paginated directory of RERA projects, filtered by locality, type, status, and TP scheme.
- `GET /api/development/rera-localities`: Identifies localities with the most registered RERA project activity.
- `GET /api/development/tp-schemes`: Directory of Town Planning (TP) schemes.
- `GET /api/development/zones`: Returns categorical summaries of urban zoning.
- `GET /api/development/signals`: Synthesizes the raw data into interpretable categorical "Signals".
- `GET /api/development/location/{locality}`: Finds matching development intelligence (RERA and TP) for a specific textual locality.

## Matching & Signal Methodology

### Locality Matching
The API utilizes a strict lowercase substring match against `locality_text` in the RERA database and `area_village` in the TP scheme database. If no reliable intersection is found, it explicitly returns `No reliable development record found.` rather than fabricating fuzzy estimations.

### Development Signals
Rather than scoring an arbitrary "appreciation probability", this module generates deterministic Activity Signals (e.g. "High", "Medium").
- **Signal Rule**: If a locality intersects with `> 3` distinct RERA projects or TP schemes combined, it emits a `High` Development Activity signal. Otherwise, it emits a `Medium` signal.

## Privacy & Limitations
- Sensitive promoter information (like PAN, Aadhaar, contact details) is excluded from the Pydantic schemas and is never served to the frontend.
- Development intelligence is exposed purely as *contextual evidence* in the Property Analyzer. 

### Disclaimer
Development signals indicate planning/development activity based on available records. They are not guarantees of future appreciation, returns, or investment outcomes. No statistical correlations between zoning boundaries and future price hikes are implied.
