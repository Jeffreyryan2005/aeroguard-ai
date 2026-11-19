// ============================================================
// src/components/shared/AlertBanner.tsx
// Screen Reader Assertive Live Alert Banner (role="alert")
// Informs users of atmospheric temperature inversion trapping
// ============================================================

import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Clock, Thermometer } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { selectedZone, isAudioAlertsEnabled, isHighContrast, t } = useApp();
  const isSevere = selectedZone.aqi >= 300;
  const isInverted = selectedZone.inversion.isInversionActive;

  useEffect(() => {
    if (isAudioAlertsEnabled && (isSevere || isInverted)) {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch {
        // AudioContext disabled or blocked by browser policy
      }
    }
  }, [selectedZone.aqi, isInverted, isAudioAlertsEnabled, isSevere]);

  if (!isSevere && !isInverted) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`border-b transition-colors px-4 py-3 sm:px-6 lg:px-8 ${
        isHighContrast
          ? 'bg-yellow-400 text-black border-black font-bold'
          : 'bg-rose-950/80 border-rose-800/80 text-rose-100 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle className="w-5 h-5 text-rose-400" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wide uppercase">
                {t.emergencyBanner}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 border border-rose-700">
                AQI {selectedZone.aqi} • {selectedZone.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-0.5">
              {isInverted
                ? `${t.inversionDetected} (+${selectedZone.inversion.lapseRate}°C/100m lapse rate). Particulates trapped in breathing zone.`
                : 'Hazardous ambient particulate concentrations. Minimize outdoor time.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium">
          {isInverted && (
            <div className="flex items-center space-x-1.5 bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-700/60">
              <Clock className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>
                {t.breakupExpected}{' '}
                <strong className="text-white font-semibold">
                  {selectedZone.inversion.breakupWindowEst}
                </strong>
              </span>
            </div>
          )}
          <div className="hidden sm:flex items-center space-x-1 text-rose-300">
            <Thermometer className="w-4 h-4" aria-hidden="true" />
            <span>Surface: {selectedZone.inversion.surfaceTemp}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};
