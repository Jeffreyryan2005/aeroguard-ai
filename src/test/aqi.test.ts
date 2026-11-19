// ============================================================
// src/test/aqi.test.ts
// Comprehensive Unit Tests for Pure Mathematical Computations
// Tier 1 Validation Suite: 100% Deterministic Mathematical Precision
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  calculateEPA_AQI,
  getSeverityLevel,
  evaluateInversionRisk,
  calculateInhaledPM25Dose,
  calculateRequiredCADR,
  calculateCommunityOffset,
} from '../lib/aqiCompute';
import { TRANSLATIONS, VULNERABILITY_PERSONAS, INITIAL_ZONES, COMMUTE_MODES } from '../lib/constants';

describe('EPA PM2.5 AQI Breakpoint Calculations', () => {
  it('returns 0 for zero or negative concentrations', () => {
    expect(calculateEPA_AQI(0)).toBe(0);
    expect(calculateEPA_AQI(-5)).toBe(0);
    expect(calculateEPA_AQI(-0.01)).toBe(0);
  });

  it('calculates Good bracket (0 - 12.0 µg/m³)', () => {
    expect(calculateEPA_AQI(0.0)).toBe(0);
    expect(calculateEPA_AQI(3.0)).toBe(13);
    expect(calculateEPA_AQI(6.0)).toBe(25);
    expect(calculateEPA_AQI(9.0)).toBe(38);
    expect(calculateEPA_AQI(12.0)).toBe(50);
  });

  it('calculates Moderate bracket (12.1 - 35.4 µg/m³)', () => {
    expect(calculateEPA_AQI(12.1)).toBe(51);
    expect(calculateEPA_AQI(20.0)).toBe(68);
    expect(calculateEPA_AQI(25.0)).toBe(78);
    expect(calculateEPA_AQI(30.0)).toBe(89);
    expect(calculateEPA_AQI(35.4)).toBe(100);
  });

  it('calculates Unhealthy for Sensitive Groups (35.5 - 55.4 µg/m³)', () => {
    expect(calculateEPA_AQI(35.5)).toBe(101);
    expect(calculateEPA_AQI(40.0)).toBe(112);
    expect(calculateEPA_AQI(45.0)).toBe(124);
    expect(calculateEPA_AQI(50.0)).toBe(137);
    expect(calculateEPA_AQI(55.4)).toBe(150);
  });

  it('calculates Unhealthy bracket (55.5 - 150.4 µg/m³)', () => {
    expect(calculateEPA_AQI(55.5)).toBe(151);
    expect(calculateEPA_AQI(80.0)).toBe(164);
    expect(calculateEPA_AQI(100.0)).toBe(174);
    expect(calculateEPA_AQI(125.0)).toBe(187);
    expect(calculateEPA_AQI(150.4)).toBe(200);
  });

  it('calculates Very Unhealthy bracket (150.5 - 250.4 µg/m³)', () => {
    expect(calculateEPA_AQI(150.5)).toBe(201);
    expect(calculateEPA_AQI(180.0)).toBe(230);
    expect(calculateEPA_AQI(200.0)).toBe(250);
    expect(calculateEPA_AQI(225.0)).toBe(275);
    expect(calculateEPA_AQI(250.4)).toBe(300);
  });

  it('calculates Hazardous bracket (250.5 - 500.4 µg/m³)', () => {
    expect(calculateEPA_AQI(250.5)).toBe(301);
    expect(calculateEPA_AQI(300.0)).toBe(350);
    expect(calculateEPA_AQI(350.4)).toBe(400);
    expect(calculateEPA_AQI(425.0)).toBe(450);
    expect(calculateEPA_AQI(500.4)).toBe(500);
  });

  it('caps at 500 for extreme off-chart concentrations', () => {
    expect(calculateEPA_AQI(501)).toBe(500);
    expect(calculateEPA_AQI(650)).toBe(500);
    expect(calculateEPA_AQI(1200)).toBe(500);
    expect(calculateEPA_AQI(9999)).toBe(500);
  });
});

describe('Discrete Categorical Severity Resolution', () => {
  it('resolves good for AQI <= 50', () => {
    expect(getSeverityLevel(0)).toBe('good');
    expect(getSeverityLevel(25)).toBe('good');
    expect(getSeverityLevel(50)).toBe('good');
  });

  it('resolves moderate for 51 - 100', () => {
    expect(getSeverityLevel(51)).toBe('moderate');
    expect(getSeverityLevel(75)).toBe('moderate');
    expect(getSeverityLevel(100)).toBe('moderate');
  });

  it('resolves unhealthy-sensitive for 101 - 150', () => {
    expect(getSeverityLevel(101)).toBe('unhealthy-sensitive');
    expect(getSeverityLevel(125)).toBe('unhealthy-sensitive');
    expect(getSeverityLevel(150)).toBe('unhealthy-sensitive');
  });

  it('resolves unhealthy for 151 - 200', () => {
    expect(getSeverityLevel(151)).toBe('unhealthy');
    expect(getSeverityLevel(175)).toBe('unhealthy');
    expect(getSeverityLevel(200)).toBe('unhealthy');
  });

  it('resolves very-unhealthy for 201 - 300', () => {
    expect(getSeverityLevel(201)).toBe('very-unhealthy');
    expect(getSeverityLevel(250)).toBe('very-unhealthy');
    expect(getSeverityLevel(300)).toBe('very-unhealthy');
  });

  it('resolves hazardous for > 300', () => {
    expect(getSeverityLevel(301)).toBe('hazardous');
    expect(getSeverityLevel(400)).toBe('hazardous');
    expect(getSeverityLevel(500)).toBe('hazardous');
    expect(getSeverityLevel(999)).toBe('hazardous');
  });
});

describe('Atmospheric Boundary Layer Inversion Thermodynamics', () => {
  it('detects normal tropospheric cooling with negative lapse rate', () => {
    const res = evaluateInversionRisk(25, 23.7, 200);
    expect(res.isInversionActive).toBe(false);
    expect(res.inversionStrength).toBe('None');
    expect(res.boundaryLayerHeight).toBe(850);
    expect(res.breakupWindowEst).toContain('All-Day');
  });

  it('detects zero lapse rate as non-inversion', () => {
    const res = evaluateInversionRisk(20, 20, 200);
    expect(res.isInversionActive).toBe(false);
    expect(res.inversionStrength).toBe('None');
  });

  it('detects weak ground inversion for lapse rate < 1.0 °C/100m', () => {
    const res = evaluateInversionRisk(12, 13.5, 200); // +0.75 °C/100m
    expect(res.isInversionActive).toBe(true);
    expect(res.inversionStrength).toBe('Weak');
    expect(res.boundaryLayerHeight).toBe(450);
  });

  it('detects moderate inversion for lapse rate 1.0 - 2.5 °C/100m', () => {
    const res = evaluateInversionRisk(10, 13.6, 200); // +1.8 °C/100m
    expect(res.isInversionActive).toBe(true);
    expect(res.inversionStrength).toBe('Moderate');
    expect(res.boundaryLayerHeight).toBe(220);
  });

  it('detects severe inversion for lapse rate >= 2.5 °C/100m', () => {
    const res = evaluateInversionRisk(8, 14.0, 200); // +3.0 °C/100m
    expect(res.isInversionActive).toBe(true);
    expect(res.inversionStrength).toBe('Severe');
    expect(res.boundaryLayerHeight).toBe(90);
    expect(res.breakupWindowEst).toContain('Solar');
  });
});

describe('Inhaled PM2.5 Microgram Dose Calculation', () => {
  it('returns 0 for non-positive duration, concentration, or ventilation', () => {
    expect(calculateInhaledPM25Dose(0, 150, 20)).toBe(0);
    expect(calculateInhaledPM25Dose(-10, 150, 20)).toBe(0);
    expect(calculateInhaledPM25Dose(30, 0, 20)).toBe(0);
    expect(calculateInhaledPM25Dose(30, -50, 20)).toBe(0);
    expect(calculateInhaledPM25Dose(30, 150, 0)).toBe(0);
    expect(calculateInhaledPM25Dose(30, 150, -5)).toBe(0);
  });

  it('accurately computes dose for standard unmasked breathing', () => {
    expect(calculateInhaledPM25Dose(60, 200, 20, 0.0)).toBe(240);
  });

  it('accurately applies filter / mask efficiency reduction', () => {
    expect(calculateInhaledPM25Dose(60, 200, 20, 0.95)).toBe(12);
  });

  it('computes dose across all 5 vulnerability personas', () => {
    for (const p of VULNERABILITY_PERSONAS) {
      const dose = calculateInhaledPM25Dose(60, 150, p.respiratoryMinuteVol, 0.0);
      expect(dose).toBeGreaterThan(0);
      expect(typeof dose).toBe('number');
    }
  });

  it('clamps filter efficiency between 0 and 1', () => {
    expect(calculateInhaledPM25Dose(60, 200, 20, 1.5)).toBe(0);
    expect(calculateInhaledPM25Dose(60, 200, 20, -0.5)).toBe(240);
  });
});

describe('ANSI/AHAM AC-1 Room CADR & Clearance Decay', () => {
  it('computes room volume, required CADR, and clearance duration correctly', () => {
    const result = calculateRequiredCADR({
      roomName: 'Bedroom',
      lengthM: 5,
      widthM: 4,
      heightM: 3,
      occupants: 2,
      targetACH: 4,
      naturalACH: 0.5,
      outdoorAqi: 350,
    });

    expect(result.roomVolumeM3).toBe(60);
    expect(result.requiredCADRM3h).toBe(240);
    expect(result.requiredCADRCFM).toBe(141);
    expect(result.clearanceTime95PercentMins).toBe(40);
    expect(result.estimatedIndoorAqi).toBeLessThan(50);
    expect(result.hepaMatchesCount).toBe(2);
  });

  it('scales required CADR linearly with target ACH', () => {
    const r4 = calculateRequiredCADR({
      roomName: 'Living Room',
      lengthM: 4,
      widthM: 4,
      heightM: 3,
      occupants: 1,
      targetACH: 4,
      naturalACH: 0.5,
      outdoorAqi: 200,
    });
    const r6 = calculateRequiredCADR({
      roomName: 'Living Room',
      lengthM: 4,
      widthM: 4,
      heightM: 3,
      occupants: 1,
      targetACH: 6,
      naturalACH: 0.5,
      outdoorAqi: 200,
    });

    expect(r6.requiredCADRM3h).toBe(Math.round((r4.requiredCADRM3h / 4) * 6));
  });
});

describe('Community Offset Mitigation Computations', () => {
  it('aggregates community CO2 and PM2.5 avoidance accurately', () => {
    const mockPledges = [
      {
        id: 'p1',
        title: 'Carpool',
        description: 'Test',
        co2AvoidedKgPerDay: 2,
        pm25AvoidedGramsPerDay: 20,
        participantsCount: 100,
        isPledged: true, // +1
      },
      {
        id: 'p2',
        title: 'Zero Waste',
        description: 'Test',
        co2AvoidedKgPerDay: 5,
        pm25AvoidedGramsPerDay: 50,
        participantsCount: 50,
        isPledged: false,
      },
    ];

    const offset = calculateCommunityOffset(mockPledges);
    expect(offset.totalCo2AvoidedKg).toBe(452);
    expect(offset.totalPm25AvoidedG).toBe(4520);
    expect(offset.communityShieldScore).toBeGreaterThanOrEqual(65);
  });
});

describe('Domain Constants Integrity & Consistency', () => {
  it('contains valid initial urban monitoring zones', () => {
    expect(INITIAL_ZONES.length).toBeGreaterThanOrEqual(5);
    for (const z of INITIAL_ZONES) {
      expect(z.aqi).toBeGreaterThanOrEqual(0);
      expect(z.historicalSparkline.length).toBe(12);
      expect(z.pollutants.pm25).toBeGreaterThanOrEqual(0);
    }
  });

  it('contains exactly 5 vulnerability personas with positive minute volumes', () => {
    expect(VULNERABILITY_PERSONAS.length).toBe(5);
    for (const p of VULNERABILITY_PERSONAS) {
      expect(p.respiratoryMinuteVol).toBeGreaterThan(0);
      expect(p.highRiskThresholdAQI).toBeGreaterThan(0);
    }
  });

  it('contains 6 commute modes with positive speeds', () => {
    expect(COMMUTE_MODES.length).toBe(6);
    for (const m of COMMUTE_MODES) {
      expect(m.averageSpeedKmh).toBeGreaterThan(0);
      expect(m.filterEfficiency).toBeGreaterThanOrEqual(0);
      expect(m.filterEfficiency).toBeLessThanOrEqual(1);
    }
  });

  it('maintains parity across all supported language translations', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const hiKeys = Object.keys(TRANSLATIONS.hi).sort();
    const esKeys = Object.keys(TRANSLATIONS.es).sort();

    expect(hiKeys).toEqual(enKeys);
    expect(esKeys).toEqual(enKeys);
  });
});
