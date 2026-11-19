// ============================================================
// src/types/index.ts
// Strict TypeScript Contracts for AeroGuard AI Platform
// Zero-any guarantee with full runtime serialization safety
// ============================================================

export type SeverityLevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface PollutantValues {
  pm25: number;   // µg/m³
  pm10: number;   // µg/m³
  no2: number;    // µg/m³
  co: number;     // mg/m³
  o3: number;     // µg/m³
  so2: number;    // µg/m³
}

export interface InversionMetrics {
  lapseRate: number;              // °C / 100m (positive = inversion trapping)
  surfaceTemp: number;            // °C
  boundaryLayerHeight: number;    // meters above ground level
  isInversionActive: boolean;
  inversionStrength: 'None' | 'Weak' | 'Moderate' | 'Severe';
  breakupWindowEst: string;       // e.g., "1:15 PM - 3:45 PM"
}

export interface UrbanZone {
  zoneId: string;
  name: string;
  city: string;
  aqi: number;
  severity: SeverityLevel;
  primaryPollutant: keyof PollutantValues;
  pollutants: PollutantValues;
  inversion: InversionMetrics;
  historicalSparkline: number[]; // 12-hour hourly AQI
  lastUpdated: string;
}

export interface VulnerabilityPersona {
  id: string;
  label: string;
  category: 'infant' | 'asthmatic' | 'elderly' | 'commuter' | 'pet';
  respiratoryMinuteVol: number;  // Liters/min (VE)
  highRiskThresholdAQI: number;
  clinicalNote: string;
  iconName: string;
}

export interface RoutineHourItem {
  timeSlot: string;
  activity: string;
  recommendedAction: string;
  locationType: 'indoor' | 'outdoor' | 'transit';
  riskScore: 'low' | 'moderate' | 'high' | 'prohibited';
  scientificRationale: string;
  impactMetric: string;
}

export interface GenAIRoutinePlan {
  personaId: string;
  zoneId: string;
  currentAqi: number;
  advisoryHeadline: string;
  safeOutdoorWindow: string;
  hourlySchedule: RoutineHourItem[];
  biomedicalSummary: string;
  modeledInhaledDoseAvoidedUg: number;
  generatedAt: string;
  source: 'gemini-live' | 'deterministic-fallback';
}

export interface CommuteMode {
  id: string;
  name: string;
  minuteVentilation: number;    // L/min
  filterEfficiency: number;     // 0.0 to 1.0 (e.g. 0.90 for AC Metro HEPA)
  co2GramsPerKm: number;
  averageSpeedKmh: number;
  icon: string;
}

export interface RouteOption {
  id: string;
  title: string;
  mode: string;
  distanceKm: number;
  durationMins: number;
  avgRouteAqi: number;
  inhaledDoseUg: number;
  co2EmittedG: number;
  isRecommended: boolean;
  pathSegments: string[];
}

export interface RoomCADRConfig {
  roomName: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  occupants: number;
  targetACH: number;            // Standard: 4-6 ACH
  naturalACH: number;           // Standard residential infiltration: ~0.5 ACH
  outdoorAqi: number;
}

export interface CADRResult {
  roomVolumeM3: number;
  requiredCADRM3h: number;      // m³/h
  requiredCADRCFM: number;      // ft³/min (CFM)
  clearanceTime95PercentMins: number;
  estimatedIndoorAqi: number;
  hepaMatchesCount: number;
}

export interface DIYPurifierBlueprint {
  id: string;
  title: string;
  estimatedCostInr: number;
  cadrspecM3h: number;
  achRating: string;
  materials: string[];
  instructions: string[];
  safetyNotes: string[];
}

export interface CommunityPledge {
  id: string;
  title: string;
  description: string;
  co2AvoidedKgPerDay: number;
  pm25AvoidedGramsPerDay: number;
  participantsCount: number;
  isPledged: boolean;
}

export interface EmergencyAdvisory {
  zoneName: string;
  aqi: number;
  severity: SeverityLevel;
  issuedAt: string;
  actionProtocol: string[];
  vulnerablePrecautions: string[];
  legalMandates: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'es';
