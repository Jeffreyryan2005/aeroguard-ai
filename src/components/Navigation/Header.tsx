// ============================================================
// src/components/Navigation/Header.tsx
// Accessible Application Header with Status, City Selector & A11y Controls
// Fully compliant with WCAG 2.2 AA (ARIA landmarks, labels, high contrast)
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';
import type { SupportedLanguage } from '../../types';
import { Shield, Volume2, VolumeX, Eye, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    selectedZone,
    setSelectedZone,
    zones,
    language,
    setLanguage,
    isHighContrast,
    toggleHighContrast,
    isAudioAlertsEnabled,
    toggleAudioAlerts,
    t,
  } = useApp();

  return (
    <header
      role="banner"
      className={`border-b transition-colors px-4 py-3 sm:px-6 lg:px-8 ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Shield className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t.appTitle}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                v1.0 Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Zone Selector & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* City / Zone Picker */}
          <div className="relative">
            <label htmlFor="zone-select" className="sr-only">
              Select Urban Monitoring Zone
            </label>
            <select
              id="zone-select"
              value={selectedZone.zoneId}
              onChange={(e) => {
                const z = zones.find((item) => item.zoneId === e.target.value);
                if (z) setSelectedZone(z);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {zones.map((zone) => (
                <option key={zone.zoneId} value={zone.zoneId}>
                  {zone.name} ({zone.city}) — AQI {zone.aqi}
                </option>
              ))}
            </select>
          </div>

          {/* Accessibility: Audio Alert Toggle */}
          <button
            type="button"
            onClick={toggleAudioAlerts}
            aria-pressed={isAudioAlertsEnabled}
            title={isAudioAlertsEnabled ? 'Disable Audio Cues' : 'Enable Auditory Cues for Visually Impaired'}
            className={`p-2 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              isAudioAlertsEnabled
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isAudioAlertsEnabled ? (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {isAudioAlertsEnabled ? 'Audio cues enabled' : 'Audio cues disabled'}
            </span>
          </button>

          {/* Accessibility: High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={isHighContrast}
            title="Toggle High Contrast Mode (WCAG 2.2 AAA)"
            className={`p-2 rounded-lg border text-sm font-medium transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Toggle High Contrast</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2" aria-hidden="true" />
            {(['en', 'hi', 'es'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  language === lang
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'ES'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
