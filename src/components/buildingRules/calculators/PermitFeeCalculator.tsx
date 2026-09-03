import React, { useState } from "react";
import { Plus, Trash2, HelpCircle, CheckCircle2, Bookmark, Calculator, Building2, Info } from "lucide-react";

interface BlockItem {
  id: string;
  name: string;
  occupancy: string;
  existingBua: number;
  proposedBua: number;
}

const OCCUPANCY_RATES: Record<string, { name: string; rate: number; code: string }> = {
  "A1": { name: "A1 - Residential (Single/Multi-family)", rate: 25, code: "A1" },
  "A2": { name: "A2 - Special Residential (Lodges/Hostels)", rate: 35, code: "A2" },
  "B": { name: "B - Educational Institutions", rate: 30, code: "B" },
  "C": { name: "C - Medical & Hospitals", rate: 40, code: "C" },
  "D": { name: "D - Assembly & Auditoriums", rate: 45, code: "D" },
  "E": { name: "E - Office & Business", rate: 50, code: "E" },
  "F": { name: "F - Commercial (Mercantile)", rate: 60, code: "F" },
  "G1": { name: "G1 - Industrial / Factory (Non-hazardous)", rate: 50, code: "G1" },
  "G2": { name: "G2 - Small Industrial", rate: 45, code: "G2" },
  "H": { name: "H - Storage & Warehouses", rate: 40, code: "H" },
  "I": { name: "I - Hazardous Buildings", rate: 80, code: "I" },
  "J": { name: "J - Multiplex & Malls", rate: 100, code: "J" }
};

export const PermitFeeCalculator: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockItem[]>([
    {
      id: "block-1",
      name: "Block A",
      occupancy: "A1",
      existingBua: 0,
      proposedBua: 120
    }
  ]);

  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const addBlock = () => {
    const blockLetter = String.fromCharCode(65 + blocks.length);
    setBlocks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Block ${blockLetter}`,
        occupancy: "A1",
        existingBua: 0,
        proposedBua: 100
      }
    ]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBlock = (id: string, field: keyof BlockItem, value: any) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Calculations
  const totalProposedArea = blocks.reduce((sum, b) => sum + (Number(b.proposedBua) || 0), 0);
  const totalExistingArea = blocks.reduce((sum, b) => sum + (Number(b.existingBua) || 0), 0);
  const totalAssessedArea = totalProposedArea + totalExistingArea;

  // Rule: If total area (Existing + Proposed) is less than 80 sqm, Permit Fee & Application Fee are BOTH 0.
  const isExemptedUnder80Sqm = totalAssessedArea < 80;

  // Application Fee Slab
  let applicationFee = 0;
  let slabText = "";

  if (isExemptedUnder80Sqm) {
    applicationFee = 0;
    slabText = "Exempted / സൗജന്യം (< 80m² Total Area)";
  } else if (totalAssessedArea > 300) {
    applicationFee = 1000;
    slabText = "Above 300m²";
  } else if (totalAssessedArea > 100) {
    applicationFee = 500;
    slabText = "100m² - 300m²";
  } else {
    applicationFee = 300;
    slabText = "80m² - 100m²";
  }

  // Permit Fees per block - CALCULATED ONLY FOR PROPOSED AREA
  const blockPermitFees = blocks.map((block) => {
    const rateInfo = OCCUPANCY_RATES[block.occupancy] || OCCUPANCY_RATES["A1"];
    const proposedArea = Number(block.proposedBua) || 0;
    const existingArea = Number(block.existingBua) || 0;

    // Permit Fee calculated ONLY for Proposed Area
    // If Existing + Proposed < 80 sqm => Fee = 0
    const fee = isExemptedUnder80Sqm ? 0 : proposedArea * rateInfo.rate;

    return {
      blockId: block.id,
      blockName: block.name,
      occupancyCode: rateInfo.code,
      rate: rateInfo.rate,
      proposedArea,
      existingArea,
      fee
    };
  });

  const totalPermitFee = blockPermitFees.reduce((sum, b) => sum + b.fee, 0);
  const totalPayable = applicationFee + totalPermitFee;

  const handleSaveReport = () => {
    setSavedNotification("Permit & Application Fee Assessment report saved successfully!");
    setTimeout(() => setSavedNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              KBR 2026 § 9(4) & § 10
            </span>
            <span className="text-xs text-slate-400">Panchayat & Municipal Building Rules</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-cyan-400" />
            <span>Permit & Application Fee Calculator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Calculate application and permit fees based on KBR guidelines (Permit fee for proposed area only; &lt;80m² total area is ₹0 exempted)
          </p>
        </div>

        <button
          onClick={() => alert("Application & Permit Fee Rules:\n- Total Area (Existing + Proposed) < 80m²: BOTH Application Fee and Permit Fee are ₹0 (Exempted)\n- Application Fee: 80-100m² ₹300, 100-300m² ₹500, >300m² ₹1000\n- Permit Fee: Calculated ONLY FOR PROPOSED AREA according to occupancy group (A1: ₹25/m², F: ₹60/m², etc.)")}
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 hover:border-cyan-500 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Guide & Rules</span>
        </button>
      </div>

      {savedNotification && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Main Grid: Left Inputs vs Right Fee Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Blocks Input */}
        <div className="lg:col-span-7 space-y-4">
          {blocks.map((block, idx) => {
            return (
              <div
                key={block.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative bg-blueprint-grid"
              >
                <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white font-sans">{block.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      KBR § 9(4)
                    </span>
                    {blocks.length > 1 && (
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition cursor-pointer"
                        title="Remove Block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Occupancy Select */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5 uppercase">
                      Occupancy Group
                    </label>
                    <select
                      value={block.occupancy}
                      onChange={(e) => updateBlock(block.id, "occupancy", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none font-sans"
                    >
                      {Object.entries(OCCUPANCY_RATES).map(([code, item]) => (
                        <option key={code} value={code}>
                          {item.name} (₹{item.rate}/m²)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Areas Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5">
                        Existing Built-up Area
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={block.existingBua || ""}
                          onChange={(e) => updateBlock(block.id, "existingBua", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-100 outline-none font-mono"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">m²</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5">
                        Proposed Built-up Area
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={block.proposedBua || ""}
                          onChange={(e) => updateBlock(block.id, "proposedBua", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-100 outline-none font-mono font-bold text-cyan-300"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={addBlock}
            className="w-full border-2 border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition cursor-pointer uppercase"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>+ ADD ANOTHER BLOCK</span>
          </button>
        </div>

        {/* Right Column: Fee Assessment Report Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans uppercase tracking-tight">
                Fee Assessment
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                KPBR OFFICIAL SCHEME
              </span>
            </div>

            {/* Total Area Info Badge */}
            {isExemptedUnder80Sqm ? (
              <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 text-xs text-emerald-200 space-y-1 font-sans">
                <div className="flex items-center gap-1.5 font-bold font-mono text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>80 SQ.M EXEMPTION APPLIED (സൗജന്യം)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  ആകെ വിസ്തീർണ്ണം (Existing + Proposed) = <strong className="text-white font-mono">{totalAssessedArea.toFixed(2)} m²</strong> (&lt; 80m²). നിയമപ്രകാരം അപേക്ഷാ ഫീസും പെർമിറ്റ് ഫീസും ₹0 ആണ്.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between font-mono font-bold text-slate-200">
                  <span>TOTAL ASSESSED AREA:</span>
                  <span className="text-cyan-300">{totalAssessedArea.toFixed(2)} m²</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  (Existing: {totalExistingArea.toFixed(2)}m² + Proposed: {totalProposedArea.toFixed(2)}m²)
                </p>
              </div>
            )}

            {/* Application Fee Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">Total Application Fee (അപേക്ഷാ ഫീസ്)</span>
                <span className="font-mono font-bold text-white">₹ {applicationFee.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Slab: {slabText}
                </span>
              </div>
            </div>

            {/* Permit Fee Breakdown per block */}
            <div className="space-y-3 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase">
                <span>Permit Fee (പെർമിറ്റ് ഫീസ്)</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">PROPOSED AREA ONLY</span>
              </div>

              {blockPermitFees.map((b) => (
                <div key={b.blockId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-200 font-medium">{b.blockName} Permit Fee</span>
                    <span className="font-mono font-bold text-white">₹ {b.fee.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5 pl-2 border-l-2 border-slate-800">
                    <div>Occupancy: {b.occupancyCode}</div>
                    <div>Rate: ₹ {b.rate.toFixed(2)} / m²</div>
                    <div>Proposed Area Assessed: <strong className="text-cyan-300">{b.proposedArea.toFixed(2)} m²</strong></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Payable Card */}
            <div className="bg-gradient-to-br from-slate-950 to-cyan-950/30 border border-cyan-500/40 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                TOTAL PAYABLE AMOUNT
              </span>
              <div className="text-3xl font-mono font-black text-white">
                ₹ {totalPayable.toFixed(2)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
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
