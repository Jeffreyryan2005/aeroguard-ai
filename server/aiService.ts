// ============================================================
// server/aiService.ts
// Google Gemini GenAI Integration & Deterministic Clinical Fallback
// Generates personalized daily routines, inversion windows & rationale
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UrbanZone, VulnerabilityPersona, GenAIRoutinePlan } from '../src/types';
import { logger } from '../src/lib/logger';
import { generateDeterministicPlan } from '../src/lib/clinicalPlan';

export { generateDeterministicPlan };

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
