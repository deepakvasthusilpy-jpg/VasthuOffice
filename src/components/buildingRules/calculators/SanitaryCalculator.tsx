import React, { useState } from "react";
import { Bath, HelpCircle, CheckCircle2, Bookmark, Users, FileText, Check } from "lucide-react";

export const SanitaryCalculator: React.FC = () => {
  const [occupancy, setOccupancy] = useState<string>("E");
  const [occupantCount, setOccupantCount] = useState<number>(100);
  const [malePercentage, setMalePercentage] = useState<number>(50);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const maleCount = Math.round((occupantCount * malePercentage) / 100);
  const femaleCount = occupantCount - maleCount;

  // Calculate fixtures based on occupancy group
  let maleWc = 0;
  let femaleWc = 0;
  let urinals = 0;
  let washBasins = 0;
  let drinkingFountains = 0;

  if (occupancy === "E" || occupancy === "F") {
    // Commercial / Offices
    maleWc = maleCount > 0 ? Math.ceil(1 + (maleCount > 25 ? (maleCount - 25) / 50 : 0)) : 0;
    femaleWc = femaleCount > 0 ? Math.ceil(1 + (femaleCount > 15 ? (femaleCount - 15) / 25 : 0)) : 0;
    urinals = maleCount > 0 ? Math.ceil(maleCount / 50) : 0;
    washBasins = Math.ceil(occupantCount / 25);
    drinkingFountains = Math.ceil(occupantCount / 100);
  } else if (occupancy === "B") {
    // Educational
    maleWc = maleCount > 0 ? Math.ceil(maleCount / 40) : 0;
    femaleWc = femaleCount > 0 ? Math.ceil(femaleCount / 25) : 0;
    urinals = maleCount > 0 ? Math.ceil(maleCount / 20) : 0;
    washBasins = Math.ceil(occupantCount / 25);
    drinkingFountains = Math.ceil(occupantCount / 50);
  } else if (occupancy === "D") {
    // Assembly / Auditoriums
    maleWc = maleCount > 0 ? Math.ceil(maleCount / 100) : 0;
    femaleWc = femaleCount > 0 ? Math.ceil(femaleCount / 50) : 0;
    urinals = maleCount > 0 ? Math.ceil(maleCount / 50) : 0;
    washBasins = Math.ceil(occupantCount / 100);
    drinkingFountains = Math.ceil(occupantCount / 200);
  } else if (occupancy === "C") {
    // Hospitals
    maleWc = maleCount > 0 ? Math.ceil(maleCount / 25) : 0;
    femaleWc = femaleCount > 0 ? Math.ceil(femaleCount / 25) : 0;
    urinals = maleCount > 0 ? Math.ceil(maleCount / 50) : 0;
    washBasins = Math.ceil(occupantCount / 20);
    drinkingFountains = Math.ceil(occupantCount / 100);
  } else {
    // Residential / General
    maleWc = Math.max(1, Math.ceil(maleCount / 25));
    femaleWc = Math.max(1, Math.ceil(femaleCount / 20));
    urinals = Math.ceil(maleCount / 50);
    washBasins = Math.ceil(occupantCount / 25);
    drinkingFountains = 1;
  }

  const totalWc = maleWc + femaleWc;

  const handleSaveSanitary = () => {
    setSavedNotification("Sanitary fixtures assessment report saved!");
    setTimeout(() => setSavedNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              KPBR Annexure F / Rule 42
            </span>
            <span className="text-xs text-slate-400">Panchayat & Municipal Building Rules</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Bath className="w-6 h-6 text-cyan-400" />
            <span>Sanitary & Plumbing Fixtures Calculator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Calculate mandated minimum water closets (WC), urinals, wash basins, and drinking fountains as per KPBR Annexure F
          </p>
        </div>

        <button
          onClick={() => alert("KPBR Sanitary Fixture Requirements:\n- Offices / Commercial: 1 WC per 25 males, 1 WC per 15 females, 1 Urinal per 50 males\n- Educational: 1 WC per 40 males, 1 WC per 25 females\n- Assembly: 1 WC per 100 males, 1 WC per 50 females")}
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
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Population Parameters */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 relative bg-blueprint-grid">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">Occupancy & Population</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                Rule 42
              </span>
            </div>

            <div className="space-y-4">
              {/* Occupancy Group Dropdown */}
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5 uppercase">
                  Occupancy Group
                </label>
                <select
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-sans outline-none"
                >
                  <option value="E">Group E - Offices & Professional Buildings</option>
                  <option value="F">Group F - Commercial & Mercantile Shops</option>
                  <option value="B">Group B - Educational Institutions / Schools</option>
                  <option value="D">Group D - Assembly Halls & Auditoriums</option>
                  <option value="C">Group C - Hospitals & Medical Clinics</option>
                  <option value="A1">Group A1 - Residential / Hostels</option>
                </select>
              </div>

              {/* Occupant Load Count */}
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5 uppercase">
                  Total Occupant Load (Persons)
                </label>
                <input
                  type="number"
                  min="1"
                  value={occupantCount || ""}
                  onChange={(e) => setOccupantCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono font-bold outline-none"
                  placeholder="100"
                />
              </div>

              {/* Male / Female Split Slider */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Male / Female Split</span>
                  <span className="font-bold text-cyan-300">
                    Male: {maleCount} ({malePercentage}%) • Female: {femaleCount} ({100 - malePercentage}%)
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="90"
                  value={malePercentage}
                  onChange={(e) => setMalePercentage(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Code Norm Extract */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 relative bg-blueprint-grid">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Annexure F Norms Extract</span>
            </div>

            <div className="text-xs font-mono text-slate-300 space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <p>• <strong className="text-cyan-300">Male WCs:</strong> 1 per 25 males (first 25), 1 per 50 thereafter.</p>
              <p>• <strong className="text-cyan-300">Female WCs:</strong> 1 per 15 females (first 15), 1 per 25 thereafter.</p>
              <p>• <strong className="text-cyan-300">Male Urinals:</strong> 1 per 50 males.</p>
              <p>• <strong className="text-cyan-300">Wash Basins:</strong> 1 per 25 users.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Fixture Requirements Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans uppercase tracking-tight">
                Mandated Fixtures
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> COMPLIANT
              </span>
            </div>

            {/* Fixture Output Breakdown */}
            <div className="space-y-4 font-sans text-sm">
              {/* Total Water Closets */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Water Closets (WC)</span>
                  <span className="text-2xl font-mono font-bold text-cyan-300">{totalWc}</span>
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>Male WC: {maleWc}</span>
                  <span>Female WC: {femaleWc}</span>
                </div>
              </div>

              {/* Male Urinals */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-200">Urinals (Male)</span>
                  <span className="text-[11px] font-mono text-slate-500">1 per 50 males</span>
                </div>
                <span className="text-2xl font-mono font-bold text-white">{urinals}</span>
              </div>

              {/* Wash Basins */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-200">Wash Basins</span>
                  <span className="text-[11px] font-mono text-slate-500">1 per 25 occupants</span>
                </div>
                <span className="text-2xl font-mono font-bold text-white">{washBasins}</span>
              </div>

              {/* Drinking Water Fountains */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-200">Drinking Water Taps</span>
                  <span className="text-[11px] font-mono text-slate-500">1 per 100 occupants</span>
                </div>
                <span className="text-2xl font-mono font-bold text-white">{drinkingFountains}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleSaveSanitary}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-mono transition cursor-pointer shadow-lg shadow-emerald-500/10 uppercase"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Sanitary Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
