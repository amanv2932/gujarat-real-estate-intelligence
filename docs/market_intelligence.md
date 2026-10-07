# Market Intelligence Module

The Market Intelligence module leverages the underlying Gujarat real-estate dataset (approx. 40,000 rows) to provide robust, aggregated statistics, pricing trends, and market insights. 

> **Important Disclaimer:** The underlying dataset contains some synthetic records generated for demonstration purposes. These analytics are dataset-level analytical outputs and should NOT automatically be interpreted as official Gujarat market statistics or investment recommendations.

## Available Analytics & API Endpoints

All market intelligence endpoints operate entirely in-memory using `pandas` dataframes loaded by the `DatasetService`. All aggregation happens safely on the backend.

### `GET /api/market/overview`
Returns high-level statistics across the dataset.
- **Metrics:** `total_properties`, `cities_count`, `localities_count`, `average_price_lakh`, `median_price_lakh`, `average_price_per_sqft`, `median_price_per_sqft`, `minimum_price_lakh`, `maximum_price_lakh`.
- **Filters Supported:** `city`, `property_type`, `bhk`, `locality`.

### `GET /api/market/cities`
Aggregates key metrics grouped by city, sorted by the volume of properties.
- **Metrics:** `property_count`, `average_price_lakh`, `median_price_lakh`, `average_price_per_sqft`, `median_price_per_sqft`, `average_area_sqft`.

### `GET /api/market/localities`
Provides locality-level intelligence.
- **Threshold Rule:** Implements a minimum threshold of **10 properties** per locality to ensure statistical relevance and exclude anomalies.
- **Filters Supported:** `city`, `limit` (default 50).

### `GET /api/market/property-types`
Groups pricing trends by the type of property (e.g., Apartment, Villa, Independent House).

### `GET /api/market/bhk`
Provides granular data on configuration-based pricing (1 BHK, 2 BHK, 3 BHK, etc.).

### `GET /api/market/furnishing`
Analyzes the impact of furnishing (Furnished, Semi-Furnished, Unfurnished) on pricing.

### `GET /api/market/price-distribution`
Segments properties into specific price bands.
- **Bucket Logic:** Bins are created using `[0, 25, 50, 75, 100, 150, 250, inf]`. 
- **Labels:** '0-25 Lakh', '25-50 Lakh', '50-75 Lakh', '75-100 Lakh', '100-150 Lakh', '150-250 Lakh', '250+ Lakh'.

### `GET /api/market/area-price`
Provides raw datapoints specifically optimized for scatter-plot charting.
- **Sampling Method:** To prevent overloading client browsers and bandwidth, this endpoint deterministically samples a maximum of **500 records** using a fixed random seed (`42`). This ensures consistent visual representation while maintaining performance.

### `GET /api/market/filters`
Provides valid dropdown filter configurations.

## Architecture & Performance
- **Single Source of Truth**: The `MarketService` references the dataframe memory-mapped by `DatasetService`, ensuring no duplicate data loads or inconsistent definitions.
- **Frontend Optimization**: The frontend React app exclusively receives aggregations, grouped structures, or limited/sampled datasets (max 500 rows for scatter plots). It handles loading gracefully and relies heavily on robust Recharts components for visualization.
