// ============================================================
// src/lib/api.ts
// Typed Client-Side API Service with Resilient Fallback Layer
// Guarantees zero UI crashing even during serverless cold starts
// ============================================================

import type { UrbanZone, VulnerabilityPersona, GenAIRoutinePlan } from '../types';
import { generateDeterministicPlan } from '../../server/aiService';
import { logger } from './logger';

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
