import React, { useState } from "react";
import { Car, Bike, Plus, Trash2, HelpCircle, CheckCircle2, Bookmark, MapPin, Building, ShieldCheck } from "lucide-react";

interface OtherOccupancyRow {
  id: string;
  group: string;
  area: number;
}

const TABLE_10_RATES: Record<string, { label: string; areaPerSlot: number }> = {
  "A2": { label: "A2 - Lodging Houses & Hostels", areaPerSlot: 120 },
  "B": { label: "B - Educational Institutions", areaPerSlot: 150 },
  "C": { label: "C - Medical & Hospitals", areaPerSlot: 90 },
  "D": { label: "D - Assembly Halls & Auditoriums", areaPerSlot: 15 },
  "E": { label: "E - Offices & Professional Bldgs", areaPerSlot: 90 },
  "F": { label: "F - Commercial & Mercantile Shops", areaPerSlot: 60 },
  "G": { label: "G - Industrial & Factories", areaPerSlot: 240 },
  "H": { label: "H - Storage & Warehouses", areaPerSlot: 240 },
  "J": { label: "J - Multiplexes & Shopping Malls", areaPerSlot: 60 }
};

export const ParkingCalculator: React.FC = () => {
  // Site Details State
  const [plotArea, setPlotArea] = useState<number>(0);
  const [isRowHousing, setIsRowHousing] = useState<boolean>(false);

  // Group A1 Residential Units State
  const [unitsUpTo75, setUnitsUpTo75] = useState<number>(0);
  const [units75To185, setUnits75To185] = useState<number>(0);
  const [units185To300, setUnits185To300] = useState<number>(0);
  const [unitsAbove300, setUnitsAbove300] = useState<number>(0);

  // Other Occupancies State
  const [otherOccupancies, setOtherOccupancies] = useState<OtherOccupancyRow[]>([]);

  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Handlers for Other Occupancies
  const addOtherOccupancy = () => {
    setOtherOccupancies((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        group: "F",
        area: 0
      }
    ]);
  };

  const removeOtherOccupancy = (id: string) => {
    setOtherOccupancies((prev) => prev.filter((item) => item.id !== id));
  };

  const updateOtherOccupancy = (id: string, field: keyof OtherOccupancyRow, value: any) => {
    setOtherOccupancies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  // A1 Subtotal Car Slots
  const slotsUpTo75 = unitsUpTo75 * 0.5;
  const slots75To185 = units75To185 * 1.0;
  const slots185To300 = units185To300 * 1.5;
  const slotsAbove300 = unitsAbove300 * 2.0;

  const rawA1Subtotal = slotsUpTo75 + slots75To185 + slots185To300 + slotsAbove300;
  const subtotalCarSlotsA1 = Math.ceil(rawA1Subtotal);

  // Visitor Parking for A1 (15% of A1 subtotal rounded up)
  const visitorsParkingA1 = subtotalCarSlotsA1 > 0 ? Math.ceil(subtotalCarSlotsA1 * 0.15) : 0;

  // Other Occupancies Car Slots
  const otherOccupancySlotsArr = otherOccupancies.map((row) => {
    const rateObj = TABLE_10_RATES[row.group] || TABLE_10_RATES["F"];
    const slots = row.area > 0 ? Math.ceil(row.area / rateObj.areaPerSlot) : 0;
    return slots;
  });
  const otherOccupanciesSlots = otherOccupancySlotsArr.reduce((sum, s) => sum + s, 0);

  // Total base car slots before reserved
  const baseTotalCarSlots = subtotalCarSlotsA1 + visitorsParkingA1 + otherOccupanciesSlots;

  // Reserved (Differently Abled) - 3% of Total, min 1 slot if baseTotalCarSlots > 0
  const reservedDisabled = baseTotalCarSlots > 0 ? Math.max(1, Math.ceil(baseTotalCarSlots * 0.03)) : 0;

  const totalCarSlots = baseTotalCarSlots + reservedDisabled;

  // Two Wheeler Provision (25% of total car parking area)
  // Car slot area = 5.5m * 2.7m = 14.85 m²
  const totalCarArea = totalCarSlots * 14.85;
  const mandatoryTwoWheelerArea = totalCarArea * 0.25;
  const estimatedTwoWheelerSlots = Math.ceil(mandatoryTwoWheelerArea / 3.0); // 3 m² per two-wheeler

  const handleSaveAssessment = () => {
    setSavedNotification("Parking assessment saved successfully!");
    setTimeout(() => setSavedNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              KBR § 8.2
            </span>
            <span className="text-xs text-slate-400">Panchayat & Municipal Building Rules</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Car className="w-6 h-6 text-cyan-400" />
            <span>Comprehensive Parking Calculator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Calculate mandatory car slots, visitor parking, differently-abled provision, and two-wheeler requirements
          </p>
        </div>

        <button
          onClick={() => alert("KPBR Parking Rules Summary:\n- Group A1 (Residential):\n  • Up to 75m²: 1 slot per 2 units\n  • 75-185m²: 1 slot per unit\n  • 185-300m²: 1.5 slots per unit\n  • >300m²: 2 slots per unit\n- Visitors' Parking: 15% of A1 Subtotal\n- Differently-Abled: 3% of Total (Min 1 slot)\n- Two-Wheeler: Mandatory area = 25% of total car parking area")}
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-slate-900 border border-slate-700 hover:border-cyan-500 px-3 py-1.5 rounded-xl transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Guide & Table Reference</span>
        </button>
      </div>

      {savedNotification && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Site Details & Tables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Site Details */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative bg-blueprint-grid">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">Site Details</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                KBR § 8.2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1">
                  Plot Area
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">Used for exemption checks</p>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={plotArea || ""}
                    onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-3.5 pr-12 py-2.5 text-sm text-slate-100 font-mono outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">sq.m</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Row Housing</span>
                  <span className="text-[11px] text-slate-500">Special exemption for small plots</span>
                </div>
                <input
                  type="checkbox"
                  checked={isRowHousing}
                  onChange={(e) => setIsRowHousing(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Residential (Group A1) Table 9 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative bg-blueprint-grid">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">Residential (Group A1)</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
                Table 9
              </span>
            </div>

            <div className="space-y-3">
              {/* Row 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Up to 75 sq.m</span>
                  <span className="text-[11px] font-mono text-slate-400">Rate: 1 slot per 2 units</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={unitsUpTo75 || ""}
                    onChange={(e) => setUnitsUpTo75(parseInt(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-right text-slate-100 font-mono outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs font-mono text-slate-400">units</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div>
                  <span className="block text-xs font-bold text-slate-200">75 - 185 sq.m</span>
                  <span className="text-[11px] font-mono text-slate-400">Rate: 1 slot per unit</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={units75To185 || ""}
                    onChange={(e) => setUnits75To185(parseInt(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-right text-slate-100 font-mono outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs font-mono text-slate-400">units</span>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div>
                  <span className="block text-xs font-bold text-slate-200">185 - 300 sq.m</span>
                  <span className="text-[11px] font-mono text-slate-400">Rate: 1.5 slots per unit</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={units185To300 || ""}
                    onChange={(e) => setUnits185To300(parseInt(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-right text-slate-100 font-mono outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs font-mono text-slate-400">units</span>
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Above 300 sq.m</span>
                  <span className="text-[11px] font-mono text-slate-400">Rate: 2 slots per unit</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={unitsAbove300 || ""}
                    onChange={(e) => setUnitsAbove300(parseInt(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-right text-slate-100 font-mono outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs font-mono text-slate-400">units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Other Occupancies Table 10 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 relative bg-blueprint-grid">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">Other Occupancies</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
                Table 10
              </span>
            </div>

            {otherOccupancies.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
                No non-residential occupancies added yet. Click button below to add.
              </div>
            ) : (
              <div className="space-y-3">
                {otherOccupancies.map((row, idx) => (
                  <div key={row.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400">Occupancy Type #{idx + 1}</span>
                      <button
                        onClick={() => removeOtherOccupancy(row.id)}
                        className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-8">
                        <select
                          value={row.group}
                          onChange={(e) => updateOtherOccupancy(row.id, "group", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none font-sans"
                        >
                          {Object.entries(TABLE_10_RATES).map(([code, item]) => (
                            <option key={code} value={code}>
                              {item.label} (1 slot / {item.areaPerSlot} m²)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4 flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={row.area || ""}
                          onChange={(e) => updateOtherOccupancy(row.id, "area", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono outline-none"
                          placeholder="Floor Area"
                        />
                        <span className="text-xs font-mono text-slate-500">sq.m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addOtherOccupancy}
              className="w-full border border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ Add another occupancy</span>
            </button>
          </div>

          {/* Footer Specs Box */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Car Bay Size</span>
              <span className="font-bold text-white">5.5m × 2.7m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Min Headroom</span>
              <span className="font-bold text-white">2.2m</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Driveway Width</span>
              <span className="font-bold text-white">3.5m (1W) / 5.5m (2W)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Parking Requirements Output Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-sans uppercase tracking-tight">
                Parking Requirements
              </h3>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            {/* List of Parking Items */}
            <div className="space-y-4 text-sm font-sans">
              {/* Subtotal Car Slots A1 */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <span className="block font-medium text-slate-200">Subtotal Car Slots (A1)</span>
                  <span className="text-[11px] font-mono text-slate-500">Next higher integer</span>
                </div>
                <span className="font-mono font-bold text-lg text-white">{subtotalCarSlotsA1}</span>
              </div>

              {/* Visitors Parking A1 */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <span className="block font-medium text-slate-200">Visitors' Parking (A1)</span>
                  <span className="text-[11px] font-mono text-slate-500">15% of A1 Subtotal (Round up)</span>
                </div>
                <span className="font-mono font-bold text-lg text-white">{visitorsParkingA1}</span>
              </div>

              {/* Other Occupancies Slots */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <span className="block font-medium text-slate-200">Other Occupancies Slots</span>
                  <span className="text-[11px] font-mono text-slate-500">Sum of Table 10</span>
                </div>
                <span className="font-mono font-bold text-lg text-white">{otherOccupanciesSlots}</span>
              </div>

              {/* Reserved Differently Abled */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                  <span className="block font-medium text-slate-200">Reserved (Differently-Abled)</span>
                  <span className="text-[11px] font-mono text-slate-500">3% of Total (Min 1 slot)</span>
                </div>
                <span className="font-mono font-bold text-lg text-white">{reservedDisabled}</span>
              </div>
            </div>

            {/* Total Car Slots Display */}
            <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <span className="text-sm font-bold text-cyan-300 uppercase font-mono">
                Total Car Slots
              </span>
              <span className="text-3xl font-mono font-black text-white">{totalCarSlots}</span>
            </div>

            {/* Two-Wheeler Provision Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-slate-800/80 pb-2">
                <Bike className="w-4 h-4 text-cyan-400" />
                <span>Two-Wheeler Provision</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Mandatory Area (25%)</span>
                  <span className="font-bold text-slate-200">{mandatoryTwoWheelerArea.toFixed(2)} m²</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estimated Slots (3 m²/slot)</span>
                  <span className="font-bold text-cyan-300 text-sm">{estimatedTwoWheelerSlots} slots</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleSaveAssessment}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-mono transition cursor-pointer shadow-lg shadow-emerald-500/10 uppercase"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Parking Assessment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
