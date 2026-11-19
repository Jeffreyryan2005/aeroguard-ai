# Architecture Decision Records (ADR) — AeroGuard AI

## ADR-01: Thermodynamic Atmospheric Boundary Layer Modeling
- **Decision:** Implement pure vertical lapse rate calculation (Γ = ΔT/Δz) to compute ground thermal inversion caps and forecast midday solar convective breakup windows.
- **Rationale:** Standard weather applications only report ambient AQI; predicting inversion breakup provides users with actionable aeration windows.

## ADR-02: Server-Side Zero-Trust GenAI Integration
- **Decision:** Restrict Google Gemini 2.5 Flash model invocation strictly to serverless routes with in-memory SHA-256 LRU caching.
- **Rationale:** Prevents API key exposure in client bundles, mitigates quota exhaustion, and provides deterministic fallbacks during network disruptions.

## ADR-03: Multi-Modal Transit Dijkstra Pathfinding
- **Decision:** Implement exposure-weighted graph traversal using minute ventilation and filtration efficiency factors.
- **Rationale:** Enables commuters to choose routes minimizing inhaled particulate dose (micrograms) rather than purely minimizing travel duration.
