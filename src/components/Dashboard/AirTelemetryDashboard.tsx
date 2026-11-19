// ============================================================
// src/components/Dashboard/AirTelemetryDashboard.tsx
// Hyperlocal Multi-Pollutant Telemetry, Inversion Thermodynamics
// & Atmospheric Physics Simulation Suite
// ============================================================

import React from 'react';
import { useApp } from '../../context/AppContext';
import { PollutantCard } from './PollutantCard';
import { Sparkline } from './Sparkline';
import {
  Thermometer,
  Layers,
  Clock,
  Sparkles,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

export const AirTelemetryDashboard: React.FC = () => {
  const {
    selectedZone,
    selectedPersona,
    setActiveTab,
    simulateSpike,
    simulateCleansing,
    resetSimulation,
    isSimulationActive,
    t,
  } = useApp();

  const { pollutants, inversion, historicalSparkline } = selectedZone;

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
    if (aqi <= 100) return 'text-emerald-300 border-emerald-600 bg-emerald-950/30';
    if (aqi <= 150) return 'text-amber-400 border-amber-500 bg-amber-950/40';
    if (aqi <= 200) return 'text-orange-400 border-orange-500 bg-orange-950/40';
    if (aqi <= 300) return 'text-rose-400 border-rose-500 bg-rose-950/40';
    return 'text-purple-400 border-purple-500 bg-purple-950/40';
  };

  return (
    <div
      role="tabpanel"
      id="panel-telemetry"
      aria-labelledby="tab-telemetry"
      className="space-y-6"
    >
      {/* Simulation Banner if active */}
      {isSimulationActive && (
        <div className="bg-amber-950/80 border border-amber-700/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>
              <strong>Simulation Mode Active:</strong> Atmospheric telemetry is currently overridden for scenario stress testing.
            </span>
          </div>
          <button
            type="button"
            onClick={resetSimulation}
            className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded font-medium transition-colors"
          >
            {t.resetSimulation}
          </button>
        </div>
      )}

      {/* Hero Zone Telemetry + Inversion Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AQI Gauge Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{selectedZone.city} Sector</span>
              <span>Updated: {selectedZone.lastUpdated}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {selectedZone.name}
            </h2>

            {/* Big AQI Pill */}
            <div className="my-5 flex items-center space-x-4">
              <div
                className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold ${getAqiColor(
                  selectedZone.aqi
                )}`}
              >
                <span className="text-3xl leading-none">{selectedZone.aqi}</span>
                <span className="text-[10px] tracking-wider uppercase font-semibold mt-1">
                  US AQI
                </span>
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  {selectedZone.severity.replace('-', ' ')}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Primary Hazard: <strong className="text-slate-200 uppercase">{selectedZone.primaryPollutant}</strong>
                </p>
                <p className="text-xs text-slate-400">
                  Target Persona:{' '}
                  <span className="text-emerald-400 font-semibold">{selectedPersona.label}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Historical Trend Sparkline */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>12-Hour Smog Trend</span>
              <span className="font-mono">{historicalSparkline[historicalSparkline.length - 1]} AQI</span>
            </div>
            <Sparkline data={historicalSparkline} />
          </div>
        </div>

        {/* Boundary Layer Inversion Thermodynamics Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                  <Layers className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Atmospheric Boundary Layer & Inversion Thermodynamics
                  </h3>
                  <p className="text-xs text-slate-400">
                    Physical modeling of vertical air column lapse rates and particulate stagnation
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  inversion.isInversionActive
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                Inversion: {inversion.inversionStrength.toUpperCase()}
              </span>
            </div>

            {/* Inversion Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Vertical Lapse Rate (Γ)</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {inversion.lapseRate > 0 ? `+${inversion.lapseRate}` : inversion.lapseRate} °C/100m
                </div>
                <span className="text-[11px] text-slate-400">
                  {inversion.lapseRate > 0 ? 'Trapping soot at surface' : 'Normal adiabatic lapse'}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                  <span>Boundary Mixing Height (zᵢ)</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {inversion.boundaryLayerHeight} m
                </div>
                <span className="text-[11px] text-slate-400">
                  {inversion.boundaryLayerHeight < 150 ? 'Severe shallow trapping cap' : 'Sufficient vertical volume'}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Solar Convection Breakup</span>
                </div>
                <div className="text-sm font-bold text-emerald-300 line-clamp-1">
                  {inversion.breakupWindowEst.split('(')[0]}
                </div>
                <span className="text-[11px] text-slate-400">
                  Optimal ventilation window
                </span>
              </div>
            </div>

            {/* Scientific Explanation Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex items-start space-x-3">
              <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <strong className="text-white">Why Inversions Create Extreme Smog:</strong> Nocturnal radiative cooling chills the ground surface faster than the air above it, reversing the natural temperature profile. Dense cold air traps vehicle exhaust and biomass smoke within human breathing altitude. Pollutants cannot disperse until solar thermal convection warms the ground midday.
              </div>
            </div>
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold mr-1">Simulate Physics:</span>
              <button
                type="button"
                onClick={simulateSpike}
                className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-semibold hover:bg-rose-900 transition-colors flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.simulateSpike}</span>
              </button>
              <button
                type="button"
                onClick={simulateCleansing}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.simulateCleansing}</span>
              </button>
              {isSimulationActive && (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs hover:bg-slate-700 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('routine')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold tracking-wide transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <span>Build Routine for {selectedPersona.label.split('(')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Pollutants Telemetry Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Multi-Pollutant Chemical Telemetry
            </h3>
          </div>
          <span className="text-xs text-slate-400">Micrograms / Cubic Meter (µg/m³)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PollutantCard
            name="Fine Particulate Matter"
            chemicalFormula="PM2.5"
            value={pollutants.pm25}
            unit="µg/m³"
            whoLimit={15}
            category={pollutants.pm25 > 250 ? 'hazardous' : pollutants.pm25 > 100 ? 'elevated' : 'moderate'}
            healthDescription="Penetrates deep into pulmonary alveoli and enters bloodstream, triggering systemic vascular inflammation."
          />
          <PollutantCard
            name="Coarse Particulate Matter"
            chemicalFormula="PM10"
            value={pollutants.pm10}
            unit="µg/m³"
            whoLimit={45}
            category={pollutants.pm10 > 350 ? 'hazardous' : pollutants.pm10 > 150 ? 'elevated' : 'moderate'}
            healthDescription="Inhalable road dust, brake dust, and combustion soot; irritates eyes, nose, and upper bronchial passages."
          />
          <PollutantCard
            name="Nitrogen Dioxide"
            chemicalFormula="NO2"
            value={pollutants.no2}
            unit="µg/m³"
            whoLimit={25}
            category={pollutants.no2 > 80 ? 'hazardous' : pollutants.no2 > 40 ? 'elevated' : 'moderate'}
            healthDescription="Combustion gas from vehicular traffic; causes bronchial constriction and exacerbates childhood asthma."
          />
          <PollutantCard
            name="Carbon Monoxide"
            chemicalFormula="CO"
            value={pollutants.co}
            unit="mg/m³"
            whoLimit={4.0}
            category={pollutants.co > 4 ? 'hazardous' : pollutants.co > 2 ? 'elevated' : 'safe'}
            healthDescription="Binds hemoglobin with 200x affinity of oxygen, reducing cellular oxygenation and causing fatigue."
          />
          <PollutantCard
            name="Ground-Level Ozone"
            chemicalFormula="O3"
            value={pollutants.o3}
            unit="µg/m³"
            whoLimit={100}
            category={pollutants.o3 > 120 ? 'elevated' : 'safe'}
            healthDescription="Secondary photochemical oxidant; inflames pulmonary tissues and diminishes lung vital capacity."
          />
          <PollutantCard
            name="Sulfur Dioxide"
            chemicalFormula="SO2"
            value={pollutants.so2}
            unit="µg/m³"
            whoLimit={40}
            category={pollutants.so2 > 50 ? 'elevated' : 'safe'}
            healthDescription="Industrial and diesel emissions; triggers acute bronchospasm and contributes to secondary aerosol formation."
          />
        </div>
      </div>
    </div>
  );
};
