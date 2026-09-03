import React, { useState } from "react";
import { Droplets, HelpCircle, CheckCircle2, Bookmark, FileText, Check } from "lucide-react";

export const RainwaterCalculator: React.FC = () => {
  const [coveredArea, setCoveredArea] = useState<number>(150);
  const [occupancyGroup, setOccupancyGroup] = useState<"group1" | "group2">("group2");
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Rates: group1 = 25 L/m², group2 = 50 L/m²
  const rate = occupancyGroup === "group1" ? 25 : 50;
  const minCapacity = (coveredArea || 0) * rate;

  // Suggested Dimensions for underground RCC tank (Depth ~1.5m)
  // Capacity in m³ = Litres / 1000
  const capacityM3 = minCapacity / 1000;
  const approxLength = Math.sqrt(capacityM3 / 1.5).toFixed(2);
  const approxWidth = Math.sqrt(capacityM3 / 1.5).toFixed(2);

  const handleSaveCapacity = () => {
    setSavedNotification("Rainwater harvesting tank capacity assessment saved!");
    setTimeout(() => setSavedNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              KPBR Rule 3(iv)
            </span>
            <span className="text-xs text-slate-400">Panchayat & Municipal Building Rules</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Droplets className="w-6 h-6 text-cyan-400" />
            <span>Rainwater Storage Calculator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Compute mandated minimum rainwater harvesting tank capacity based on footprint area and occupancy
          </p>
        </div>

        <button
          onClick={() => alert("KPBR Rainwater Harvesting Tank Norms:\n- Group A1, A2, F, J: 25 Litres per sq.m of covered area\n- Group B, C, D, E, G1, G2, H, I: 50 Litres per sq.m of covered area\n- Tank capacity must be provided in every building above 100 sq.m area")}
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 hover:border-cyan-500 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Guide</span>
        </button>
      </div>

      {savedNotification && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Parameters & Code Extract */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Project Parameters */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 relative bg-blueprint-grid">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">Project Parameters</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                § Rule 3(iv)
              </span>
            </div>

            <div className="space-y-4">
              {/* Footprint Area */}
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5 uppercase">
                  Covered Area (Footprint)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={coveredArea || ""}
                    onChange={(e) => setCoveredArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-10 py-3 text-sm text-slate-100 font-mono font-bold outline-none"
                    placeholder="150"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-mono">m²</span>
                </div>
              </div>

              {/* Occupancy Selection */}
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5 uppercase">
                  Occupancy Group
                </label>
                <select
                  value={occupancyGroup}
                  onChange={(e) => setOccupancyGroup(e.target.value as "group1" | "group2")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-sm text-slate-100 font-sans outline-none"
                >
                  <option value="group1">
                    Group A1 / A2 / F / J (25 L/m²) - Residential, Commercial, Multiplex
                  </option>
                  <option value="group2">
                    Group B / C / D / E / G1 / G2 (50 L/m²) - Educational, Assembly, Medical, Industrial
                  </option>
                </select>
                <p className="text-[11px] font-mono text-slate-400 mt-2">
                  Rate applied as per selected group under Rule 3(iv).
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Code Reference Extract */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 relative bg-blueprint-grid">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Code Reference Extract</span>
            </div>

            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 text-xs font-mono text-slate-200 space-y-2">
              <p className="font-bold text-cyan-300">
                (3) Minimum capacity of storage tank under Rule 3(iv):
              </p>
              <div className="flex justify-between py-1 border-b border-blue-900/40">
                <span>Group A1 / A2 / F / J :</span>
                <span className="font-bold text-white">25 Litres / sq.m</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Group B / C / D / E / G1 / G2 :</span>
                <span className="font-bold text-white">50 Litres / sq.m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Card (Big Blue Display) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-500/50 rounded-2xl p-6 shadow-2xl text-white space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-blue-500/40 pb-3">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-200">
                MINIMUM CAPACITY
              </span>
              <div className="w-7 h-7 rounded-full bg-blue-500/40 border border-blue-300/60 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Giant Litres Display */}
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white">
                {minCapacity.toLocaleString()} <span className="text-xl font-sans font-normal text-blue-200">Litres</span>
              </div>
              <p className="text-xs font-mono text-blue-200/90">
                Required minimum tank storage capacity
              </p>
            </div>

            {/* Calculation Breakdown Box */}
            <div className="space-y-2 pt-2 border-t border-blue-500/40">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-blue-200">
                CALCULATION BREAKDOWN
              </span>

              <div className="bg-blue-950/60 border border-blue-400/30 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                <span>{coveredArea} m²</span>
                <span className="text-blue-300">✕</span>
                <span>{rate} L/m²</span>
                <span className="text-blue-300">=</span>
                <span className="font-bold text-cyan-300">{minCapacity.toLocaleString()} L</span>
              </div>
            </div>

            {/* Suggested Dimensions */}
            <div className="bg-blue-950/50 border border-blue-400/20 rounded-xl p-3 space-y-1 text-xs font-mono text-blue-100">
              <span className="text-[10px] uppercase font-bold text-blue-300">Suggested Underground Tank Dimensions:</span>
              <p>
                Depth: 1.50 m • Approx Width: {approxWidth} m • Approx Length: {approxLength} m ({capacityM3.toFixed(2)} m³)
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={handleSaveCapacity}
              className="w-full bg-white hover:bg-slate-100 text-blue-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-mono transition cursor-pointer shadow-lg uppercase"
            >
              <Bookmark className="w-4 h-4 text-blue-950" />
              <span>Save Tank Capacity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
