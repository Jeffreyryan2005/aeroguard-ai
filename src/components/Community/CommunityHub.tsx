// ============================================================
// src/components/Community/CommunityHub.tsx
// Collective Neighborhood Action, Emission Mitigation & Emergency Advisories
// Demonstrates quantifiable impact of community pledges
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ImpactCounter } from './ImpactCounter';
import { calculateCommunityOffset } from '../../lib/aqiCompute';
import { fetchEmergencyAdvisory } from '../../lib/api';
import {
  Users,
  ShieldCheck,
  Megaphone,
  CheckCircle,
  Radio,
  FileCheck,
} from 'lucide-react';

export const CommunityHub: React.FC = () => {
  const { pledges, togglePledge, selectedZone, language } = useApp();
  const [advisoryText, setAdvisoryText] = useState<string>('');
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadAdvisory = async () => {
      setIsLoadingAdvisory(true);
      try {
        const text = await fetchEmergencyAdvisory(selectedZone, language);
        if (isMounted) setAdvisoryText(text);
      } finally {
        if (isMounted) setIsLoadingAdvisory(false);
      }
    };

    loadAdvisory();
    return () => {
      isMounted = false;
    };
  }, [selectedZone, language]);

  const offsetMetrics = useMemo(() => {
    return calculateCommunityOffset(pledges);
  }, [pledges]);

  const totalCitizens = useMemo(() => {
    return pledges.reduce(
      (sum, p) => sum + p.participantsCount + (p.isPledged ? 1 : 0),
      0
    );
  }, [pledges]);

  return (
    <div
      role="tabpanel"
      id="panel-community"
      aria-labelledby="tab-community"
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Neighborhood Action Hub &amp; Collective Emission Offsets
            </h2>
            <p className="text-xs text-slate-400">
              Community pledges collectively curb localized particulate emissions during smog inversions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>Active Neighborhood Network</span>
        </div>
      </div>

      {/* Impact Counters Ticker */}
      <ImpactCounter
        totalCo2Kg={offsetMetrics.totalCo2AvoidedKg}
        totalPm25G={offsetMetrics.totalPm25AvoidedG}
        shieldScore={offsetMetrics.communityShieldScore}
        totalPledgesCount={totalCitizens}
      />

      {/* Emergency Advisory Broadcast Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" aria-hidden="true" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Emergency Public Health Broadcast ({selectedZone.city})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Live GenAI Public Advisory
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
          {isLoadingAdvisory ? (
            <span className="text-slate-400 italic">Synthesizing authoritative advisory...</span>
          ) : (
            advisoryText
          )}
        </div>
      </div>

      {/* Community Pledges Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-purple-400" aria-hidden="true" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Collective Action Pledges
            </h3>
          </div>
          <span className="text-xs text-slate-400">Join to increase community shield score</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pledges.map((pledge) => (
            <div
              key={pledge.id}
              className={`border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                pledge.isPledged
                  ? 'bg-purple-950/30 border-purple-600/80 shadow-md ring-1 ring-purple-600/40'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">
                    {pledge.title}
                  </h4>
                  <span className="text-xs font-mono text-purple-300 font-bold bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    {pledge.participantsCount + (pledge.isPledged ? 1 : 0)} Citizens
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {pledge.description}
                </p>

                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 mb-4">
                  <span className="text-emerald-400 font-semibold">
                    -{pledge.co2AvoidedKgPerDay} kg CO₂/day
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">
                    -{pledge.pm25AvoidedGramsPerDay} g PM2.5/day
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Civic Impact Verified</span>
                </span>

                <button
                  type="button"
                  onClick={() => togglePledge(pledge.id)}
                  aria-pressed={pledge.isPledged}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all focus:ring-2 focus:ring-purple-500 focus:outline-none flex items-center space-x-1.5 ${
                    pledge.isPledged
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{pledge.isPledged ? 'Pledged (Active)' : 'Join Community Pledge'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
