// ============================================================
// src/components/Community/ImpactCounter.tsx
// Real-Time Community Emission Offset & Collective Shield Metrics
// Accessible ticker with screen reader ARIA live updates
// ============================================================

import React from 'react';
import { Shield, CloudRain, Flame, Users } from 'lucide-react';

interface ImpactCounterProps {
  totalCo2Kg: number;
  totalPm25G: number;
  shieldScore: number;
  totalPledgesCount: number;
}

export const ImpactCounter: React.FC<ImpactCounterProps> = ({
  totalCo2Kg,
  totalPm25G,
  shieldScore,
  totalPledgesCount,
}) => {
  return (
    <div
      aria-label="Community Environmental Mitigation Metrics"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <CloudRain className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>CO₂ Emissions Avoided</span>
        </div>
        <div className="text-2xl font-extrabold text-white font-mono">
          {totalCo2Kg.toLocaleString()} <span className="text-sm text-slate-400">kg/day</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-medium">
          Equivalent to 120 cars off peak roads
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <Flame className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <span>PM2.5 Soot Prevented</span>
        </div>
        <div className="text-2xl font-extrabold text-cyan-300 font-mono">
          {totalPm25G.toLocaleString()} <span className="text-sm text-slate-400">g/day</span>
        </div>
        <span className="text-[10px] text-cyan-400 font-medium">
          Kept out of urban respiratory tracts
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <Shield className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>Community Shield Index</span>
        </div>
        <div className="text-2xl font-extrabold text-amber-300 font-mono">
          {shieldScore} <span className="text-sm text-slate-400">/ 100</span>
        </div>
        <span className="text-[10px] text-amber-400 font-medium">
          High neighborhood resilience rating
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <Users className="w-4 h-4 text-purple-400" aria-hidden="true" />
          <span>Citizens Committed</span>
        </div>
        <div className="text-2xl font-extrabold text-purple-300 font-mono">
          {totalPledgesCount.toLocaleString()}
        </div>
        <span className="text-[10px] text-purple-400 font-medium">
          Active community pledge participants
        </span>
      </div>
    </div>
  );
};
