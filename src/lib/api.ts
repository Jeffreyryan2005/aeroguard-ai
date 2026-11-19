// ============================================================
// src/lib/api.ts
// Typed Client-Side API Service with Resilient Fallback Layer
// Zero cross-boundary imports — 100% pure client module
// Guarantees zero UI crashing even during serverless cold starts
// ============================================================

import type { UrbanZone, VulnerabilityPersona, GenAIRoutinePlan } from '../types';
import { generateDeterministicPlan } from './clinicalPlan';
import { logger } from './logger';

/**
 * Fetches AI-generated daily schedule or falls back to client deterministic engine.
 */
export async function fetchRoutineInsights(
  persona: VulnerabilityPersona,
  zone: UrbanZone,
  language: string = 'en'
): Promise<GenAIRoutinePlan> {
  try {
    const res = await fetch('/api/routine-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona, zone, language }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data: GenAIRoutinePlan = await res.json();
    return data;
  } catch (err) {
    logger.warn('Backend API request failed or offline, engaging client deterministic engine:', err);
    return generateDeterministicPlan(persona, zone, language);
  }
}

/**
 * Fetches localized public health emergency advisory text.
 */
export async function fetchEmergencyAdvisory(
  zone: UrbanZone,
  language: string = 'en'
): Promise<string> {
  try {
    const res = await fetch('/api/emergency-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone, language }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.advisory || '';
  } catch (err) {
    logger.warn('Advisory API offline, using fallback advisory text:', err);
    return `SMOG EMERGENCY PROTOCOL (${zone.name}): AQI is ${zone.aqi} (${zone.severity.toUpperCase()}). Boundary layer inversion is trapping particulate matter. Vulnerable family members must avoid outdoor exertion. Maintain 4 ACH indoor air purification.`;
  }
}
