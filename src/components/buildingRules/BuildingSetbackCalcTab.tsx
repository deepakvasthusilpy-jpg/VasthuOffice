import React, { useState } from "react";
import { OCCUPANCY_GROUPS } from "../../data/buildingRulesData";
import { Calculator, CheckCircle2, AlertTriangle, ShieldCheck, Maximize2, Car, Layers, ArrowRight, Info } from "lucide-react";

export const BuildingSetbackCalcTab: React.FC = () => {
  const [occupancyId, setOccupancyId] = useState<string>("A1");
  const [roadWidth, setRoadWidth] = useState<number>(4.5);
  const [builtUpAreaSqM, setBuiltUpAreaSqM] = useState<number>(180);
  const [numFloors, setFloors] = useState<number>(2);
  const [isSingleFamily, setIsSingleFamily] = useState<boolean>(true);
  const [hasBlankSideWall, setHasBlankSideWall] = useState<boolean>(false);
  const [isACRoom, setIsACRoom] = useState<boolean>(false);

  // Selected group data
  const groupData = OCCUPANCY_GROUPS.find((g) => g.id === occupancyId) || OCCUPANCY_GROUPS[0];

  // Setback calculations with 2026 amendments:
  // Front Yard:
  let frontYard = 3.0; // default standard
  if (occupancyId === "A1" && isSingleFamily && roadWidth < 6) {
    frontYard = 2.0; // August 2026 S.R.O. No. 682/2026 Amendment
  } else if (occupancyId === "A1") {
    frontYard = 3.0;
  } else if (["B", "C", "D", "H", "J"].includes(occupancyId)) {
    frontYard = 6.0;
  } else if (["E", "F", "G1"].includes(occupancyId)) {
    frontYard = 3.0;
  }

  // Side Yards:
  let sideYard1 = 1.2;
  let sideYard2 = 1.5;

  if (occupancyId === "A1") {
    if (hasBlankSideWall) {
      sideYard1 = 0.5; // 2026 Proviso: reduced to 50cm if blank wall
    }
  } else if (["B", "C", "D", "H"].includes(occupancyId)) {
    sideYard1 = 3.0;
    sideYard2 = 3.0;
  }

  // Rear Yard:
  let rearYard = 1.5;
  if (["B", "C", "D", "H"].includes(occupancyId)) {
    rearYard = 3.0;
  }

  // Road Width Compliance:
  const roadWidthCompliant = roadWidth >= groupData.minRoadWidthMeters;

  // Minimum Height Rule (2026 AC room amendment):
  const minRoomHeight = isACRoom ? "2.4 മീറ്റർ (AC Room 2026 Amendment)" : "2.75 മീറ്റർ (Standard)";

  // Low Risk Category Evaluation
  let isLowRisk = false;
  if (occupancyId === "A1" && builtUpAreaSqM <= 300 && numFloors <= 2) {
    isLowRisk = true;
  } else if (["A2", "B", "D"].includes(occupancyId) && builtUpAreaSqM <= 200) {
    isLowRisk = true;
  } else if (occupancyId === "F" && builtUpAreaSqM <= 250) {
    isLowRisk = true;
  }

  // Estimated Parking calculation
  let requiredCarParks = 0;
  if (occupancyId === "A1") {
    requiredCarParks = builtUpAreaSqM > 150 ? Math.ceil(builtUpAreaSqM / 150) : 1;
  } else if (occupancyId === "A2") {
    requiredCarParks = Math.ceil(builtUpAreaSqM / 120);
  } else if (occupancyId === "E") {
    requiredCarParks = Math.ceil(builtUpAreaSqM / 90);
  } else if (occupancyId === "F") {
    requiredCarParks = Math.ceil(builtUpAreaSqM / 60);
  } else {
    requiredCarParks = Math.ceil(builtUpAreaSqM / 150);
  }

  const requiredTwoWheelers = Math.ceil(requiredCarParks * 0.25);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl bg-blueprint-grid">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 uppercase">
                KPBR 2019 & 2026 GAZETTE COMPLIANCE
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                സെറ്റ്ബാക്ക് & പെർമിറ്റ് കാൽക്കുലേറ്റർ
              </span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              <span>സെറ്റ്ബാക്ക് കാൽക്കുലേറ്റർ (Setback & Rule Checker)</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              നിങ്ങളുടെ കെട്ടിടത്തിന്റെ തരം, റോഡ് വീതി, വിസ്തീർണ്ണം എന്നിവ നൽകി ആവശ്യമായ മുറ്റങ്ങളുടെ അളവുകളും നിയമങ്ങളും അറിയുക
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 bg-blueprint-grid-dark">
          <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4" />
            <span>കെട്ടിട വിവരങ്ങൾ (Building Inputs)</span>
          </h3>

          {/* Occupancy Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300 block">
              കെട്ടിട ഉപയോഗ ഗണം (Occupancy Group):
            </label>
            <select
              value={occupancyId}
              onChange={(e) => setOccupancyId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 font-sans outline-none"
            >
              {OCCUPANCY_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code} - {g.nameMl}
                </option>
              ))}
            </select>
          </div>

          {/* Road Width Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-300">
              <span>പ്രവേശന റോഡ് വീതി (Road Width):</span>
              <span className="text-cyan-400 font-bold">{roadWidth} m</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="1"
              max="20"
              value={roadWidth}
              onChange={(e) => setRoadWidth(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 font-mono outline-none"
            />
          </div>

          {/* Built-up Area Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-300">
              <span>ആകെ വിസ്തീർണ്ണം (Built-up Area):</span>
              <span className="text-cyan-400 font-bold">{builtUpAreaSqM} sq.m ({Math.round(builtUpAreaSqM * 10.7639)} sq.ft)</span>
            </div>
            <input
              type="number"
              step="5"
              min="20"
              max="5000"
              value={builtUpAreaSqM}
              onChange={(e) => setBuiltUpAreaSqM(parseInt(e.target.value) || 20)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 font-mono outline-none"
            />
          </div>

          {/* Floors Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-300">
              <span>നിലകളുടെ എണ്ണം (Number of Storeys):</span>
              <span className="text-cyan-400 font-bold">{numFloors} Floors</span>
            </div>
            <input
              type="number"
              min="1"
              max="15"
              value={numFloors}
              onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 font-mono outline-none"
            />
          </div>

          {/* Checkboxes for 2026 Special Provisions */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
              2026 ഭേദഗതി ആനുകൂല്യങ്ങൾ (Special Provisions):
            </span>

            {occupancyId === "A1" && (
              <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSingleFamily}
                  onChange={(e) => setIsSingleFamily(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-0"
                />
                <span>ഒറ്റക്കുടുംബ വാസഗൃഹം (Single Family Residential) - (2m Front yard benefit)</span>
              </label>
            )}

            <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasBlankSideWall}
                onChange={(e) => setHasBlankSideWall(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-0"
              />
              <span>ഒരു വശത്ത് വാതിൽ/ജനൽ ഇല്ലാത്ത മതിൽ ചുമർ (Blank side wall - 50cm yard benefit)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isACRoom}
                onChange={(e) => setIsACRoom(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-0"
              />
              <span>എയർ കണ്ടീഷൻ ചെയ്ത മുറികൾ (AC Rooms - 2.4m height rule)</span>
            </label>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-5">
          {/* Setback Grid Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-emerald-400" />
                <span>ആവശ്യമായ കുറഞ്ഞ മുറ്റങ്ങളുടെ അളവുകൾ (Required Setbacks)</span>
              </h3>
              {occupancyId === "A1" && isSingleFamily && roadWidth < 6 && (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  2026 SRO 682/2026 APPLIED
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">മുൻമുറ്റം (Front Yard)</span>
                <span className="text-xl font-mono font-black text-cyan-300">{frontYard} m</span>
                <span className="text-[10px] font-sans text-slate-400 block">
                  {occupancyId === "A1" && roadWidth < 6 ? "(2026 ഭേദഗതി: 2m)" : "(Standard)"}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">വശം 1 (Side Yard 1)</span>
                <span className="text-xl font-mono font-black text-emerald-300">{sideYard1} m</span>
                <span className="text-[10px] font-sans text-slate-400 block">
                  {hasBlankSideWall ? "(Blank wall: 0.5m)" : "(Standard)"}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">വശം 2 (Side Yard 2)</span>
                <span className="text-xl font-mono font-black text-teal-300">{sideYard2} m</span>
                <span className="text-[10px] font-sans text-slate-400 block">(Standard)</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">പിൻമുറ്റം (Rear Yard)</span>
                <span className="text-xl font-mono font-black text-amber-300">{rearYard} m</span>
                <span className="text-[10px] font-sans text-slate-400 block">(Standard)</span>
              </div>
            </div>

            {/* Ceiling height note */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-300">മുറിയുടെ കുറഞ്ഞ ഉയരം (Min Ceiling Height):</span>
              <span className="font-mono font-bold text-cyan-300">{minRoomHeight}</span>
            </div>
          </div>

          {/* Road Width Compliance & Low Risk Evaluation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Road Compliance */}
            <div className={`p-4 rounded-2xl border ${roadWidthCompliant ? "bg-slate-900/90 border-emerald-500/40" : "bg-rose-950/40 border-rose-800/80"} space-y-2`}>
              <div className="flex items-center gap-2">
                {roadWidthCompliant ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <h4 className="text-xs font-mono font-bold uppercase text-white">
                  റോഡ് വീതി തൃപ്തികരം (Road Access Check)
                </h4>
              </div>
              <p className="text-xs text-slate-200 font-sans">
                ആവശ്യമായ കുറഞ്ഞ റോഡ് വീതി: <strong>{groupData.minRoadWidthMeters}m</strong>. നിലവിലെ റോഡ് വീതി: <strong>{roadWidth}m</strong>.
              </p>
              {!roadWidthCompliant && (
                <p className="text-xs text-rose-300 font-sans">
                  * റോഡ് വീതി കുറവാണ്. സെക്രട്ടറി പ്രത്യേക അനുമതി അല്ലെങ്കിൽ അപേക്ഷകന്റെ അനുമതി പത്രം ആവശ്യപ്പെടാം.
                </p>
              )}
            </div>

            {/* Low Risk Permitting Status */}
            <div className={`p-4 rounded-2xl border ${isLowRisk ? "bg-slate-900/90 border-emerald-500/40" : "bg-slate-900/90 border-slate-800"} space-y-2`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white">
                  പെർമിറ്റ് തരം (Permit Classification)
                </h4>
              </div>
              <p className="text-xs text-slate-200 font-sans">
                {isLowRisk ? (
                  <span className="text-emerald-300 font-bold">
                    ✓ Low Risk Category (കുറഞ്ഞ അപകടസാധ്യതയുള്ള കെട്ടിടം) - സ്വയം സാക്ഷ്യപത്രത്തിലൂടെ (Self-certification Form A1A) വേഗത്തിൽ പെർമിറ്റ് ലഭ്യമാക്കാം.
                  </span>
                ) : (
                  <span className="text-slate-300">
                    Standard Permit - പഞ്ചായത്ത് സെക്രട്ടറിയുടെ പ്ലാൻ പരിശോധനയ്ക്കും സാക്ഷ്യപ്പെടുത്തലിനും ശേഷം പെർമിറ്റ് ലഭ്യമാകും.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Required Parking Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>ആവശ്യമായ പാർക്കിംഗ് കണക്ക് (Estimated Parking)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">റൂൾ 29 & പട്ടിക 9</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">കാർ പാർക്കിംഗ് (Cars)</span>
                <span className="text-lg font-mono font-black text-cyan-300">{requiredCarParks} Slots</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">ഇരുചക്ര വാഹനം (Bikes)</span>
                <span className="text-lg font-mono font-black text-emerald-300">{requiredTwoWheelers} Slots</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
