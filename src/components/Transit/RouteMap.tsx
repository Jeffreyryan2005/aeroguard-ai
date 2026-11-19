// ============================================================
// src/components/Transit/RouteMap.tsx
// Native SVG Clean Corridor & Transit Path Visualization
// With WCAG 2.2 AA compliant screen reader textual twins
// ============================================================

import React from 'react';

interface RouteMapProps {
  selectedPath: string[];
}

export const RouteMap: React.FC<RouteMapProps> = ({ selectedPath }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden relative shadow-inner">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-semibold text-slate-200">Urban Transit Exposure Topology</span>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Clean Metro</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Diesel Hotspot</span>
          </span>
        </div>
      </div>

      <svg
        role="img"
        aria-label="Urban transit graph map displaying clean metro subterranean corridor versus high-smog arterial ring road."
        viewBox="0 0 500 240"
        className="w-full h-48 sm:h-56"
      >
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="500" height="240" fill="url(#grid)" />

        {/* High Exposure Arterial Ring Road (Curved red stroke) */}
        <path
          d="M 50 180 Q 250 220 450 180"
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          strokeDasharray="6,4"
          opacity="0.85"
        />

        {/* Clean Metro Corridor (Green solid stroke) */}
        <path
          d="M 50 180 Q 250 60 450 180"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Inter-connector lines */}
        <line x1="250" y1="105" x2="250" y2="200" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* Nodes */}
        {/* Start: Residential Hub */}
        <circle cx="50" cy="180" r="8" className="fill-emerald-500 stroke-slate-900 stroke-2" />
        <text x="50" y="210" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
          Residential Hub
        </text>

        {/* Metro Clean Node */}
        <circle cx="250" cy="105" r="9" className="fill-emerald-400 stroke-slate-900 stroke-2" />
        <text x="250" y="85" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
          Central Metro Interchange (HEPA 92%)
        </text>

        {/* Traffic Choke Node */}
        <circle cx="250" cy="200" r="9" className="fill-rose-500 stroke-slate-900 stroke-2" />
        <text x="250" y="225" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">
          Diesel Traffic Ring Road (420 AQI)
        </text>

        {/* End: Commercial Hub */}
        <circle cx="450" cy="180" r="8" className="fill-emerald-500 stroke-slate-900 stroke-2" />
        <text x="450" y="210" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
          Commercial District
        </text>
      </svg>

      {/* Screen Reader Twin */}
      <div className="sr-only">
        <h4>Transit Graph Route Sequence:</h4>
        <p>Active route traversal: {selectedPath.join(' → ')}.</p>
        <p>Clean Metro Corridor bypasses surface traffic choke-points, reducing particulate inhalation by 82%.</p>
      </div>
    </div>
  );
};
