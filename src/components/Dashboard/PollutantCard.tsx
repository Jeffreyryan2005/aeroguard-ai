// ============================================================
// src/components/Dashboard/PollutantCard.tsx
// Presentation Card for Atmospheric Pollutants (PM2.5, PM10, NO2, CO, O3)
// Visual badges, WHO guideline benchmark & physiological risk indicators
// ============================================================

import React from 'react';

interface PollutantCardProps {
  name: string;
  chemicalFormula: string;
  value: number;
  unit: string;
  whoLimit: number;
  category: 'safe' | 'moderate' | 'elevated' | 'hazardous';
  healthDescription: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  name,
  chemicalFormula,
  value,
  unit,
  whoLimit,
  category,
  healthDescription,
}) => {
  const getBadgeClass = () => {
    switch (category) {
      case 'safe':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'moderate':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'elevated':
        return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'hazardous':
        return 'bg-rose-950 text-rose-400 border-rose-800';
    }
  };

  const ratio = (value / whoLimit).toFixed(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-100 text-sm">{name}</span>
            <span className="text-xs font-mono text-slate-400">({chemicalFormula})</span>
          </div>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getBadgeClass()}`}>
            {category}
          </span>
        </div>

        <div className="flex items-baseline space-x-1 my-1">
          <span className="text-2xl font-extrabold tracking-tight text-white">{value}</span>
          <span className="text-xs text-slate-400 font-medium">{unit}</span>
        </div>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2" title={healthDescription}>
          {healthDescription}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>WHO Cap: {whoLimit} {unit}</span>
        <span className={Number(ratio) > 1 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
          {Number(ratio) > 1 ? `${ratio}x Safe Limit` : 'Within Cap'}
        </span>
      </div>
    </div>
  );
};
