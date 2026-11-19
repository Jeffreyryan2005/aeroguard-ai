# Prompt Engineering Strategy & GenAI Architecture — AeroGuard AI

## 1. Overview
AeroGuard AI uses targeted prompt orchestration to convert multi-pollutant sensor data, atmospheric thermodynamic lapse rates, and physiological vulnerability profiles into clinically actionable, hour-by-hour exposure schedules.

---

## 2. Server-Side Prompt Pipeline (/api/routine-insights)

### Architectural Pattern: Role-Calibrated Multi-Constraint Prompting
- **System Persona:** Clinical environmental pulmonologist and atmospheric boundary-layer physicist.
- **Dynamic Context Injection:**
  - Regional Pollutant Vectors: PM2.5, PM10, NO2, CO, O3, SO2
  - Boundary Thermodynamics: Vertical lapse rate (Γ = ΔT/Δz), inversion status, estimated mixing height
  - Demographic Profile: Respiratory minute volume ($V_E$ in L/min), baseline respiratory risk threshold
- **Output Constraint:** Strict JSON schema with deterministic typing for automated client rendering.

---

## 3. Emergency Advisory Prompt Pipeline (/api/emergency-advisory)

### Architectural Pattern: Trilingual Municipal Emergency Broadcast
- **Inputs:** City name, AQI score, primary pollutant, boundary layer inversion flag, target language (EN, HI, ES).
- **Output:** Three-sentence authoritative broadcast alert instructing vulnerable groups on indoor filtration and safe midday convection aeration windows.

---

## 4. Deterministic Clinical Fallback Engine
When network latency, API rate limits, or cold-start timeouts occur, AeroGuard AI seamlessly falls back to pure mathematical modeling (`src/lib/clinicalPlan.ts` and `src/lib/aqiCompute.ts`), ensuring zero UI failure or blank states.
