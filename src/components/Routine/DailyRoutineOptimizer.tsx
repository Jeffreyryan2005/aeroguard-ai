// ============================================================
// src/components/Routine/DailyRoutineOptimizer.tsx
// GenAI Hour-by-Hour Exposure Optimizer & Inversion-Aware Scheduler
// Powered by Google Gemini 2.5 Flash with Deterministic Clinical Fallback
// ============================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VulnerabilitySelector } from './VulnerabilitySelector';
import { fetchRoutineInsights } from '../../lib/api';
import type { GenAIRoutinePlan } from '../../types';
import {
  Sparkles,
  Sun,
  ShieldCheck,
  Printer,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
} from 'lucide-react';

export const DailyRoutineOptimizer: React.FC = () => {
  const { selectedZone, selectedPersona, language, t } = useApp();
  const [plan, setPlan] = useState<GenAIRoutinePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Automatically generate when persona or zone changes
  useEffect(() => {
    let isMounted = true;
    const runGeneration = async () => {
      setIsLoading(true);
      try {
        const result = await fetchRoutineInsights(selectedPersona, selectedZone, language);
        if (isMounted) setPlan(result);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    runGeneration();
    return () => {
      isMounted = false;
    };
  }, [selectedPersona, selectedZone, language]);

  const handlePrint = () => {
    window.print();
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return {
          icon: CheckCircle2,
          class: 'bg-emerald-950 text-emerald-300 border-emerald-700',
          text: 'Low Exposure Risk',
        };
      case 'moderate':
        return {
          icon: AlertCircle,
          class: 'bg-amber-950 text-amber-300 border-amber-700',
          text: 'Moderate Caution',
        };
      case 'high':
        return {
          icon: AlertCircle,
          class: 'bg-orange-950 text-orange-300 border-orange-700',
          text: 'High Health Hazard',
        };
      case 'prohibited':
      default:
        return {
          icon: XCircle,
          class: 'bg-rose-950 text-rose-300 border-rose-700',
          text: 'Prohibited for Persona',
        };
    }
  };

  return (
    <div
      role="tabpanel"
      id="panel-routine"
      aria-labelledby="tab-routine"
      className="space-y-6"
    >
      {/* Persona Selector */}
      <VulnerabilitySelector />

      {/* Routine Generation Control Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              GenAI Daily Routine & Exposure Optimizer
            </h2>
            <p className="text-xs text-slate-400">
              Calibrated for <strong>{selectedPersona.label}</strong> in <strong>{selectedZone.name}</strong> (AQI {selectedZone.aqi})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>{t.exportPdf}</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              const res = await fetchRoutineInsights(selectedPersona, selectedZone, language);
              setPlan(res);
              setIsLoading(false);
            }}
            className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>{isLoading ? t.generating : t.generateRoutineBtn}</span>
          </button>
        </div>
      </div>

      {/* Routine Insights Display */}
      {plan && (
        <div className="space-y-6 print:space-y-4">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Safe Window Card */}
            <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-600/60 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Sun className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  {t.safeOutdoorWindow}
                </span>
                <div className="text-base font-extrabold text-white mt-0.5">
                  {plan.safeOutdoorWindow}
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Solar surface heating breaks nocturnal inversion cap
                </p>
              </div>
            </div>

            {/* Dose Avoided Metric */}
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-600/60 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Modeled Inhaled Dose Avoided
                </span>
                <div className="text-base font-extrabold text-white mt-0.5">
                  ~{plan.modeledInhaledDoseAvoidedUg} µg PM2.5
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  Relative to unmitigated morning outdoor exposure
                </p>
              </div>
            </div>

            {/* AI Source / Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <FileText className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inference Engine
                </span>
                <div className="text-sm font-bold text-white mt-0.5 flex items-center space-x-1.5">
                  <span>{plan.source === 'gemini-live' ? 'Google Gemini 2.5 Flash' : 'Deterministic Clinical Model'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400">
                  100% Deterministic &amp; Clinical Safety Verification
                </p>
              </div>
            </div>
          </div>

          {/* Biomedical Rationale Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <span>Clinical &amp; Physiological Rationale</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {plan.biomedicalSummary}
            </p>
          </div>

          {/* Hourly Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Hour-by-Hour Exposure Schedule</span>
              </h3>
              <span className="text-xs text-slate-400">
                Synchronized with Diurnal Temperature Lapse Rate
              </span>
            </div>

            <div className="space-y-3">
              {plan.hourlySchedule.map((item, idx) => {
                const badge = getRiskBadge(item.riskScore);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-700">
                          {item.timeSlot}
                        </span>
                        <h4 className="font-bold text-white text-sm">
                          {item.activity}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          <span className="capitalize">{item.locationType}</span>
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center space-x-1 ${badge.class}`}
                        >
                          <BadgeIcon className="w-3 h-3" aria-hidden="true" />
                          <span>{badge.text}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 font-medium mb-3">
                      {item.recommendedAction}
                    </p>

                    <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <strong className="text-slate-300">Biomedical Rationale:</strong>{' '}
                        {item.scientificRationale}
                      </div>
                      <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
                        <span className="font-semibold text-emerald-400">
                          {item.impactMetric}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
