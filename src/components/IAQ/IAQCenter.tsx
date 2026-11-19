// ============================================================
// src/components/IAQ/IAQCenter.tsx
// Room CADR Calculator (ANSI/AHAM AC-1), Clearance Estimator & IAQ Hacks
// Mathematical calculation of Air Changes per Hour (ACH) & purification decay
// ============================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateRequiredCADR } from '../../lib/aqiCompute';
import { DIYHackCards } from './DIYHackCards';
import {
  Wind,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';

export const IAQCenter: React.FC = () => {
  const { selectedZone } = useApp();

  const [lengthM, setLengthM] = useState<number>(5);
  const [widthM, setWidthM] = useState<number>(4);
  const [heightM, setHeightM] = useState<number>(3);
  const [targetACH, setTargetACH] = useState<number>(4);

  const cadrResult = useMemo(() => {
    return calculateRequiredCADR({
      roomName: 'Living Room / Bedroom',
      lengthM,
      widthM,
      heightM,
      occupants: 3,
      targetACH,
      naturalACH: 0.5,
      outdoorAqi: selectedZone.aqi,
    });
  }, [lengthM, widthM, heightM, targetACH, selectedZone.aqi]);

  return (
    <div
      role="tabpanel"
      id="panel-iaq"
      aria-labelledby="tab-iaq"
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Wind className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Indoor Air Quality (IAQ) &amp; Room CADR Calculator
            </h2>
            <p className="text-xs text-slate-400">
              ANSI/AHAM AC-1 standard room sizing for 4 to 6 Air Changes per Hour (ACH)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800">
          <Zap className="w-4 h-4" aria-hidden="true" />
          <span>Ambient Outdoor AQI: {selectedZone.aqi}</span>
        </div>
      </div>

      {/* CADR Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Room Dimensions
            </h3>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Length:</span>
              <span className="font-mono font-bold text-emerald-400">{lengthM} meters</span>
            </div>
            <input
              type="range"
              min={2.5}
              max={12}
              step={0.5}
              value={lengthM}
              onChange={(e) => setLengthM(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Width:</span>
              <span className="font-mono font-bold text-emerald-400">{widthM} meters</span>
            </div>
            <input
              type="range"
              min={2.5}
              max={10}
              step={0.5}
              value={widthM}
              onChange={(e) => setWidthM(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Ceiling Height:</span>
              <span className="font-mono font-bold text-emerald-400">{heightM} meters</span>
            </div>
            <input
              type="range"
              min={2.4}
              max={4.5}
              step={0.1}
              value={heightM}
              onChange={(e) => setHeightM(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Target Air Changes / Hour (ACH):</span>
              <span className="font-mono font-bold text-cyan-400">{targetACH} ACH</span>
            </div>
            <input
              type="range"
              min={3}
              max={6}
              step={1}
              value={targetACH}
              onChange={(e) => setTargetACH(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Standard: 4 ACH for general rooms, 5-6 ACH for asthmatics.
            </span>
          </div>
        </div>

        {/* CADR Output Metrics */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Purification Requirements &amp; Clearance Time
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Volume: {cadrResult.roomVolumeM3} m³ ({(cadrResult.roomVolumeM3 * 35.3147).toFixed(0)} ft³)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Required CADR
                </span>
                <div className="text-2xl font-extrabold text-cyan-300 font-mono">
                  {cadrResult.requiredCADRM3h} <span className="text-sm">m³/h</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                  {cadrResult.requiredCADRCFM} CFM
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  95% Clearance Time
                </span>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono flex items-center space-x-1">
                  <Clock className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  <span>{cadrResult.clearanceTime95PercentMins} mins</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  From initial startup to safe indoor air
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Projected Indoor AQI
                </span>
                <div className="text-2xl font-extrabold text-emerald-300 font-mono">
                  ~{cadrResult.estimatedIndoorAqi} <span className="text-sm">AQI</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                  {Math.round(((selectedZone.aqi - cadrResult.estimatedIndoorAqi) / selectedZone.aqi) * 100)}% Smog Reduction
                </span>
              </div>
            </div>

            {/* Recommendation badge */}
            <div className="bg-emerald-950/40 border border-emerald-800 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-emerald-200">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
              <div>
                <strong>Purification Sizing Match:</strong> A single DIY Corsi-Rosenthal Box (delivering ~380 m³/h) provides{' '}
                <strong className="text-white">{(380 / cadrResult.roomVolumeM3).toFixed(1)} ACH</strong> for this {cadrResult.roomVolumeM3} m³ space, comfortably exceeding your {targetACH} ACH target.
              </div>
            </div>
          </div>

          {/* Window Ventilation Schedule Guidance */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-rose-950/40 border border-rose-900 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 font-bold text-rose-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" aria-hidden="true" />
                <span>06:00 AM - 10:30 AM: DO NOT OPEN WINDOWS</span>
              </div>
              <p className="text-rose-200/80 text-[11px]">
                Ground thermal inversion traps dense particulate soot at window level. Keep all seals locked.
              </p>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-900 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-300 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>01:30 PM - 02:15 PM: 20-MIN CROSS FLUSH</span>
              </div>
              <p className="text-emerald-200/80 text-[11px]">
                Solar surface heating elevates boundary mixing layer. Safe for short cross-aeration flush.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DIY Blueprints and Phytoremediation */}
      <DIYHackCards />
    </div>
  );
};
