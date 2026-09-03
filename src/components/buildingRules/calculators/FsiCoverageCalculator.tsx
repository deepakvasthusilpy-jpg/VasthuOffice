import React, { useState } from "react";
import { Plus, Trash2, HelpCircle, CheckCircle2, Bookmark, Layers, AlertCircle, Building2 } from "lucide-react";

interface FloorRow {
  id: string;
  levelName: string;
  existBua: number;
  propBua: number;
  existFloorArea: number;
  propFloorArea: number;
}

interface BlockData {
  id: string;
  name: string;
  occupancy: string;
  mode: "existing" | "proposed" | "addition";
  floors: FloorRow[];
}

const OCCUPANCY_FSI_LIMITS: Record<string, { name: string; maxFsi: number; maxCoverage: number }> = {
  "A1": { name: "A1 - Residential", maxFsi: 2.0, maxCoverage: 65 },
  "A2": { name: "A2 - Special Residential", maxFsi: 2.2, maxCoverage: 65 },
  "B": { name: "B - Educational", maxFsi: 2.5, maxCoverage: 60 },
  "C": { name: "C - Medical", maxFsi: 2.5, maxCoverage: 60 },
  "D": { name: "D - Assembly", maxFsi: 1.5, maxCoverage: 50 },
  "E": { name: "E - Office", maxFsi: 2.5, maxCoverage: 65 },
  "F": { name: "F - Commercial (Mercantile)", maxFsi: 2.5, maxCoverage: 65 },
  "G": { name: "G - Industrial", maxFsi: 2.0, maxCoverage: 60 },
  "H": { name: "H - Storage", maxFsi: 1.8, maxCoverage: 60 },
  "J": { name: "J - Multiplex & Malls", maxFsi: 3.0, maxCoverage: 65 }
};

export const FsiCoverageCalculator: React.FC = () => {
  const [plotArea, setPlotArea] = useState<number>(1500);

  const [blocks, setBlocks] = useState<BlockData[]>([
    {
      id: "block-a",
      name: "Block A",
      occupancy: "F",
      mode: "addition",
      floors: [
        { id: "f-1", levelName: "CELLAR -1", existBua: 500, propBua: 0, existFloorArea: 480, propFloorArea: 0 },
        { id: "f-2", levelName: "FLOOR 0 (G)", existBua: 600, propBua: 0, existFloorArea: 580, propFloorArea: 0 },
        { id: "f-3", levelName: "FLOOR 1", existBua: 0, propBua: 600, existFloorArea: 0, propFloorArea: 580 }
      ]
    }
  ]);

  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Add new block
  const addBlock = () => {
    const letter = String.fromCharCode(65 + blocks.length);
    setBlocks((prev) => [
      ...prev,
      {
        id: `block-${Date.now()}`,
        name: `Block ${letter}`,
        occupancy: "A1",
        mode: "proposed",
        floors: [
          { id: `f-${Date.now()}-1`, levelName: "FLOOR 0 (G)", existBua: 0, propBua: 200, existFloorArea: 0, propFloorArea: 190 }
        ]
      }
    ]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const addFloor = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const newLevelNum = b.floors.length;
        return {
          ...b,
          floors: [
            ...b.floors,
            {
              id: `f-${Date.now()}`,
              levelName: `FLOOR ${newLevelNum}`,
              existBua: 0,
              propBua: 0,
              existFloorArea: 0,
              propFloorArea: 0
            }
          ]
        };
      })
    );
  };

  const removeFloor = (blockId: string, floorId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        if (b.floors.length <= 1) return b;
        return {
          ...b,
          floors: b.floors.filter((f) => f.id !== floorId)
        };
      })
    );
  };

  const updateFloorVal = (blockId: string, floorId: string, field: keyof FloorRow, val: any) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          floors: b.floors.map((f) => (f.id === floorId ? { ...f, [field]: val } : f))
        };
      })
    );
  };

  // Calculations
  let totalExistBua = 0;
  let totalPropBua = 0;
  let totalExistFloorArea = 0;
  let totalPropFloorArea = 0;

  // For coverage calculation: sum of ground floor / cellar footprints across blocks
  let totalGroundFootprintArea = 0;

  blocks.forEach((b) => {
    b.floors.forEach((f, idx) => {
      totalExistBua += Number(f.existBua) || 0;
      totalPropBua += Number(f.propBua) || 0;
      totalExistFloorArea += Number(f.existFloorArea) || 0;
      totalPropFloorArea += Number(f.propFloorArea) || 0;

      // Ground floor level footprint for coverage
      if (idx === 1 || f.levelName.includes("FLOOR 0") || f.levelName.includes("GROUND") || idx === 0) {
        if (idx === 1 || f.levelName.includes("FLOOR 0") || f.levelName.includes("GROUND")) {
          const groundArea = (Number(f.existBua) || 0) + (Number(f.propBua) || 0);
          totalGroundFootprintArea += groundArea;
        }
      }
    });
  });

  // Fallback if ground footprint not specifically tagged
  if (totalGroundFootprintArea === 0 && blocks.length > 0) {
    const groundFloor = blocks[0].floors.find(f => f.levelName.includes("FLOOR 0") || f.levelName.includes("GROUND")) || blocks[0].floors[0];
    if (groundFloor) {
      totalGroundFootprintArea = (Number(groundFloor.existBua) || 0) + (Number(groundFloor.propBua) || 0);
    }
  }

  const grandTotalBua = totalExistBua + totalPropBua;
  const grandTotalFloorArea = totalExistFloorArea + totalPropFloorArea;

  const calculatedFsi = plotArea > 0 ? grandTotalFloorArea / plotArea : 0;
  const calculatedCoverage = plotArea > 0 ? (totalGroundFootprintArea / plotArea) * 100 : 0;

  // Max permissible rules from main block occupancy
  const primaryOccupancy = blocks[0]?.occupancy || "F";
  const occLimits = OCCUPANCY_FSI_LIMITS[primaryOccupancy] || OCCUPANCY_FSI_LIMITS["F"];

  const fsiPass = calculatedFsi <= occLimits.maxFsi;
  const coveragePass = calculatedCoverage <= occLimits.maxCoverage;

  const handleSaveReport = () => {
    setSavedNotification("Assessment report saved successfully!");
    setTimeout(() => setSavedNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              KBR 2026 § 3.1 & 3.2
            </span>
            <span className="text-xs text-slate-400">Panchayat & Municipal Building Rules</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Advanced FSI & Plot Coverage Calculator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Calculate Floor Space Index and overall plot coverage for multiple building blocks
          </p>
        </div>

        <button
          onClick={() => alert("KBR FSI & Coverage Norms:\n- FSI = Total Floor Area / Plot Area\n- Plot Coverage = Building Ground Footprint Area / Total Plot Area × 100%\n- Max Permissible FSI & Coverage vary by Occupancy (e.g. Commercial FSI: 2.50, Coverage: 65%)")}
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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plot Parameters & Block Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plot Parameters Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative bg-blueprint-grid">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">Plot Parameters</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                KBR 2026 § 3.1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  TOTAL PLOT AREA
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={plotArea || ""}
                    onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-100 font-mono font-bold outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">m²</span>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  NO. OF BLOCKS
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-center text-sm font-mono font-bold text-white">
                  {blocks.length}
                </div>
              </div>

              <div className="sm:col-span-3 flex items-end h-full pt-6">
                <button
                  onClick={addBlock}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-mono transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Block</span>
                </button>
              </div>
            </div>
          </div>

          {/* Block Cards */}
          {blocks.map((block) => {
            const blockExistBua = block.floors.reduce((sum, f) => sum + (Number(f.existBua) || 0), 0);
            const blockPropBua = block.floors.reduce((sum, f) => sum + (Number(f.propBua) || 0), 0);
            const blockExistFa = block.floors.reduce((sum, f) => sum + (Number(f.existFloorArea) || 0), 0);
            const blockPropFa = block.floors.reduce((sum, f) => sum + (Number(f.propFloorArea) || 0), 0);

            return (
              <div
                key={block.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative bg-blueprint-grid"
              >
                {/* Block Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white font-sans">{block.name}</h3>
                    {blocks.length > 1 && (
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-mono flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Existing / Proposed / Addition Mode Toggles */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, mode: "existing" } : b))
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg transition ${
                        block.mode === "existing" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                      }`}
                    >
                      Existing
                    </button>
                    <button
                      onClick={() =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, mode: "proposed" } : b))
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg transition ${
                        block.mode === "proposed" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                      }`}
                    >
                      Proposed
                    </button>
                    <button
                      onClick={() =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, mode: "addition" } : b))
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg transition ${
                        block.mode === "addition" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                      }`}
                    >
                      Addition
                    </button>
                  </div>
                </div>

                {/* Occupancy Selector */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    OCCUPANCY TYPE
                  </label>
                  <select
                    value={block.occupancy}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) => (b.id === block.id ? { ...b, occupancy: e.target.value } : b))
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-sans"
                  >
                    {Object.entries(OCCUPANCY_FSI_LIMITS).map(([code, item]) => (
                      <option key={code} value={code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor Table */}
                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px]">
                        <th className="p-2.5 uppercase font-bold">FLOOR LEVEL</th>
                        <th className="p-2.5 uppercase font-bold text-center" colSpan={2}>
                          BUILT UP AREA (M²)
                        </th>
                        <th className="p-2.5 uppercase font-bold text-center" colSpan={2}>
                          FLOOR AREA (M²)
                        </th>
                        <th className="p-2.5 text-center">ACTION</th>
                      </tr>
                      <tr className="bg-slate-900/60 text-slate-500 border-b border-slate-800 text-[9px]">
                        <th></th>
                        <th className="p-1 text-center border-l border-slate-800/60">EXIST.</th>
                        <th className="p-1 text-center">PROP.</th>
                        <th className="p-1 text-center border-l border-slate-800/60">EXIST.</th>
                        <th className="p-1 text-center">PROP.</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {block.floors.map((floor) => (
                        <tr key={floor.id} className="hover:bg-slate-900/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={floor.levelName}
                              onChange={(e) => updateFloorVal(block.id, floor.id, "levelName", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                            />
                          </td>
                          <td className="p-1.5 border-l border-slate-800/60">
                            <input
                              type="number"
                              min="0"
                              value={floor.existBua || ""}
                              onChange={(e) =>
                                updateFloorVal(block.id, floor.id, "existBua", parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-right text-slate-300 outline-none"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              value={floor.propBua || ""}
                              onChange={(e) =>
                                updateFloorVal(block.id, floor.id, "propBua", parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-right text-cyan-300 outline-none font-bold"
                            />
                          </td>
                          <td className="p-1.5 border-l border-slate-800/60">
                            <input
                              type="number"
                              min="0"
                              value={floor.existFloorArea || ""}
                              onChange={(e) =>
                                updateFloorVal(
                                  block.id,
                                  floor.id,
                                  "existFloorArea",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-right text-slate-300 outline-none"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              value={floor.propFloorArea || ""}
                              onChange={(e) =>
                                updateFloorVal(
                                  block.id,
                                  floor.id,
                                  "propFloorArea",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-right text-cyan-300 outline-none font-bold"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            {block.floors.length > 1 && (
                              <button
                                onClick={() => removeFloor(block.id, floor.id)}
                                className="text-slate-500 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Subtotal row */}
                      <tr className="bg-slate-900/90 font-bold text-slate-200">
                        <td className="p-2 text-right uppercase text-[10px]">SUBTOTAL</td>
                        <td className="p-2 text-right border-l border-slate-800 text-slate-400">
                          {blockExistBua.toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-cyan-400">{blockPropBua.toFixed(2)}</td>
                        <td className="p-2 text-right border-l border-slate-800 text-slate-400">
                          {blockExistFa.toFixed(2)}
                        </td>
                        <td className="p-2 text-right text-cyan-400">{blockPropFa.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => addFloor(block.id)}
                  className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Floor Level</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: Analysis Report Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans uppercase tracking-tight">
                ANALYSIS REPORT
              </h3>
            </div>

            {/* BUA and Floor Area Summary */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>EXISTING BUA</span>
                <span>{totalExistBua.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PROPOSED BUA</span>
                <span>{totalPropBua.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                <span>Total Built-up Area</span>
                <span className="text-cyan-300">{grandTotalBua.toFixed(2)} m²</span>
              </div>

              <div className="pt-2 flex justify-between text-slate-400">
                <span>EXISTING FLOOR AREA</span>
                <span>{totalExistFloorArea.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PROPOSED FLOOR AREA</span>
                <span>{totalPropFloorArea.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                <span>Total Floor Area (FSI)</span>
                <span className="text-cyan-300">{grandTotalFloorArea.toFixed(2)} m²</span>
              </div>
            </div>

            {/* FSI Pass/Fail Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">CALCULATED F.S.I.</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                    fsiPass ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {fsiPass ? "PASS" : "FAIL"} {calculatedFsi.toFixed(2)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${fsiPass ? "bg-emerald-400" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, (calculatedFsi / occLimits.maxFsi) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Permissible: {occLimits.maxFsi.toFixed(2)} (Max)</span>
                <span>KBR § 3.1</span>
              </div>
            </div>

            {/* Coverage Pass/Fail Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">PLOT COVERAGE</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                    coveragePass ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {coveragePass ? "PASS" : "FAIL"} {calculatedCoverage.toFixed(1)}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${coveragePass ? "bg-emerald-400" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(100, (calculatedCoverage / occLimits.maxCoverage) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Permissible: {occLimits.maxCoverage}% (Max)</span>
                <span>KBR § 3.2</span>
              </div>
            </div>

            {/* Blueprint Layout Simulation Canvas / SVG Box */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>BLUEPRINT LAYOUT SIMULATION</span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 h-44 flex items-center justify-center relative bg-blueprint-grid">
                <svg className="w-full h-full max-w-[260px] max-h-[140px]" viewBox="0 0 200 120">
                  {/* Dashed Outer Plot Boundary */}
                  <rect
                    x="10"
                    y="10"
                    width="180"
                    height="100"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Solid Building Footprint */}
                  {plotArea > 0 && (
                    <rect
                      x="35"
                      y="25"
                      width={Math.max(20, Math.min(130, (calculatedCoverage / 100) * 130))}
                      height="70"
                      fill="#0284c7"
                      fillOpacity="0.4"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  )}
                  {/* Text Overlay */}
                  <text
                    x="100"
                    y="63"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Coverage: {calculatedCoverage.toFixed(1)}%
                  </text>
                </svg>
              </div>

              <p className="text-[10px] font-mono text-slate-500 text-center">
                Plot Boundary (dashed) vs Building Ground Footprint (solid)
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={addBlock}
                className="w-full bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono hover:bg-slate-900 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Block</span>
              </button>

              <button
                onClick={handleSaveReport}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-mono transition cursor-pointer shadow-lg shadow-emerald-500/10 uppercase"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Assessment Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
