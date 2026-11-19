// ============================================================
// src/components/Dashboard/Sparkline.tsx
// Native SVG Sparkline Renderer with WCAG Screen Reader Twin
// Per WCAG 2.2 AA (provides accessible textual list of all data points)
// ============================================================

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 240,
  height = 50,
  label = '12-Hour AQI Historical Trend',
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="relative">
      <svg
        role="img"
        aria-label={`${label}. Minimum value ${min}, Maximum value ${max}, Latest value ${data[data.length - 1]}.`}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-12 overflow-visible"
      >
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#sparkGradient)" />
        <polyline
          fill="none"
          stroke="#f87171"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Latest point circle */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * (height - 10) - 5}
            r="3.5"
            className="fill-rose-500 stroke-white stroke-2"
          />
        )}
      </svg>

      {/* Screen Reader Twin Table (hidden visually, read by assistive tech) */}
      <div className="sr-only">
        <h4>{label} Detailed Readings (Past 12 Hours)</h4>
        <ol>
          {data.map((val, idx) => (
            <li key={idx}>
              Hour {idx + 1}: AQI {val}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
