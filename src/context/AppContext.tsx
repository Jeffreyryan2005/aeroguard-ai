// ============================================================
// src/context/AppContext.tsx
// Global Application State Management for AeroGuard AI
// Controls Zone Telemetry, Family Personas, Simulations & WCAG A11y
// ============================================================

import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type {
  UrbanZone,
  VulnerabilityPersona,
  SupportedLanguage,
  CommunityPledge,
} from '../types';
import {
  INITIAL_ZONES,
  VULNERABILITY_PERSONAS,
  INITIAL_COMMUNITY_PLEDGES,
  TRANSLATIONS,
} from '../lib/constants';

interface AppContextValue {
  selectedZone: UrbanZone;
  setSelectedZone: (zone: UrbanZone) => void;
  selectedPersona: VulnerabilityPersona;
  setSelectedPersona: (persona: VulnerabilityPersona) => void;
  zones: UrbanZone[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isAudioAlertsEnabled: boolean;
  toggleAudioAlerts: () => void;
  pledges: CommunityPledge[];
  togglePledge: (pledgeId: string) => void;
  simulateSpike: () => void;
  simulateCleansing: () => void;
  resetSimulation: () => void;
  isSimulationActive: boolean;
  t: typeof TRANSLATIONS['en'];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<UrbanZone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(INITIAL_ZONES[0].zoneId);
  const [selectedPersona, setSelectedPersona] = useState<VulnerabilityPersona>(VULNERABILITY_PERSONAS[1]); // Asthmatic
  const [activeTab, setActiveTab] = useState<string>('telemetry');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isAudioAlertsEnabled, setIsAudioAlertsEnabled] = useState<boolean>(false);
  const [pledges, setPledges] = useState<CommunityPledge[]>(INITIAL_COMMUNITY_PLEDGES);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);

  const selectedZone = useMemo(
    () => zones.find((z) => z.zoneId === selectedZoneId) || zones[0],
    [zones, selectedZoneId]
  );

  const setSelectedZone = (zone: UrbanZone) => {
    setSelectedZoneId(zone.zoneId);
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  const toggleAudioAlerts = () => {
    setIsAudioAlertsEnabled((prev) => !prev);
  };

  const togglePledge = (pledgeId: string) => {
    setPledges((prev) =>
      prev.map((p) =>
        p.id === pledgeId
          ? {
              ...p,
              isPledged: !p.isPledged,
              participantsCount: p.isPledged ? p.participantsCount - 1 : p.participantsCount + 1,
            }
          : p
      )
    );
  };

  const simulateSpike = () => {
    setIsSimulationActive(true);
    setZones((prev) =>
      prev.map((z) =>
        z.zoneId === selectedZoneId
          ? {
              ...z,
              aqi: 465,
              severity: 'hazardous',
              pollutants: { ...z.pollutants, pm25: 420, pm10: 580, no2: 110 },
              inversion: {
                lapseRate: 3.4,
                surfaceTemp: 9,
                boundaryLayerHeight: 65,
                isInversionActive: true,
                inversionStrength: 'Severe',
                breakupWindowEst: '2:00 PM - 3:30 PM (Severe Nocturnal Cap)',
              },
              historicalSparkline: [...z.historicalSparkline.slice(1), 465],
              lastUpdated: 'Simulated Nocturnal Inversion Spike',
            }
          : z
      )
    );
  };

  const simulateCleansing = () => {
    setIsSimulationActive(true);
    setZones((prev) =>
      prev.map((z) =>
        z.zoneId === selectedZoneId
          ? {
              ...z,
              aqi: 115,
              severity: 'moderate',
              pollutants: { ...z.pollutants, pm25: 42, pm10: 95, no2: 38 },
              inversion: {
                lapseRate: -0.6,
                surfaceTemp: 23,
                boundaryLayerHeight: 880,
                isInversionActive: false,
                inversionStrength: 'None',
                breakupWindowEst: 'Dispersion Active (Inversion Dissipated)',
              },
              historicalSparkline: [...z.historicalSparkline.slice(1), 115],
              lastUpdated: 'Simulated Solar Convection Cleansing',
            }
          : z
      )
    );
  };

  const resetSimulation = () => {
    setIsSimulationActive(false);
    setZones(INITIAL_ZONES);
  };

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  const value: AppContextValue = {
    selectedZone,
    setSelectedZone,
    selectedPersona,
    setSelectedPersona,
    zones,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    isHighContrast,
    toggleHighContrast,
    isAudioAlertsEnabled,
    toggleAudioAlerts,
    pledges,
    togglePledge,
    simulateSpike,
    simulateCleansing,
    resetSimulation,
    isSimulationActive,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
