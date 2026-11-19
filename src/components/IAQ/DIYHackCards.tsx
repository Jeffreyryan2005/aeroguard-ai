// ============================================================
// src/components/IAQ/DIYHackCards.tsx
// Open-Source DIY Purifier Blueprints & Low-Cost IAQ Hacks
// Corsi-Rosenthal Box, Phytoremediation Plants & Wet-Mop Protocols
// ============================================================

import React from 'react';
import { DIY_PURIFIERS } from '../../lib/constants';
import { Wrench, ShieldCheck, DollarSign, Leaf, Droplets, CheckCircle2 } from 'lucide-react';

export const DIYHackCards: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Purifier Blueprints */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Open-Source Low-Cost Air Purifier Blueprints
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {DIY_PURIFIERS.map((blueprint) => (
            <div
              key={blueprint.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-base">
                    {blueprint.title}
                  </h4>
                  <div className="flex items-center space-x-1 text-emerald-400 font-mono font-bold text-xs bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                    <DollarSign className="w-3.5 h-3.5 -mr-1" aria-hidden="true" />
                    <span>~₹{blueprint.estimatedCostInr}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400 mb-4">
                  <span className="font-semibold text-emerald-300">
                    CADR: {blueprint.cadrspecM3h} m³/h
                  </span>
                  <span>•</span>
                  <span>{blueprint.achRating}</span>
                </div>

                {/* Materials List */}
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5 block">
                    Required Materials:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {blueprint.materials.map((mat, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assembly Steps */}
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5 block">
                    Assembly Instructions:
                  </span>
                  <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                    {blueprint.instructions.map((step, i) => (
                      <li key={i} className="leading-relaxed">
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Safety Footnote */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{blueprint.safetyNotes[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainable Natural Hacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phytoremediation Plant Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Leaf className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                NASA Clean Air Study Phytoremediation Guide
              </h4>
              <p className="text-xs text-slate-400">Indoor botanical VOC and particulate deposition absorbers</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block">Snake Plant (Sansevieria)</strong>
                <span className="text-slate-400 text-[11px]">Crassulacean Acid Metabolism (CAM): releases O₂ at night.</span>
              </div>
              <span className="text-emerald-400 font-mono font-semibold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Benzene / Trichloroethylene
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block">Spider Plant (Chlorophytum)</strong>
                <span className="text-slate-400 text-[11px]">High surface transpiration absorbs formaldehyde &amp; CO.</span>
              </div>
              <span className="text-emerald-400 font-mono font-semibold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Formaldehyde &amp; CO
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block">Peace Lily (Spathiphyllum)</strong>
                <span className="text-slate-400 text-[11px]">Large waxy leaves capture coarse PM10 aerosols.</span>
              </div>
              <span className="text-emerald-400 font-mono font-semibold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Acetone / Airborne Dust
              </span>
            </div>
          </div>
        </div>

        {/* Wet-Mop Protocol vs Dry Sweeping */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Droplets className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  Mechanical Resuspension Prevention Protocol
                </h4>
                <p className="text-xs text-slate-400">Why traditional dry sweeping spikes indoor PM2.5 by 300%</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong>Scientific Finding:</strong> Broom sweeping does not remove fine particulate matter; it mechanically shears settled soot into micro-droplets that stay suspended in indoor air for 4 to 8 hours.
              </p>
              <ul className="space-y-1.5 mt-2">
                <li className="flex items-start space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Always use damp microfiber wet mopping to chemically bind particulate mass.</span>
                </li>
                <li className="flex items-start space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Damp towel rolled at the base of doors blocks ground-level nocturnal draft infiltration.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Standard: ASHRAE 62.2 / WHO Indoor Particulate Remediation
          </div>
        </div>
      </div>
    </div>
  );
};
