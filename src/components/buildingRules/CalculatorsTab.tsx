import React, { useState } from "react";
import { UnifiedBuildingRulesCalculator } from "./UnifiedBuildingRulesCalculator";
import { PermitFeeCalculator } from "./calculators/PermitFeeCalculator";
import { ParkingCalculator } from "./calculators/ParkingCalculator";
import { FsiCoverageCalculator } from "./calculators/FsiCoverageCalculator";
import { RainwaterCalculator } from "./calculators/RainwaterCalculator";
import { SanitaryCalculator } from "./calculators/SanitaryCalculator";

import { Calculator, Car, Layers, Droplets, Bath, Cpu, Sparkles, FileText } from "lucide-react";

type ActiveCalculatorType = "unified" | "permit_fee" | "parking" | "fsi_coverage" | "rainwater" | "sanitary";

export const CalculatorsTab: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<ActiveCalculatorType>("unified");

  return (
    <div className="space-y-6">
      {/* Top Banner and Calculator Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl bg-blueprint-grid relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-300/40 shrink-0">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 uppercase">
                  KPBR 2019 / 2026 GAZETTE SUITE
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  UNIFIED MASTER CALCULATOR + A4 REPORT
                </span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-sans">
                കെട്ടിട നിർമ്മാണ ചട്ട കാൽക്കുലേറ്ററുകൾ (BUILDING RULES CALCULATORS)
              </h2>
            </div>
          </div>
        </div>

        {/* Calculator Tab Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 pt-2 border-t border-slate-800 relative z-10">
          {/* 0. UNIFIED MASTER CALCULATOR (ALL-IN-ONE + A4 PDF) */}
          <button
            onClick={() => setActiveCalc("unified")}
            className={`flex items-center gap-2.5 p-3 rounded-xl border font-mono text-xs font-bold text-left transition cursor-pointer md:col-span-2 ${
              activeCalc === "unified"
                ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 text-slate-300 border-emerald-900/60 hover:border-emerald-700 hover:text-white"
            }`}
          >
            <Sparkles className="w-5 h-5 shrink-0 text-amber-900" />
            <div className="truncate">
              <span className="block text-[10px] opacity-90 uppercase text-slate-950 font-black">
                ★ ALL-IN-ONE REPORT
              </span>
              <span className="truncate block font-sans font-black text-xs text-slate-950">
                ഏകീകൃത കാൽക്കുലേറ്റർ & A4 PDF
              </span>
            </div>
          </button>

          {/* 1. Permit Fee Calculator */}
          <button
            onClick={() => setActiveCalc("permit_fee")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border font-mono text-xs font-bold text-left transition cursor-pointer ${
              activeCalc === "permit_fee"
                ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="block text-[9px] opacity-80 uppercase">Fee</span>
              <span className="truncate block font-sans text-xs">Permit Fee</span>
            </div>
          </button>

          {/* 2. Parking Calculator */}
          <button
            onClick={() => setActiveCalc("parking")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border font-mono text-xs font-bold text-left transition cursor-pointer ${
              activeCalc === "parking"
                ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="block text-[9px] opacity-80 uppercase">Parking</span>
              <span className="truncate block font-sans text-xs">Parking Norms</span>
            </div>
          </button>

          {/* 3. FSI & Coverage Calculator */}
          <button
            onClick={() => setActiveCalc("fsi_coverage")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border font-mono text-xs font-bold text-left transition cursor-pointer ${
              activeCalc === "fsi_coverage"
                ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="block text-[9px] opacity-80 uppercase">FSI</span>
              <span className="truncate block font-sans text-xs">FSI & Coverage</span>
            </div>
          </button>

          {/* 4. Rainwater Storage Calculator */}
          <button
            onClick={() => setActiveCalc("rainwater")}
            className={`flex items-center gap-2 p-2.5 rounded-xl border font-mono text-xs font-bold text-left transition cursor-pointer ${
              activeCalc === "rainwater"
                ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            <Droplets className="w-4 h-4 shrink-0" />
            <div className="truncate">
              <span className="block text-[9px] opacity-80 uppercase">Rainwater</span>
              <span className="truncate block font-sans text-xs">RWH Tank</span>
            </div>
          </button>
        </div>
      </div>

      {/* Render Active Calculator */}
      <div>
        {activeCalc === "unified" && <UnifiedBuildingRulesCalculator />}
        {activeCalc === "permit_fee" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl bg-blueprint-grid">
            <PermitFeeCalculator />
          </div>
        )}
        {activeCalc === "parking" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl bg-blueprint-grid">
            <ParkingCalculator />
          </div>
        )}
        {activeCalc === "fsi_coverage" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl bg-blueprint-grid">
            <FsiCoverageCalculator />
          </div>
        )}
        {activeCalc === "rainwater" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl bg-blueprint-grid">
            <RainwaterCalculator />
          </div>
        )}
        {activeCalc === "sanitary" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl bg-blueprint-grid">
            <SanitaryCalculator />
          </div>
        )}
      </div>
    </div>
  );
};
