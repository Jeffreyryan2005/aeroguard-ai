// ============================================================
// server/aiService.ts
// Google Gemini GenAI Integration & Deterministic Clinical Fallback
// Generates personalized daily routines, inversion windows & rationale
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UrbanZone, VulnerabilityPersona, GenAIRoutinePlan, RoutineHourItem } from '../src/types';
import { logger } from '../src/lib/logger';
import { calculateInhaledPM25Dose } from '../src/lib/aqiCompute';

/**
 * Deterministic clinical fallback generator.
 * Produces an evidence-based hourly schedule tailored to the persona, AQI, and inversion metrics.
 */
export function generateDeterministicPlan(
  persona: VulnerabilityPersona,
  zone: UrbanZone,
  _language: string = 'en'
): GenAIRoutinePlan {
  const isSevere = zone.aqi >= 300;
  const isInverted = zone.inversion.isInversionActive;

  const safeWindow = isInverted
    ? '1:00 PM - 3:30 PM (Solar Convection Peak)'
    : isSevere
    ? '12:30 PM - 2:30 PM'
    : '10:00 AM - 4:00 PM';

  const hourlySchedule: RoutineHourItem[] = [
    {
      timeSlot: '07:00 AM - 09:00 AM',
      activity: 'Morning Commute & School Run',
      recommendedAction: isSevere
        ? 'STRICT INDOOR / CLOSED VEHICLE: Ground inversion traps diesel soot. Seal windows, run HEPA, delay non-essential school runs.'
        : 'Wear N95/FFP2 mask; avoid open-air walking along main arterial roads.',
      locationType: 'indoor',
      riskScore: isSevere ? 'prohibited' : 'high',
      scientificRationale:
        'Nocturnal boundary layer inversion concentrates ultrafine PM2.5 within 80m of asphalt. Human minute ventilation during morning walking causes deep alveolar deposition.',
      impactMetric: 'Avoids ~145 µg of inhaled particulate matter',
    },
    {
      timeSlot: '09:00 AM - 12:00 PM',
      activity: 'Workplace / Study Hours',
      recommendedAction:
        'Continuous indoor filtration (target 4 ACH). Keep all external windows tightly latched; use door sweep seals.',
      locationType: 'indoor',
      riskScore: 'low',
      scientificRationale:
        'Indoor sealed spaces with active MERV-13/HEPA filtration reduce particulate concentration by 75-88% relative to ambient outdoor air.',
      impactMetric: 'Reduces indoor PM2.5 to < 35 µg/m³',
    },
    {
      timeSlot: '01:00 PM - 03:30 PM',
      activity: 'Permissible Outdoor Tasks / Aeration Window',
      recommendedAction:
        'OPTIMAL SOLAR WINDOW: Solar surface heating elevates the boundary mixing layer to 850m. Conduct brief outdoor errands or 20-min cross-ventilation purge.',
      locationType: 'outdoor',
      riskScore: isSevere ? 'moderate' : 'low',
      scientificRationale:
        'Solar thermal convection breaks the ground-level inversion cap, diluting surface particulate density by up to 40% compared to early morning peaks.',
      impactMetric: 'Optimal balance of fresh air exchange vs smog exposure',
    },
    {
      timeSlot: '04:00 PM - 07:00 PM',
      activity: 'Evening Commute & Groceries',
      recommendedAction:
        'Prefer subterranean Metro or AC electric bus with internal recirculation. Avoid open auto-rickshaws or unmasked bicycle riding.',
      locationType: 'transit',
      riskScore: isSevere ? 'high' : 'moderate',
      scientificRationale:
        'Subterranean metro systems feature specialized track ventilation and carriage filtration, lowering inhaled dose by 85% compared to road-level transit.',
      impactMetric: 'Averts 85% of traffic emissions inhalation',
    },
    {
      timeSlot: '07:00 PM - 10:00 PM',
      activity: 'Evening Relaxation & Sleep Prep',
      recommendedAction:
        'Activate bedroom Corsi-Rosenthal Box or HEPA purifier at Medium-High speed 45 minutes before sleep to achieve 4 ACH clean air decay.',
      locationType: 'indoor',
      riskScore: 'low',
      scientificRationale:
        'Sleeping in a purified room prevents nocturnal nocturnal hypoxemia and airway inflammation in asthmatic and elderly occupants.',
      impactMetric: 'Maintains sleeping PM2.5 < 15 µg/m³ throughout 8 hours',
    },
  ];

  // Calculate modeled inhaled dose avoided
  const outdoorHours = 4;
  const unmitigatedDose = calculateInhaledPM25Dose(
    outdoorHours * 60,
    zone.pollutants.pm25,
    persona.respiratoryMinuteVol,
    0.0
  );
  const mitigatedDose = calculateInhaledPM25Dose(
    outdoorHours * 60,
    zone.pollutants.pm25,
    persona.respiratoryMinuteVol,
    0.85
  );
  const avoidedUg = Math.round(unmitigatedDose - mitigatedDose);

  const headline = isSevere
    ? `🚨 SEVERE SMOG ALERT: Ground Inversion Active in ${zone.name}. Restrict ${persona.label} to Solar Midday Window.`
    : `⚠️ Elevated Pollution in ${zone.name}: Maintain Indoor Filtration and Follow Inversion-Aware Schedule.`;

  const biomedicalSummary = `Targeted clinical protection for ${persona.label}. Resting/active minute volume is ${persona.respiratoryMinuteVol} L/min. Given current AQI of ${zone.aqi} (${zone.severity}) with inversion lapse rate of +${zone.inversion.lapseRate}°C/100m, adhering to this schedule prevents an estimated ${avoidedUg} µg of deep alveolar particulate deposition.`;

  return {
    personaId: persona.id,
    zoneId: zone.zoneId,
    currentAqi: zone.aqi,
    advisoryHeadline: headline,
    safeOutdoorWindow: safeWindow,
    hourlySchedule,
    biomedicalSummary,
    modeledInhaledDoseAvoidedUg: avoidedUg,
    generatedAt: new Date().toISOString(),
    source: 'deterministic-fallback',
  };
}

/**
 * Server-side Gemini AI caller with dynamic prompt and deterministic fallback.
 */
export async function getAiRoutineInsights(
  persona: VulnerabilityPersona,
  zone: UrbanZone,
  language: string = 'en'
): Promise<GenAIRoutinePlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    logger.info('Using deterministic clinical fallback (no Gemini API key configured).');
    return generateDeterministicPlan(persona, zone, language);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash or gemini-1.5-flash
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are AeroGuard AI, an expert clinical pulmonologist and atmospheric physicist.
Analyze the following urban air quality and family vulnerability profile to produce an hourly daily routine:

LOCATION / ZONE:
- Zone Name: ${zone.name} (${zone.city})
- Air Quality Index (AQI): ${zone.aqi} (${zone.severity})
- PM2.5: ${zone.pollutants.pm25} µg/m³, PM10: ${zone.pollutants.pm10} µg/m³, NO2: ${zone.pollutants.no2} µg/m³
- Atmospheric Inversion: Lapse Rate ${zone.inversion.lapseRate} °C/100m, Mixing Height ${zone.inversion.boundaryLayerHeight}m, Active: ${zone.inversion.isInversionActive}

VULNERABILITY PERSONA:
- Persona: ${persona.label} (${persona.category})
- Minute Ventilation Rate: ${persona.respiratoryMinuteVol} L/min
- Clinical Warning: ${persona.clinicalNote}

TARGET LANGUAGE: ${language}

Provide a JSON object response with the following schema:
{
  "advisoryHeadline": "Short urgent headline",
  "safeOutdoorWindow": "Estimated safe time window (e.g. 1:00 PM - 3:30 PM)",
  "biomedicalSummary": "Clinical explanation of particulate deposition and physiological risks",
  "modeledInhaledDoseAvoidedUg": 250,
  "hourlySchedule": [
    {
      "timeSlot": "07:00 AM - 09:00 AM",
      "activity": "Morning Routine / Commute",
      "recommendedAction": "Actionable advice",
      "locationType": "indoor" | "outdoor" | "transit",
      "riskScore": "low" | "moderate" | "high" | "prohibited",
      "scientificRationale": "Atmospheric and biomedical reasoning",
      "impactMetric": "Quantified reduction in exposure"
    }
  ]
}
Return ONLY valid JSON.
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      personaId: persona.id,
      zoneId: zone.zoneId,
      currentAqi: zone.aqi,
      advisoryHeadline: parsed.advisoryHeadline || `Air Quality Plan for ${persona.label}`,
      safeOutdoorWindow: parsed.safeOutdoorWindow || zone.inversion.breakupWindowEst,
      hourlySchedule: Array.isArray(parsed.hourlySchedule) ? parsed.hourlySchedule : [],
      biomedicalSummary: parsed.biomedicalSummary || '',
      modeledInhaledDoseAvoidedUg: Number(parsed.modeledInhaledDoseAvoidedUg) || 180,
      generatedAt: new Date().toISOString(),
      source: 'gemini-live',
    };
  } catch (err) {
    logger.warn('Gemini live call encountered an issue, falling back to deterministic plan:', err);
    return generateDeterministicPlan(persona, zone, language);
  }
}

/**
 * Generates an emergency public health advisory broadcast.
 */
export async function getEmergencyAdvisoryText(
  zone: UrbanZone,
  language: string = 'en'
): Promise<string> {
  const fallback = `EMERGENCY SMOG ADVISORY for ${zone.name}: AQI has reached ${zone.aqi} (${zone.severity.toUpperCase()}). Severe ground-level temperature inversion is trapping toxic particulate matter. Vulnerable residents (infants, elderly, asthmatics) must remain indoors with active air filtration. Avoid non-essential outdoor physical activity until solar inversion breakup window (${zone.inversion.breakupWindowEst}).`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallback;
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Write an official 3-sentence public health emergency advisory for ${zone.name} where AQI is ${zone.aqi} with active thermal inversion. Target language: ${language}. Return plain text.`;
    const response = await model.generateContent(prompt);
    return response.response.text().trim();
  } catch {
    return fallback;
  }
}
