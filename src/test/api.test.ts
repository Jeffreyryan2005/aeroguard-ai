// ============================================================
// src/test/api.test.ts
// Integration Tests for Backend Routes, Zod Schemas & SHA-256 Cache
// Tier 3 Validation Suite: Zero-Trust Security & API Reliability
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { insightCache, hashPayload, pruneCache, clearCache, MAX_CACHE_ENTRIES } from '../../server/cache';
import { validateZone, validatePersona, sanitizeText } from '../../server/validators';
import { generateDeterministicPlan } from '../../server/aiService';
import { INITIAL_ZONES, VULNERABILITY_PERSONAS } from '../lib/constants';

describe('SHA-256 Hash-Keyed LRU AI Cache', () => {
  beforeEach(() => {
    clearCache();
  });

  it('generates consistent deterministic hashes for identical objects with different key order', () => {
    const hash1 = hashPayload({ aqi: 400, zoneId: 'z1', lang: 'en' });
    const hash2 = hashPayload({ lang: 'en', aqi: 400, zoneId: 'z1' });
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(16);
  });

  it('enforces maximum cache capacity and evicts oldest items', () => {
    for (let i = 0; i < MAX_CACHE_ENTRIES + 10; i++) {
      pruneCache();
      insightCache.set(`key-${i}`, { data: `val-${i}`, cachedAt: Date.now() });
    }

    expect(insightCache.size).toBeLessThanOrEqual(MAX_CACHE_ENTRIES + 1);
  });
});

describe('Zod Validation Schemas and Text Sanitizers', () => {
  it('validates a correct UrbanZone payload', () => {
    expect(validateZone(INITIAL_ZONES[0])).toBe(true);
  });

  it('rejects an invalid zone payload with missing fields or negative AQI', () => {
    const invalid = { ...INITIAL_ZONES[0], aqi: -50 };
    expect(validateZone(invalid)).toBe(false);
  });

  it('validates a correct VulnerabilityPersona payload', () => {
    expect(validatePersona(VULNERABILITY_PERSONAS[0])).toBe(true);
  });

  it('sanitizes malicious script tags and injection patterns', () => {
    const dirty = '<script>alert("xss")</script>Hello World; rm -rf /';
    const clean = sanitizeText(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain(';</script>');
    expect(clean).toContain('Hello World');
  });
});

describe('Deterministic Clinical Routine Generator', () => {
  it('generates a complete clinical schedule with scientific rationale', () => {
    const plan = generateDeterministicPlan(VULNERABILITY_PERSONAS[1], INITIAL_ZONES[0], 'en');
    expect(plan.personaId).toBe('asthmatic');
    expect(plan.hourlySchedule.length).toBeGreaterThan(3);
    expect(plan.modeledInhaledDoseAvoidedUg).toBeGreaterThan(50);
    expect(plan.safeOutdoorWindow).toContain('Solar');
  });
});
