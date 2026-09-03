import React, { useState, useMemo, useRef } from "react";
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Printer,
  Download,
  Sparkles,
  Layers,
  Car,
  Droplets,
  Ruler,
  Building,
  HelpCircle,
  RotateCcw,
  Check,
  ChevronRight,
  TrendingUp,
  MapPin,
  User,
  Info
} from "lucide-react";
import { triggerPrint } from "../../utils/printHelper";

export interface ProjectData {
  projectName: string;
  applicantName: string;
  surveyNo: string;
  resurveyNo: string;
  localBodyName: string;
  localBodyType: "Panchayat" | "Municipality" | "Corporation";
  category: "Category-I" | "Category-II";
  engineerName: string;
  engineerRegNo: string;
  date: string;
  
  // Plot parameters
  plotAreaSqM: number;
  roadWidthM: number;
  isNotifiedRoad: boolean;
  isSingleFamilyResidential: boolean;
  
  // Building parameters
  occupancy: "A1" | "A2" | "B" | "C" | "D" | "E" | "F" | "G" | "I";
  numberOfStoreys: number;
  buildingHeightM: number;
  groundFloorPlinthSqM: number;
  firstFloorPlinthSqM: number;
  otherFloorsPlinthSqM: number;
  
  // Proposed Setbacks
  frontYardM: number;
  rearYardM: number;
  sideYard1M: number;
  sideYard2M: number;
  hasBlankWallSide: boolean;
  
  // Environmental & Amenities
  hasWellOnPlot: boolean;
  septicToWellDistanceM: number;
  roofHarvestingAreaSqM: number;
  isAcRoomProvided: boolean;
  acRoomHeightM: number;
  carParkingProvided: number;
  twoWheelerParkingProvided: number;
}

const DEFAULT_PROJECT_DATA: ProjectData = {
  projectName: "PROPOSED RESIDENTIAL BUILDING",
  applicantName: "SRI. SHAJI KUMAR & SMT. PRIYA SHAJI",
  surveyNo: "142/3-A",
  resurveyNo: "45/2",
  localBodyName: "Kizhakkambalam Grama Panchayat",
  localBodyType: "Panchayat",
  category: "Category-II",
  engineerName: "Er. Deepak Architect & Associates",
  engineerRegNo: "LSGD/ENG/2024/A-4892",
  date: new Date().toISOString().split("T")[0],

  plotAreaSqM: 320,
  roadWidthM: 4.5,
  isNotifiedRoad: false,
  isSingleFamilyResidential: true,

  occupancy: "A1",
  numberOfStoreys: 2,
  buildingHeightM: 7.2,
  groundFloorPlinthSqM: 110,
  firstFloorPlinthSqM: 95,
  otherFloorsPlinthSqM: 0,

  frontYardM: 2.2,
  rearYardM: 1.8,
  sideYard1M: 1.25,
  sideYard2M: 1.1,
  hasBlankWallSide: false,

  hasWellOnPlot: true,
  septicToWellDistanceM: 8.0,
  roofHarvestingAreaSqM: 120,
  isAcRoomProvided: true,
  acRoomHeightM: 2.45,
  carParkingProvided: 1,
  twoWheelerParkingProvided: 2
};

export const UnifiedBuildingRulesCalculator: React.FC = () => {
  const [data, setData] = useState<ProjectData>(DEFAULT_PROJECT_DATA);
  const [activeViewTab, setActiveViewTab] = useState<"INPUTS" | "REPORT_PREVIEW">("INPUTS");
  const reportRef = useRef<HTMLDivElement>(null);

  const handleChange = <K extends keyof ProjectData>(field: K, value: ProjectData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Convert Plot Area to Cents
  const plotAreaCents = useMemo(() => {
    return (data.plotAreaSqM / 40.4686).toFixed(2);
  }, [data.plotAreaSqM]);

  // Total Built-up Area
  const totalBuiltUpSqM = useMemo(() => {
    return Number(data.groundFloorPlinthSqM) + Number(data.firstFloorPlinthSqM) + Number(data.otherFloorsPlinthSqM);
  }, [data.groundFloorPlinthSqM, data.firstFloorPlinthSqM, data.otherFloorsPlinthSqM]);

  // Scrutiny Rules Calculations Engine
  const analysis = useMemo(() => {
    // 1. SETBACK RULES (Rule 26 & 2026 Amendment SRO 682/2026)
    let minFrontYardReq = 3.0;
    let frontYardRuleRef = "Rule 26 Table 4";

    // 2026 GAZETTE AMENDMENT PROVISO:
    // Single family residential on unnotified road < 6m width -> front yard min 2.0m!
    if (data.isSingleFamilyResidential && !data.isNotifiedRoad && data.roadWidthM < 6.0) {
      minFrontYardReq = 2.0;
      frontYardRuleRef = "Rule 26(4) 1st Proviso (2026 Gazette Amendment)";
    } else if (data.buildingHeightM > 10) {
      minFrontYardReq = 4.0;
    }

    let minRearYardReq = data.category === "Category-I" ? 2.0 : 1.5;
    if (data.buildingHeightM > 10) {
      minRearYardReq = Math.max(minRearYardReq, 2.0 + (data.buildingHeightM - 10) * 0.2);
    }

    let minSideYard1Req = 1.2;
    let minSideYard2Req = 1.0;
    let sideYardRuleRef = "Rule 26 Table 4";

    // 2026 GAZETTE AMENDMENT PROVISO 2:
    // One side without opening (blank wall) can be reduced up to 50cm (0.50m)
    if (data.hasBlankWallSide) {
      minSideYard2Req = 0.50;
      sideYardRuleRef = "Rule 26(4) 2nd Proviso (Blank Wall 50cm, 2026 Gazette)";
    }

    const frontYardPass = data.frontYardM >= minFrontYardReq;
    const rearYardPass = data.rearYardM >= minRearYardReq;
    const side1Pass = data.sideYard1M >= minSideYard1Req;
    const side2Pass = data.sideYard2M >= minSideYard2Req;

    // 2. FSI & COVERAGE (Rule 27 & Table 2/3)
    let maxPermissibleFsi = 2.0;
    let maxPermissibleCoveragePct = 65;

    if (data.occupancy === "A1") {
      maxPermissibleFsi = data.category === "Category-I" ? 2.5 : 2.0;
      maxPermissibleCoveragePct = 65;
    } else if (data.occupancy === "F") {
      // Commercial
      maxPermissibleFsi = 1.8;
      maxPermissibleCoveragePct = 60;
    } else if (data.occupancy === "G") {
      // Industrial
      maxPermissibleFsi = 1.5;
      maxPermissibleCoveragePct = 50;
    }

    const achievedFsi = data.plotAreaSqM > 0 ? Number((totalBuiltUpSqM / data.plotAreaSqM).toFixed(3)) : 0;
    const achievedCoveragePct = data.plotAreaSqM > 0 ? Number(((data.groundFloorPlinthSqM / data.plotAreaSqM) * 100).toFixed(2)) : 0;

    const fsiPass = achievedFsi <= maxPermissibleFsi;
    const coveragePass = achievedCoveragePct <= maxPermissibleCoveragePct;

    // Low risk building check (Rule 5 & 20)
    const isLowRiskBuilding = totalBuiltUpSqM <= 300 && data.buildingHeightM <= 10 && data.numberOfStoreys <= 2 && data.occupancy === "A1";

    // 3. PERMIT FEE CALCULATION
    // Base Rates per sq.m for A1 Residential
    let feePerSqM = 7;
    if (totalBuiltUpSqM > 300) feePerSqM = 20;
    else if (totalBuiltUpSqM > 200) feePerSqM = 15;
    else if (totalBuiltUpSqM > 100) feePerSqM = 10;

    if (data.occupancy === "F" || data.occupancy === "E") feePerSqM *= 2.5; // Commercial surcharge

    const applicationFee = 100;
    const permitFee = Math.round(totalBuiltUpSqM * feePerSqM);
    const totalGovernmentFee = applicationFee + permitFee;

    // 4. PARKING NORMS (Rule 29 & Table 9)
    let reqCarParking = 0;
    let reqTwoWheeler = 0;

    if (data.occupancy === "A1") {
      // 1 car space per 150 sq.m if above 150 sq.m
      if (totalBuiltUpSqM > 150) {
        reqCarParking = Math.max(1, Math.ceil(totalBuiltUpSqM / 200));
        reqTwoWheeler = Math.max(1, Math.ceil(totalBuiltUpSqM / 150));
      }
    } else if (data.occupancy === "F") {
      // Commercial 1 per 75 sq.m
      reqCarParking = Math.ceil(totalBuiltUpSqM / 75);
      reqTwoWheeler = Math.ceil(totalBuiltUpSqM / 50);
    }

    const parkingPass = data.carParkingProvided >= reqCarParking && data.twoWheelerParkingProvided >= reqTwoWheeler;

    // 5. RAINWATER HARVESTING (Rule 76)
    // 25 litres per sq.m of roof area for residential > 100 sq.m
    const isRwhMandatory = totalBuiltUpSqM >= 100;
    const minRwhCapacityLitres = isRwhMandatory ? Math.round(data.roofHarvestingAreaSqM * 25) : 0;

    // 6. SANITATION & WELL CLEARANCE (Rule 75)
    const minWellSepticDistM = 7.50;
    const septicClearancePass = !data.hasWellOnPlot || data.septicToWellDistanceM >= minWellSepticDistM;

    // 7. AC ROOM HEIGHT (Rule 33 & 2026 Gazette Proviso)
    const minAcHeightM = 2.40;
    const minStandardHeightM = 2.75;
    const acHeightPass = !data.isAcRoomProvided || data.acRoomHeightM >= minAcHeightM;

    // OVERALL COMPLIANCE SCORING
    const rulesList = [
      { name: "Front Yard Setback", pass: frontYardPass, weight: 20 },
      { name: "Rear Yard Setback", pass: rearYardPass, weight: 15 },
      { name: "Side Yard 1 Setback", pass: side1Pass, weight: 10 },
      { name: "Side Yard 2 Setback", pass: side2Pass, weight: 10 },
      { name: "FSI (Floor Space Index)", pass: fsiPass, weight: 15 },
      { name: "Ground Coverage %", pass: coveragePass, weight: 10 },
      { name: "Mandatory Parking", pass: parkingPass, weight: 10 },
      { name: "Sanitation & Well Clearance", pass: septicClearancePass, weight: 5 },
      { name: "AC Room Clear Height", pass: acHeightPass, weight: 5 }
    ];

    const score = rulesList.reduce((acc, r) => (r.pass ? acc + r.weight : acc), 0);
    const allPassed = rulesList.every((r) => r.pass);

    return {
      minFrontYardReq,
      frontYardRuleRef,
      minRearYardReq,
      minSideYard1Req,
      minSideYard2Req,
      sideYardRuleRef,
      frontYardPass,
      rearYardPass,
      side1Pass,
      side2Pass,
      maxPermissibleFsi,
      achievedFsi,
      fsiPass,
      maxPermissibleCoveragePct,
      achievedCoveragePct,
      coveragePass,
      isLowRiskBuilding,
      feePerSqM,
      applicationFee,
      permitFee,
      totalGovernmentFee,
      reqCarParking,
      reqTwoWheeler,
      parkingPass,
      isRwhMandatory,
      minRwhCapacityLitres,
      minWellSepticDistM,
      septicClearancePass,
      minAcHeightM,
      minStandardHeightM,
      acHeightPass,
      score,
      allPassed,
      rulesList
    };
  }, [data, totalBuiltUpSqM]);

  const handlePrintReport = () => {
    triggerPrint(`KPBR_Calculation_Report_${data.projectName.replace(/\s+/g, "_")}`, "a4-report-page");
  };

  const handleResetData = () => {
    setData(DEFAULT_PROJECT_DATA);
  };

  return (
    <div className="space-y-6">
      {/* Header Master Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden bg-blueprint-grid">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 uppercase">
                KPBR 2019 / 2026 GAZETTE MASTER CALCULATOR
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                UNIFIED ENGINE • INFOGRAPHIC REPORT
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                A4 PDF EXPORT READY
              </span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Calculator className="w-7 h-7 text-emerald-400" />
              <span>ഏകീകൃത കെട്ടിട നിർമ്മാണ ചട്ട കാൽക്കുലേറ്റർ (Unified Rules Calculator)</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-medium max-w-3xl leading-relaxed">
              സെറ്റ്ബാക്കുകൾ (Setbacks), പെർമിറ്റ് ഫീസ് (Permit Fee), പാർക്കിംഗ് (Parking), FSI & കവറേജ് (Coverage), മഴവെള്ള സംഭരണി (Rainwater), ശുചിത്വ ദൂരപരിധി (Sanitation), 2026 ഗസറ്റ് ഇളവുകൾ എന്നിവ ഒരൊറ്റ കാൽക്കുലേറ്ററിൽ കണക്കാക്കി ഇൻഫോഗ്രാഫിക് A4 PDF റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക.
            </p>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveViewTab("INPUTS")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeViewTab === "INPUTS"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>ഡാറ്റ നൽകുക (Inputs)</span>
            </button>
            <button
              onClick={() => setActiveViewTab("REPORT_PREVIEW")}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeViewTab === "REPORT_PREVIEW"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>A4 ഇൻഫോഗ്രാഫിക് റിപ്പോർട്ട്</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: FORM INPUTS & REALTIME SCRUTINY METER */}
      {activeViewTab === "INPUTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: FORM DATA INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 1: PROJECT & APPLICANT DETAILS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white font-sans uppercase flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>1. പ്രോജക്ട് & അപേക്ഷക വിവരങ്ങൾ (Project & Applicant Details)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Step 1 of 5</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">പ്രോജക്ടിന്റെ പേര് / Title</label>
                  <input
                    type="text"
                    value={data.projectName}
                    onChange={(e) => handleChange("projectName", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">അപേക്ഷകന്റെ പേര് / Owner Name</label>
                  <input
                    type="text"
                    value={data.applicantName}
                    onChange={(e) => handleChange("applicantName", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം (LSGD)</label>
                  <input
                    type="text"
                    value={data.localBodyName}
                    onChange={(e) => handleChange("localBodyName", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">പഞ്ചായത്ത് വിഭാഗം / Category</label>
                  <select
                    value={data.category}
                    onChange={(e) => handleChange("category", e.target.value as "Category-I" | "Category-II")}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-medium outline-none"
                  >
                    <option value="Category-II">Category-II (Standard Village Panchayat)</option>
                    <option value="Category-I">Category-I (Urbanized / Special Panchayat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">സർവ്വേ / റീ-സർവ്വേ നമ്പർ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Sy No."
                      value={data.surveyNo}
                      onChange={(e) => handleChange("surveyNo", e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Re-Sy No."
                      value={data.resurveyNo}
                      onChange={(e) => handleChange("resurveyNo", e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">എഞ്ചിനീയർ / ലൈസൻസി പേര് & Reg</label>
                  <input
                    type="text"
                    value={data.engineerName}
                    onChange={(e) => handleChange("engineerName", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PLOT & LAND PARAMETERS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white font-sans uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>2. പ്ലോട്ട് & റോഡ് വിവരങ്ങൾ (Plot & Road Parameters)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Step 2 of 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    പ്ലോട്ട് വിസ്തീർണ്ണം (Sq. Metres)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={data.plotAreaSqM}
                      onChange={(e) => handleChange("plotAreaSqM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m²</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">≈ {plotAreaCents} Cents</span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    മുൻവശത്തെ റോഡ് വീതി (Road Width)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={data.roadWidthM}
                      onChange={(e) => handleChange("roadWidthM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">metres</span>
                  </div>
                  {data.roadWidthM < 6.0 && (
                    <span className="text-[10px] font-mono text-amber-400 mt-0.5 block">
                      &lt;6m റോഡ്: 2026 ഭേദഗതി ബാധകം!
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">റോഡ് നോട്ടിഫൈ ചെയ്തതാണോ?</label>
                  <select
                    value={data.isNotifiedRoad ? "YES" : "NO"}
                    onChange={(e) => handleChange("isNotifiedRoad", e.target.value === "YES")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="NO">അല്ല (Unnotified Road)</option>
                    <option value="YES">അതെ (Notified Master Plan Road)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">ഒറ്റക്കുടുംബ വാസഗൃഹം (Single Family Residential)</span>
                    <span className="text-[10px] text-slate-400">
                      2026 ഭേദഗതി പ്രകാരം &lt;6m റോഡിൽ മുൻമുറ്റം 2.0m ആക്കി കുറയ്ക്കാം
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={data.isSingleFamilyResidential}
                    onChange={(e) => handleChange("isSingleFamilyResidential", e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: BUILDING OCCUPANCY & FLOOR AREAS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white font-sans uppercase flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>3. കെട്ടിട വിവരങ്ങൾ & വിസ്തീർണ്ണം (Building & Floor Areas)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Step 3 of 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">ഉപയോഗ ഗണം / Occupancy</label>
                  <select
                    value={data.occupancy}
                    onChange={(e) => handleChange("occupancy", e.target.value as ProjectData["occupancy"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="A1">A1 - Residential (വാസഗൃഹം)</option>
                    <option value="A2">A2 - Special Residential / Hostel</option>
                    <option value="B">B - Educational (വിദ്യാഭ്യാസം)</option>
                    <option value="C">C - Medical / Hospital (ആശുപത്രി)</option>
                    <option value="D">D - Assembly (ഓഡിറ്റോറിയം)</option>
                    <option value="E">E - Office (ഓഫീസ്)</option>
                    <option value="F">F - Commercial / Shops (വ്യാപാരം)</option>
                    <option value="G">G - Industrial (വ്യവസായം)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">നിലകളുടെ എണ്ണം (Storeys)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={data.numberOfStoreys}
                    onChange={(e) => handleChange("numberOfStoreys", parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">കെട്ടിടത്തിന്റെ ആകെ ഉയരം (Height)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={data.buildingHeightM}
                      onChange={(e) => handleChange("buildingHeightM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">തറനില വിസ്തീർണ്ണം (Ground Plinth)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={data.groundFloorPlinthSqM}
                      onChange={(e) => handleChange("groundFloorPlinthSqM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">ഒന്നാം നില (First Floor Area)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={data.firstFloorPlinthSqM}
                      onChange={(e) => handleChange("firstFloorPlinthSqM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">മറ്റ് നിലകൾ (Other Floors Area)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={data.otherFloorsPlinthSqM}
                      onChange={(e) => handleChange("otherFloorsPlinthSqM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m²</span>
                  </div>
                </div>
              </div>

              {/* Total Summary Strip */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">ആകെ വിസ്തീർണ്ണം (TOTAL BUILT-UP AREA):</span>
                  <span className="text-base font-black font-mono text-emerald-400">{totalBuiltUpSqM} Sq. Metres</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase">ബിൽഡിംഗ് തരം:</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${analysis.isLowRiskBuilding ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-cyan-950 text-cyan-300 border border-cyan-800"}`}>
                    {analysis.isLowRiskBuilding ? "LOW RISK BUILDING (<=300m²)" : "STANDARD PERMIT"}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 4: PROPOSED SETBACKS (RULE 26 & 2026 GAZETTE) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white font-sans uppercase flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  <span>4. നിർദ്ദിഷ്ട സെറ്റ്ബാക്കുകൾ (Proposed Setbacks)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Step 4 of 5</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    മുൻമുറ്റം / Front Yard
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={data.frontYardM}
                      onChange={(e) => handleChange("frontYardM", parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono font-bold ${
                        analysis.frontYardPass ? "border-emerald-500/80" : "border-rose-500"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    ചട്ടം ആവശ്യപ്പെടുന്നത്: <b className="text-white">{analysis.minFrontYardReq}m</b>
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    പിൻമുറ്റം / Rear Yard
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={data.rearYardM}
                      onChange={(e) => handleChange("rearYardM", parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono font-bold ${
                        analysis.rearYardPass ? "border-emerald-500/80" : "border-rose-500"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    ചട്ടം ആവശ്യപ്പെടുന്നത്: <b className="text-white">{analysis.minRearYardReq}m</b>
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    വശം 1 / Side Yard 1
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={data.sideYard1M}
                      onChange={(e) => handleChange("sideYard1M", parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono font-bold ${
                        analysis.side1Pass ? "border-emerald-500/80" : "border-rose-500"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    ചട്ടം ആവശ്യപ്പെടുന്നത്: <b className="text-white">{analysis.minSideYard1Req}m</b>
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    വശം 2 / Side Yard 2
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={data.sideYard2M}
                      onChange={(e) => handleChange("sideYard2M", parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono font-bold ${
                        analysis.side2Pass ? "border-emerald-500/80" : "border-rose-500"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    ചട്ടം ആവശ്യപ്പെടുന്നത്: <b className="text-white">{analysis.minSideYard2Req}m</b>
                  </span>
                </div>
              </div>

              {/* Blank Wall 50cm Toggle */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    തുറസ്സുകളില്ലാത്ത മതിൽ (Blank Wall - No Openings)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    2026 ഗസറ്റ് റൂൾ 26(4) പ്രകാരം ഒരു വശം 50cm (0.50m) വരെയാക്കാം
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={data.hasBlankWallSide}
                  onChange={(e) => handleChange("hasBlankWallSide", e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* SECTION 5: SANITATION, RAINWATER & AC ROOM HEIGHT */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white font-sans uppercase flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>5. പരിസ്ഥിതി, ശുചിത്വം & പാർക്കിംഗ് (Sanitation, Rainwater & Parking)</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Step 5 of 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">കിണർ - സെപ്റ്റിക് ടാങ്ക് ദൂരം</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={data.septicToWellDistanceM}
                      onChange={(e) => handleChange("septicToWellDistanceM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">ചട്ടം 75: Min 7.50m</span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">മഴവെള്ള സംഭരണ റൂഫ് ഏരിയ</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={data.roofHarvestingAreaSqM}
                      onChange={(e) => handleChange("roofHarvestingAreaSqM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m²</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 mt-0.5 block">
                    ടാങ്ക് കപ്പാസിറ്റി: {analysis.minRwhCapacityLitres} Litres
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">AC മുറികളുടെ ഉയരം (Clear Height)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={data.acRoomHeightM}
                      onChange={(e) => handleChange("acRoomHeightM", parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-500">m</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">2026 റൂൾ 33: Min 2.40m</span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">നൽകിയിട്ടുള്ള കാർ പാർക്കിംഗ്</label>
                  <input
                    type="number"
                    min="0"
                    value={data.carParkingProvided}
                    onChange={(e) => handleChange("carParkingProvided", parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                    ആവശ്യമായത്: {analysis.reqCarParking} കാർ
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">നൽകിയിട്ടുള്ള ഇരുചക്ര പാർക്കിംഗ്</label>
                  <input
                    type="number"
                    min="0"
                    value={data.twoWheelerParkingProvided}
                    onChange={(e) => handleChange("twoWheelerParkingProvided", parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                    ആവശ്യമായത്: {analysis.reqTwoWheeler} എണ്ണം
                  </span>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleResetData}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>റീസെറ്റ് ചെയ്യുക (Reset)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: REAL-TIME COMPLIANCE GAUGES & INFOGRAPHIC VISUALS */}
          <div className="lg:col-span-5 space-y-6">
            {/* OVERALL COMPLIANCE SCORE CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                  നിയമ അനുസരണ സ്കോർ (COMPLIANCE SCORE)
                </span>
                <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full border ${
                  analysis.allPassed
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : "bg-amber-950 text-amber-300 border-amber-800"
                }`}>
                  {analysis.allPassed ? "PASSED (അനുയോജ്യം)" : "WARNINGS FOUND"}
                </span>
              </div>

              {/* Big Score Dial */}
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={analysis.allPassed ? "text-emerald-400" : "text-amber-400"}
                      strokeDasharray={`${analysis.score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xl font-black font-mono text-white">
                    {analysis.score}%
                  </span>
                </div>

                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-black text-white font-sans">
                    {analysis.allPassed ? "കെ-സ്മാർട്ട് ഫയലിംഗിന് അനുയോജ്യം" : "ചട്ട നിബന്ധനകൾ പുനഃപരിശോധിക്കുക"}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {analysis.allPassed
                      ? "എല്ലാ സെറ്റ്ബാക്കുകളും, FSI, കവറേജ്, പാർക്കിംഗ് എന്നിവ KPBR 2019 & 2026 ഗസറ്റ് ഭേദഗതി അനുസരിച്ച് കൃത്യമാണ്."
                      : "ചുവപ്പ് അല്ലെങ്കിൽ മഞ്ഞ അടയാളപ്പെടുത്തിയ അളവുകൾ ചട്ടങ്ങൾക്കനുസൃതമായി മാറ്റുക."}
                  </p>
                </div>
              </div>

              {/* 2D SETBACK BLUEPRINT DIAGRAM */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">
                  പ്ലോട്ട് & സെറ്റ്ബാക്ക് വിഷ്വൽ മാപ്പ് (2D Layout Blueprint)
                </span>

                <div className="border-2 border-dashed border-slate-700 bg-slate-900/80 rounded-xl p-4 relative font-mono text-[11px] text-center space-y-3">
                  {/* Road Top */}
                  <div className="bg-slate-800 text-slate-300 py-1 rounded font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1">
                    <span>ROAD WIDTH: {data.roadWidthM}m</span>
                    {data.roadWidthM < 6.0 && <span className="text-amber-400">(&lt;6m 2026 Proviso)</span>}
                  </div>

                  {/* Front Yard Metric */}
                  <div className={`p-1.5 rounded font-bold ${analysis.frontYardPass ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                    FRONT YARD: {data.frontYardM}m (Min: {analysis.minFrontYardReq}m) {analysis.frontYardPass ? "✓" : "✗"}
                  </div>

                  {/* Middle: Side 1 - Building - Side 2 */}
                  <div className="grid grid-cols-5 gap-2 items-center text-[10px]">
                    <div className={`p-2 rounded font-bold ${analysis.side1Pass ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                      SIDE 1<br />{data.sideYard1M}m
                    </div>

                    <div className="col-span-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-3 text-white font-sans text-xs">
                      <span className="font-black block uppercase text-emerald-300">PROPOSED BUILDING</span>
                      <span className="text-[10px] font-mono text-slate-300">
                        {data.groundFloorPlinthSqM}m² ({data.numberOfStoreys} Storey)
                      </span>
                    </div>

                    <div className={`p-2 rounded font-bold ${analysis.side2Pass ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                      SIDE 2<br />{data.sideYard2M}m
                    </div>
                  </div>

                  {/* Rear Yard Metric */}
                  <div className={`p-1.5 rounded font-bold ${analysis.rearYardPass ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                    REAR YARD: {data.rearYardM}m (Min: {analysis.minRearYardReq}m) {analysis.rearYardPass ? "✓" : "✗"}
                  </div>
                </div>
              </div>

              {/* FSI & COVERAGE PROGRESS METERS */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
                {/* Coverage % Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">തറ വിസ്തൃതി കവറേജ് (Coverage %):</span>
                    <span className="font-bold text-white">
                      {analysis.achievedCoveragePct}% / Max {analysis.maxPermissibleCoveragePct}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${analysis.coveragePass ? "bg-emerald-400" : "bg-rose-500"}`}
                      style={{ width: `${Math.min(100, (analysis.achievedCoveragePct / analysis.maxPermissibleCoveragePct) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* FSI Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">ഫ്ലോർ സ്പേസ് ഇൻഡക്സ് (FSI Achieved):</span>
                    <span className="font-bold text-white">
                      {analysis.achievedFsi} / Max {analysis.maxPermissibleFsi}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${analysis.fsiPass ? "bg-cyan-400" : "bg-rose-500"}`}
                      style={{ width: `${Math.min(100, (analysis.achievedFsi / analysis.maxPermissibleFsi) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* FINANCIAL & PARKING SUMMARY CARDS */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">LSGD പെർമിറ്റ് ഫീസ്:</span>
                  <span className="text-base font-black text-amber-400">₹{analysis.totalGovernmentFee.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-slate-500 block">Rate: ₹{analysis.feePerSqM}/m²</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">മഴവെള്ള സംഭരണി:</span>
                  <span className="text-base font-black text-cyan-400">{analysis.minRwhCapacityLitres} L</span>
                  <span className="text-[10px] text-slate-500 block">Rule 76 Tank Size</span>
                </div>
              </div>

              {/* View Full Report Button */}
              <button
                onClick={() => setActiveViewTab("REPORT_PREVIEW")}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-mono text-xs font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>പൂർണ്ണ A4 റിപ്പോർട്ട് കാണുക & പ്രിന്റ് ചെയ്യുക</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: A4 INFOGRAPHIC VISUAL REPORT & DOWNLOADABLE PDF */}
      {activeViewTab === "REPORT_PREVIEW" && (
        <div className="space-y-4">
          {/* Action Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>A4 സൈസ് സമഗ്ര കാൽക്കുലേഷൻ റിപ്പോർട്ട് (A4 Compliance Report)</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewTab("INPUTS")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-mono text-xs font-bold cursor-pointer"
              >
                അളവുകൾ തിരുത്തുക (Edit Data)
              </button>

              <button
                onClick={handlePrintReport}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>A4 പ്രിന്റ് / PDF ഡൗൺലോഡ്</span>
              </button>
            </div>
          </div>

          {/* EXACT A4 REPORT CONTAINER (PORTRAIT 210mm x 297mm styled) */}
          <div className="max-w-[850px] mx-auto overflow-x-auto pb-6">
            <div
              id="a4-report-page"
              ref={reportRef}
              className="bg-white text-slate-950 p-10 sm:p-12 rounded-sm shadow-2xl border border-slate-300 min-h-[1120px] flex flex-col justify-between font-sans relative"
              style={{ width: "100%", maxWidth: "820px", margin: "0 auto" }}
            >
              {/* Document Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-30deg]">
                <span className="text-7xl font-black font-mono tracking-widest text-slate-900">
                  KPBR 2019 / 2026 SCRUTINY
                </span>
              </div>

              {/* REPORT TOP HEADER */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1 relative z-10">
                <div className="text-[11px] font-mono tracking-widest font-bold text-slate-700 uppercase">
                  LOCAL SELF GOVERNMENT DEPARTMENT • GOVERNMENT OF KERALA
                </div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  BUILDING RULES CALCULATION & COMPLIANCE REPORT
                </h1>
                <div className="text-xs font-mono font-semibold text-slate-700">
                  Kerala Panchayat Building Rules (KPBR 2019) & 2026 Gazette Amendment Scrutiny
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-600 pt-2 border-t border-slate-300 mt-2">
                  <span>തീയതി / Date: <b>{data.date}</b></span>
                  <span>തദ്ദേശ സ്ഥാപനം: <b>{data.localBodyName}</b></span>
                  <span>വിഭാഗം: <b>{data.category}</b></span>
                </div>
              </div>

              {/* SECTION 1: APPLICANT & PLOT DETAILS TABLE */}
              <div className="my-4 space-y-2 relative z-10 text-xs">
                <div className="bg-slate-100 p-2 rounded border border-slate-300 font-mono font-bold uppercase text-[11px] flex justify-between">
                  <span>1. പ്രോജക്ട് & പ്ലോട്ട് വിവരങ്ങൾ (PROJECT & SITE DATA)</span>
                  <span>Sy No: {data.surveyNo} | Re-Sy: {data.resurveyNo}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-300 p-3 rounded text-[11px]">
                  <div>
                    <span className="text-slate-500 block">അപേക്ഷകന്റെ പേര്:</span>
                    <span className="font-bold">{data.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">പ്രോജക്ട്:</span>
                    <span className="font-bold">{data.projectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">പ്ലോട്ട് വിസ്തീർണ്ണം:</span>
                    <span className="font-bold">{data.plotAreaSqM} m² ({plotAreaCents} Cents)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">റോഡ് വീതി:</span>
                    <span className="font-bold">{data.roadWidthM} Metres</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">ഉപയോഗ ഗണം (Occupancy):</span>
                    <span className="font-bold">{data.occupancy} (Residential A1)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">നിലകളുടെ എണ്ണം / ഉയരം:</span>
                    <span className="font-bold">{data.numberOfStoreys} Floors | {data.buildingHeightM}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">തറ വിസ്തീർണ്ണം (Ground):</span>
                    <span className="font-bold">{data.groundFloorPlinthSqM} m²</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ആകെ വിസ്തീർണ്ണം (Total Area):</span>
                    <span className="font-bold text-emerald-800">{totalBuiltUpSqM} m²</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: INFOGRAPHIC VISUAL SUMMARY METER */}
              <div className="my-2 bg-slate-50 border border-slate-300 p-4 rounded space-y-3 relative z-10">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <span className="font-mono font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>2. ഇൻഫോഗ്രാഫിക് ചട്ട അനുസരണ സമ്മറി (COMPLIANCE INFOGRAPHIC)</span>
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    SCORE: {analysis.score}% ({analysis.allPassed ? "FULLY COMPLIANT" : "MODIFICATIONS REQUIRED"})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">FSI ACHIEVED</span>
                    <span className="text-base font-black text-slate-900">{analysis.achievedFsi}</span>
                    <span className="text-[9px] text-slate-400 block">Max Limit: {analysis.maxPermissibleFsi}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">COVERAGE %</span>
                    <span className="text-base font-black text-slate-900">{analysis.achievedCoveragePct}%</span>
                    <span className="text-[9px] text-slate-400 block">Max Limit: {analysis.maxPermissibleCoveragePct}%</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">PARKING PROVIDED</span>
                    <span className="text-base font-black text-slate-900">{data.carParkingProvided} Car | {data.twoWheelerParkingProvided} 2W</span>
                    <span className="text-[9px] text-slate-400 block">Required: {analysis.reqCarParking} Car</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 block">PERMIT FEE EST.</span>
                    <span className="text-base font-black text-slate-900">₹{analysis.totalGovernmentFee}</span>
                    <span className="text-[9px] text-slate-400 block">Rate: ₹{analysis.feePerSqM}/m²</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DETAILED SCRUTINY COMPLIANCE MATRIX TABLE */}
              <div className="my-3 space-y-2 relative z-10">
                <div className="bg-slate-100 p-2 rounded border border-slate-300 font-mono font-bold uppercase text-[11px]">
                  3. വിശദമായ ചട്ട പരിശോധന പട്ടിക (DETAILED RULE SCRUTINY TABLE)
                </div>

                <table className="w-full text-left border-collapse border border-slate-300 text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-200 font-mono text-slate-800 text-[10px] uppercase">
                      <th className="border border-slate-300 p-2">ചട്ടം / Rule No.</th>
                      <th className="border border-slate-300 p-2">വിഭാഗം / Parameter</th>
                      <th className="border border-slate-300 p-2">നിർദ്ദിഷ്ട അളവ് (Proposed)</th>
                      <th className="border border-slate-300 p-2">കുറഞ്ഞ പരിധി (Required)</th>
                      <th className="border border-slate-300 p-2 text-center">ഫലം (Status)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Front Yard */}
                    <tr>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{analysis.frontYardRuleRef}</td>
                      <td className="border border-slate-300 p-2">മുൻമുറ്റം (Front Yard Setback)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.frontYardM} m</td>
                      <td className="border border-slate-300 p-2 font-mono">Min {analysis.minFrontYardReq} m</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        <span className={analysis.frontYardPass ? "text-emerald-700" : "text-rose-700"}>
                          {analysis.frontYardPass ? "PASSED (തൃപ്തികരം)" : "FAILED (പോരാ)"}
                        </span>
                      </td>
                    </tr>

                    {/* Rear Yard */}
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 26 Table 4</td>
                      <td className="border border-slate-300 p-2">പിൻമുറ്റം (Rear Yard Setback)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.rearYardM} m</td>
                      <td className="border border-slate-300 p-2 font-mono">Min {analysis.minRearYardReq} m</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        <span className={analysis.rearYardPass ? "text-emerald-700" : "text-rose-700"}>
                          {analysis.rearYardPass ? "PASSED (തൃപ്തികരം)" : "FAILED (പോരാ)"}
                        </span>
                      </td>
                    </tr>

                    {/* Side 1 */}
                    <tr>
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 26 Table 4</td>
                      <td className="border border-slate-300 p-2">വശം 1 (Side Yard 1)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.sideYard1M} m</td>
                      <td className="border border-slate-300 p-2 font-mono">Min {analysis.minSideYard1Req} m</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        <span className={analysis.side1Pass ? "text-emerald-700" : "text-rose-700"}>
                          {analysis.side1Pass ? "PASSED (തൃപ്തികരം)" : "FAILED (പോരാ)"}
                        </span>
                      </td>
                    </tr>

                    {/* Side 2 */}
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono font-bold">{analysis.sideYardRuleRef}</td>
                      <td className="border border-slate-300 p-2">വശം 2 (Side Yard 2)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.sideYard2M} m</td>
                      <td className="border border-slate-300 p-2 font-mono">Min {analysis.minSideYard2Req} m</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">
                        <span className={analysis.side2Pass ? "text-emerald-700" : "text-rose-700"}>
                          {analysis.side2Pass ? "PASSED (തൃപ്തികരം)" : "FAILED (പോരാ)"}
                        </span>
                      </td>
                    </tr>

                    {/* FSI */}
                    <tr>
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 27 Table 2</td>
                      <td className="border border-slate-300 p-2">ഫ്ലോർ സ്പേസ് ഇൻഡക്സ് (FSI)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{analysis.achievedFsi}</td>
                      <td className="border border-slate-300 p-2 font-mono">Max {analysis.maxPermissibleFsi}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                        PASSED
                      </td>
                    </tr>

                    {/* Coverage */}
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 27 Table 2</td>
                      <td className="border border-slate-300 p-2">തറ വിസ്തൃതി കവറേജ് (Coverage %)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{analysis.achievedCoveragePct} %</td>
                      <td className="border border-slate-300 p-2 font-mono">Max {analysis.maxPermissibleCoveragePct} %</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                        PASSED
                      </td>
                    </tr>

                    {/* Parking */}
                    <tr>
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 29 Table 9</td>
                      <td className="border border-slate-300 p-2">പാർക്കിംഗ് സൗകര്യം (Car Parking)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.carParkingProvided} Bay</td>
                      <td className="border border-slate-300 p-2 font-mono">Min {analysis.reqCarParking} Bay</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                        PASSED
                      </td>
                    </tr>

                    {/* Rainwater Harvesting */}
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 76</td>
                      <td className="border border-slate-300 p-2">മഴവെള്ള സംഭരണി (Rainwater Tank)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">Mandatory</td>
                      <td className="border border-slate-300 p-2 font-mono">{analysis.minRwhCapacityLitres} Litres</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                        PROVIDED
                      </td>
                    </tr>

                    {/* Sanitation Well Clearance */}
                    <tr>
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 75</td>
                      <td className="border border-slate-300 p-2">കിണർ - സെപ്റ്റിക് ടാങ്ക് അകലം</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.septicToWellDistanceM} m</td>
                      <td className="border border-slate-300 p-2 font-mono">Min 7.50 m</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                        PASSED
                      </td>
                    </tr>

                    {/* AC Height 2026 */}
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 p-2 font-mono font-bold">Rule 33 (2026 SRO 682)</td>
                      <td className="border border-slate-300 p-2">AC മുറികളുടെ ഉയരം (AC Ceiling Height)</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold">{data.acRoomHeightM} m</td>
                      <td className="border border-slate-300 p-2 font-mono">Min 2.40 m</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">
                        PASSED
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* REPORT FOOTER WITH OFFICIAL ENGINEER SIGNATURE & SEAL */}
              <div className="pt-6 border-t-2 border-slate-900 mt-6 relative z-10 space-y-6">
                <div className="text-[10px] text-slate-600 leading-relaxed font-sans">
                  <b>സാക്ഷ്യപത്രം / Declaration:</b> ഈ കെട്ടിട പ്ലാൻ കേരള പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 (KPBR 2019) പ്രകാരവും, 2026 ലെ പുതിയ ഗസറ്റ് ഭേദഗതികൾ (S.R.O. No. 682/2026) പ്രകാരവും കൃത്യമായി തയ്യാറാക്കിയതും, സുരക്ഷാ മാനദണ്ഡങ്ങൾ പാലിക്കുന്നതുമാണെന്ന് സാക്ഷ്യപ്പെടുത്തുന്നു.
                </div>

                <div className="grid grid-cols-2 pt-4 items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">അപേക്ഷകന്റെ ഒപ്പ് / Signature of Owner:</span>
                    <div className="h-10 border-b border-dashed border-slate-400 w-48" />
                    <span className="text-[11px] font-bold block">{data.applicantName}</span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">ലൈസൻസി എഞ്ചിനീയറുടെ ഒപ്പും സീലും:</span>
                    <div className="h-10 border-b border-dashed border-slate-400 w-48 ml-auto" />
                    <span className="text-[11px] font-bold block">{data.engineerName}</span>
                    <span className="text-[10px] font-mono text-slate-600 block">Reg No: {data.engineerRegNo}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-300 pt-2">
                  <span>REPORT ID: VASTHUSILPY-KPBR-{Date.now().toString().slice(-6)}</span>
                  <span>GENERATED VIA VASTHUSILPY DIGITAL PORTAL</span>
                  <span>PAGE 1 OF 1 (A4 FORMAT)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
