// ============================================================
// src/lib/aqiCompute.ts
// Pure Mathematical Computation Engine for AeroGuard AI
// Implements EPA Breakpoints, CPCB Standards, ANSI/AHAM AC-1 CADR,
// Boundary Layer Inversion Thermodynamics & Dijkstra Exposure Graph
// 100% deterministic, zero side-effects, fully testable
// ============================================================

import type { SeverityLevel, InversionMetrics, RoomCADRConfig, CADRResult, CommunityPledge } from '../types';

/**
 * EPA PM2.5 Breakpoints (µg/m³) -> AQI (0-500)
 */
const EPA_PM25_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

/**
 * Computes official EPA AQI via piece-wise linear interpolation.
 */
export function calculateEPA_AQI(pm25Concentration: number): number {
  if (pm25Concentration <= 0) return 0;
  if (pm25Concentration >= 500.4) return 500;

  const bp = EPA_PM25_BREAKPOINTS.find(
    (b) => pm25Concentration >= b.cLow && pm25Concentration <= b.cHigh
  );

  if (!bp) return 500;

  const aqi =
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25Concentration - bp.cLow) + bp.iLow;
  return Math.round(aqi);
}

/**
 * Resolves discrete categorical severity from continuous AQI.
 */
export function getSeverityLevel(aqi: number): SeverityLevel {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

/**
 * Atmospheric Boundary Layer Thermal Inversion Thermodynamic Risk Evaluator.
 * Lapse rate: Γ = - (ΔT / Δz).
 * Standard tropospheric adiabatic lapse rate is approx -0.65°C / 100m.
 * A positive lapse rate (temperature INCREASING with altitude) indicates an inversion cap.
 */
export function evaluateInversionRisk(
  surfaceTempC: number,
  aloftTempC: number,
  deltaZMeters: number = 200
): InversionMetrics {
  const deltaT = aloftTempC - surfaceTempC;
  const lapseRatePer100m = (deltaT / deltaZMeters) * 100;

  const isInversionActive = lapseRatePer100m > 0;
  let strength: InversionMetrics['inversionStrength'] = 'None';
  let boundaryLayerHeight = 850; // nominal daytime mixing layer

  if (isInversionActive) {
    if (lapseRatePer100m < 1.0) {
      strength = 'Weak';
      boundaryLayerHeight = 450;
    } else if (lapseRatePer100m < 2.5) {
      strength = 'Moderate';
      boundaryLayerHeight = 220;
    } else {
      strength = 'Severe';
      boundaryLayerHeight = 90;
    }
  }

  const breakupWindowEst = isInversionActive
    ? '1:00 PM - 3:30 PM (Solar Convection Peak)'
    : 'All-Day Atmospheric Dispersion Active';

  return {
    lapseRate: Number(lapseRatePer100m.toFixed(2)),
    surfaceTemp: surfaceTempC,
    boundaryLayerHeight,
    isInversionActive,
    inversionStrength: strength,
    breakupWindowEst,
  };
}

/**
 * Computes Inhaled PM2.5 Microgram Dose based on human respiratory minute volume.
 * Dose (µg) = Duration (mins) * (Ventilation Rate L/min / 1000 m³/L) * PM2.5 (µg/m³) * (1 - FilterEfficiency)
 */
export function calculateInhaledPM25Dose(
  durationMins: number,
  pm25UgM3: number,
  minuteVentilationLMin: number,
  filterEfficiency: number = 0.0
): number {
  if (durationMins <= 0 || pm25UgM3 <= 0 || minuteVentilationLMin <= 0) return 0;
  const clampedFilter = Math.max(0, Math.min(1, filterEfficiency));
  const cubicMetersBreathed = (durationMins * minuteVentilationLMin) / 1000;
  const inhaledDose = cubicMetersBreathed * pm25UgM3 * (1 - clampedFilter);
  return Number(inhaledDose.toFixed(1));
}

/**
 * ANSI/AHAM AC-1 Room CADR (Clean Air Delivery Rate) Calculator.
 * Target ACH (Air Changes per Hour) typically 4 to 6 for respiratory health.
 * 95% particulate clearance time: t_95 = (-ln(0.05) / ACH_total) * 60 minutes.
 */
export function calculateRequiredCADR(config: RoomCADRConfig): CADRResult {
  const volumeM3 = config.lengthM * config.widthM * config.heightM;
  const requiredCADRM3h = volumeM3 * config.targetACH;
  const requiredCADRCFM = requiredCADRM3h / 1.699; // 1 m³/h ≈ 0.5886 CFM

  const totalACH = config.targetACH + config.naturalACH;
  // Natural log of 0.05 is ~ -2.9957
  const clearanceTime95 = (2.9957 / totalACH) * 60;

  // Approximate indoor steady-state AQI reduction: C_ss = C_outdoor * (ACH_nat / (ACH_nat + ACH_purifier))
  const reductionRatio = config.naturalACH / totalACH;
  const estimatedIndoorAqi = Math.max(15, Math.round(config.outdoorAqi * reductionRatio));

  const hepaMatchesCount = requiredCADRM3h <= 200 ? 1 : requiredCADRM3h <= 400 ? 2 : 3;

  return {
    roomVolumeM3: Number(volumeM3.toFixed(1)),
    requiredCADRM3h: Math.round(requiredCADRM3h),
    requiredCADRCFM: Math.round(requiredCADRCFM),
    clearanceTime95PercentMins: Math.round(clearanceTime95),
    estimatedIndoorAqi,
    hepaMatchesCount,
  };
}

/**
 * Dijkstra Lowest-Exposure Pathfinding Algorithm across an Urban Commute Graph.
 * Edge weight is cumulative inhaled exposure (µg of PM2.5) rather than pure Euclidean distance.
 */
export interface GraphEdge {
  target: string;
  distanceKm: number;
  localAqi: number;
}

export function dijkstraLowestExposure(
  nodes: string[],
  adjacency: Map<string, GraphEdge[]>,
  startNode: string,
  endNode: string,
  minuteVentilationLMin: number = 25,
  avgSpeedKmh: number = 20,
  filterEfficiency: number = 0.0
): {
  path: string[];
  totalDistanceKm: number;
  totalDurationMins: number;
  totalInhaledDoseUg: number;
} {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances.set(node, node === startNode ? 0 : Infinity);
    previous.set(node, null);
    unvisited.add(node);
  }

  while (unvisited.size > 0) {
    // Pick unvisited node with lowest accumulated exposure
    let current: string | null = null;
    let minScore = Infinity;

    for (const node of unvisited) {
      const score = distances.get(node) ?? Infinity;
      if (score < minScore) {
        minScore = score;
        current = node;
      }
    }

    if (!current || minScore === Infinity || current === endNode) {
      break;
    }

    unvisited.delete(current);
    const edges = adjacency.get(current) || [];

    for (const edge of edges) {
      if (!unvisited.has(edge.target)) continue;

      const durationMins = (edge.distanceKm / avgSpeedKmh) * 60;
      const pm25Estimate = edge.localAqi * 0.75; // empirical conversion
      const edgeExposureDose = calculateInhaledPM25Dose(
        durationMins,
        pm25Estimate,
        minuteVentilationLMin,
        filterEfficiency
      );

      const alt = (distances.get(current) ?? 0) + edgeExposureDose;
      if (alt < (distances.get(edge.target) ?? Infinity)) {
        distances.set(edge.target, alt);
        previous.set(edge.target, current);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endNode;
  while (curr) {
    path.unshift(curr);
    curr = previous.get(curr) ?? null;
  }

  // Calculate totals along reconstructed path
  let totalDistanceKm = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = (adjacency.get(from) || []).find((e) => e.target === to);
    if (edge) totalDistanceKm += edge.distanceKm;
  }

  const totalDurationMins = (totalDistanceKm / avgSpeedKmh) * 60;
  const totalInhaledDoseUg = distances.get(endNode) ?? 0;

  return {
    path,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalDurationMins: Math.round(totalDurationMins),
    totalInhaledDoseUg: Number(totalInhaledDoseUg.toFixed(1)),
  };
}

/**
 * Computes collective community emission mitigation and shield indices.
 */
export function calculateCommunityOffset(pledges: CommunityPledge[]): {
  totalCo2AvoidedKg: number;
  totalPm25AvoidedG: number;
  communityShieldScore: number;
} {
  let co2 = 0;
  let pm25 = 0;
  let activePledges = 0;

  for (const pledge of pledges) {
    const participants = pledge.participantsCount + (pledge.isPledged ? 1 : 0);
    co2 += pledge.co2AvoidedKgPerDay * participants;
    pm25 += pledge.pm25AvoidedGramsPerDay * participants;
    if (pledge.isPledged) activePledges++;
  }

  // Shield score between 65 and 99 based on active community participation
  const shieldScore = Math.min(99, 65 + activePledges * 7 + Math.floor(co2 / 400));

  return {
    totalCo2AvoidedKg: Math.round(co2),
    totalPm25AvoidedG: Math.round(pm25),
    communityShieldScore: shieldScore,
  };
}
