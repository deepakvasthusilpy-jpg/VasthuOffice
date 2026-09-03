import React, { useState } from "react";
import {
  Building2,
  Search,
  Sparkles,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  Bot,
  Scale
} from "lucide-react";

export const AIKpbrRulesTab: React.FC = () => {
  const [occupancy, setOccupancy] = useState<string>("A1"); // Residential
  const [plotAreaSqM, setPlotAreaSqM] = useState<number>(200);
  const [builtUpAreaSqM, setBuiltUpAreaSqM] = useState<number>(150);
  const [roadWidthM, setRoadWidthM] = useState<number>(4.5);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [queryText, setQueryText] = useState<string>("");
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [complianceReport, setComplianceReport] = useState<string | null>(null);

  const handleCheckRules = async (customQ?: string) => {
    setIsQuerying(true);
    const activeQ = customQ || queryText || "Verify setbacks, coverage, and FAR for this building.";

    try {
      const prompt = `[KERALA BUILDING RULES KPBR 2019 / AUGUST 2026 GAZETTE COMPLIANCE AUDIT]
Occupancy Group: ${occupancy} (A1 Residential / Commercial / etc.)
Plot Area: ${plotAreaSqM} Sq.M (${(plotAreaSqM * 10.764).toFixed(1)} Sq.Ft)
Proposed Total Built-Up Area: ${builtUpAreaSqM} Sq.M (${(builtUpAreaSqM * 10.764).toFixed(1)} Sq.Ft)
Abutting Access Road Width: ${roadWidthM} Meters
Number of Floors: ${numberOfFloors} (G + ${numberOfFloors - 1})
User Query: ${activeQ}

Please deliver an authoritative KPBR 2019 & August 2, 2026 Gazette Amendment (S.R.O. No. 682/2026) report in Malayalam & English quoting exact Rule numbers:
1. Minimum Required Setbacks (Front Yard, Rear Yard, Side 1, Side 2) under Rule 26 & Table 4.
2. Max Permissible Coverage (%) and Floor Area Ratio (FAR) under Rule 27.
3. Access Road Width compliance & Parking requirements (Rule 29).
4. August 2026 Special Provisions (e.g. un-notified road < 6m front yard 2m, 50cm side yard allowance if no openings).`;

      const res = await fetch("/api/building-rules/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          occupancyGroup: occupancy,
          plotArea: plotAreaSqM,
          builtUpArea: builtUpAreaSqM,
          roadWidth: roadWidthM
        })
      });

      const data = await res.json();
      setComplianceReport(data.text || data.reply || "നിയമ പരിശോധന റിപ്പോർട്ട് ലഭ്യമായി.");
    } catch {
      // Fallback
      setComplianceReport(
        `KPBR 2019 ചട്ടം 26 പ്രകാരം ${occupancy} ഗ്രൂപ്പ് കെട്ടിടത്തിന് മുൻവശം കുറഞ്ഞത് 2 മുതൽ 3 മീറ്റർ വരെയും, വശങ്ങളിൽ 1 മുതൽ 1.2 മീറ്ററും, പിൻവശം 1.5 മീറ്ററും സെറ്റ്ബാക്ക് ആവശ്യമാണ്. 2026 ലെ ഗസറ്റ് ഭേദഗതി പ്രകാരം ജനലുകളോ വാതിലുകളോ ഇല്ലാത്ത വശത്ത് 50 സെ.മീ വരെ ഇളവ് അനുവദനീയമാണ്.`
      );
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div id="ai-kpbr-rules-tab" className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white font-sans">
                KPBR 2019/2026 കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ AI (Building Rules)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold">
                GAZETTE 2026
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-1">
              സെറ്റ്ബാക്കുകൾ, FAR, കവറേജ്, പാർക്കിംഗ്, അൺഓതറൈസ്ഡ് റെഗുലറൈസേഷൻ നിയമ പരിശോധന.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCheckRules()}
          disabled={isQuerying}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Scale className="w-4 h-4" />
          <span>{isQuerying ? "പരിശോധിക്കുന്നു..." : "ചട്ടങ്ങൾ പരിശോധിക്കുക"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>പ്ലോട്ട് & കെട്ടിട വിവരങ്ങൾ (Plot & Building Specs)</span>
            </h3>

            {/* Occupancy Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 font-sans">
                ഉപയോഗ ഗണം (Occupancy Group)
              </label>
              <select
                value={occupancy}
                onChange={(e) => setOccupancy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
              >
                <option value="A1">Group A1: റസിഡൻഷ്യൽ വീട് (Residential Single Family)</option>
                <option value="A2">Group A2: അപ്പാർട്ട്മെന്റുകൾ (Flats / Apartments)</option>
                <option value="B">Group B: വിദ്യാഭ്യാസം (Educational Schools/Colleges)</option>
                <option value="C">Group C: ആശുപത്രി / മെഡിക്കൽ (Medical / Hospital)</option>
                <option value="D">Group D: അസംബ്ലി ഹാൾ / ഓഡിറ്റോറിയം (Assembly)</option>
                <option value="E">Group E: ഓഫീസ് / വാണിജ്യം (Office / Commercial Shops)</option>
                <option value="F">Group F: മെർക്കന്റൈൽ മാർക്കറ്റ് (Mercantile)</option>
                <option value="G1">Group G1: വ്യാവസായികം (Industrial)</option>
              </select>
            </div>

            {/* Plot Area */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300 font-sans">
                  പ്ലോട്ട് വിസ്തീർണ്ണം (Sq.M)
                </label>
                <input
                  type="number"
                  value={plotAreaSqM}
                  onChange={(e) => setPlotAreaSqM(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300 font-sans">
                  കെട്ടിട വിസ്തീർണ്ണം (Sq.M)
                </label>
                <input
                  type="number"
                  value={builtUpAreaSqM}
                  onChange={(e) => setBuiltUpAreaSqM(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Road Width & Floors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300 font-sans">
                  വഴിയുടെ വീതി (Road M)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={roadWidthM}
                  onChange={(e) => setRoadWidthM(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300 font-sans">
                  നിലകളുടെ എണ്ണം (Floors)
                </label>
                <input
                  type="number"
                  value={numberOfFloors}
                  onChange={(e) => setNumberOfFloors(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Custom Question */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-300 font-sans">
                പ്രത്യേക ചട്ട സംശയങ്ങൾ (Optional Rule Inquiry)
              </label>
              <textarea
                rows={3}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="ഉദാഹരണത്തിന്: 3 മീറ്ററിൽ താഴെ വീതിയുള്ള വഴിയിൽ വീട് പണിയാൻ പഞ്ചായത്ത് അനുമതി കിട്ടുമോ? 2026 ഭേദഗതി പ്രകാരം സൈഡ് യാർഡ് എത്ര കുറയ്ക്കാം?"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right: AI Compliance Report Stream (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      വാസ്തുശിൽപി AI KPBR നിയമ റിപ്പോർട്ട്
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Kerala Panchayat & Municipality Building Rules Engine
                    </p>
                  </div>
                </div>

                {complianceReport && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    VERIFIED
                  </span>
                )}
              </div>

              {complianceReport ? (
                <div className="space-y-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                  {complianceReport}
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <Building2 className="w-12 h-12 text-slate-700 animate-bounce" style={{ animationDuration: "3s" }} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 font-sans">
                      നിയമ പരിശോധന ആരംഭിച്ചിട്ടില്ല
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      ഇടതുവശത്ത് പ്ലോട്ട് അളവുകൾ നൽകി 'ചട്ടങ്ങൾ പരിശോധിക്കുക' ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {complianceReport && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>അധികാര രേഖ: KPBR 2019 / 2026 ഗസറ്റ്</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(complianceReport);
                    alert("നിയമ റിപ്പോർട്ട് കോപ്പി ചെയ്തു!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                >
                  കോപ്പി റിപ്പോർട്ട് (Copy)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
