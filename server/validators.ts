// ============================================================
// server/validators.ts
// Zod Runtime Validation Schemas & Input Sanitizers
// Enforces Zero-Trust Architecture & OWASP Parameter Integrity
// ============================================================

import { z } from 'zod';
import type { UrbanZone, VulnerabilityPersona } from '../src/types';

export const PollutantsSchema = z.object({
  pm25: z.number().min(0).max(1000),
  pm10: z.number().min(0).max(1500),
  no2: z.number().min(0).max(500),
  co: z.number().min(0).max(100),
  o3: z.number().min(0).max(500),
  so2: z.number().min(0).max(500),
});

export const InversionSchema = z.object({
  lapseRate: z.number(),
  surfaceTemp: z.number(),
  boundaryLayerHeight: z.number().min(10),
  isInversionActive: z.boolean(),
  inversionStrength: z.enum(['None', 'Weak', 'Moderate', 'Severe']),
  breakupWindowEst: z.string(),
});

export const ZoneSchema = z.object({
  zoneId: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  aqi: z.number().min(0).max(500),
  severity: z.enum(['good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'very-unhealthy', 'hazardous']),
  primaryPollutant: z.enum(['pm25', 'pm10', 'no2', 'co', 'o3', 'so2']),
  pollutants: PollutantsSchema,
  inversion: InversionSchema,
  historicalSparkline: z.array(z.number()),
  lastUpdated: z.string(),
});

export const PersonaSchema = z.object({
  id: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  category: z.enum(['infant', 'asthmatic', 'elderly', 'commuter', 'pet']),
  respiratoryMinuteVol: z.number().positive(),
  highRiskThresholdAQI: z.number().positive(),
  clinicalNote: z.string(),
  iconName: z.string(),
});

export function validateZone(data: unknown): data is UrbanZone {
  const parsed = ZoneSchema.safeParse(data);
  return parsed.success;
}

export function validatePersona(data: unknown): data is VulnerabilityPersona {
  const parsed = PersonaSchema.safeParse(data);
  return parsed.success;
}

/**
 * Strips script tags, HTML entities, and trims whitespace.
 */
export function sanitizeText(input: unknown, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/[;&$><]/g, '')
    .trim()
    .slice(0, maxLength);
}
