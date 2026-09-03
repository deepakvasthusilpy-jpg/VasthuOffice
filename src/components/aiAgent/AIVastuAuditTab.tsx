import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Droplets,
  Wind,
  Sun,
  Bot
} from "lucide-react";

export const AIVastuAuditTab: React.FC = () => {
  const [kol, setKol] = useState<number>(20);
  const [viral, setViral] = useState<number>(8);
  const [customRoomQuery, setCustomRoomQuery] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Vastu Calculation logic
  const calculateVastuDetails = (k: number, v: number) => {
    const totalVirals = k * 24 + v;
    const chuttuCm = totalVirals * 3;
    const chuttuFeet = (chuttuCm / 30.48).toFixed(2);
    const chuttuInches = (chuttuCm / 2.54).toFixed(1);

    // Yoni calculation: (Chuttu * 3) % 8
    const yoniIndex = ((chuttuCm * 3) % 8) || 8;
    const YONIS: Record<number, { name: string; nameMl: string; direction: string; result: "Utthamam" | "Adhamam" | "Madhyamam" }> = {
      1: { name: "Dhwajam", nameMl: "ധ്വജം (കിഴക്ക് - East)", direction: "East", result: "Utthamam" },
      2: { name: "Dhoomam", nameMl: "ധൂമം (തെക്ക്-കിഴക്ക് - SE)", direction: "South-East", result: "Adhamam" },
      3: { name: "Simham", nameMl: "സിംഹം (തെക്ക് - South)", direction: "South", result: "Utthamam" },
      4: { name: "Shwanam", nameMl: "ശ്വാനം (തെക്ക്-പടിഞ്ഞാറ് - SW)", direction: "South-West", result: "Adhamam" },
      5: { name: "Vrishabham", nameMl: "വൃഷഭം (പടിഞ്ഞാറ് - West)", direction: "West", result: "Utthamam" },
      6: { name: "Kharam", nameMl: "ഖരം (വടക്ക്-പടിഞ്ഞാറ് - NW)", direction: "North-West", result: "Adhamam" },
      7: { name: "Gajam", nameMl: "ഗജം (വടക്ക് - North)", direction: "North", result: "Utthamam" },
      8: { name: "Wayasam", nameMl: "വായസം (വടക്ക്-കിഴക്ക് - NE)", direction: "North-East", result: "Adhamam" }
    };

    const yoni = YONIS[yoniIndex] || YONIS[1];
    const vyayam = ((chuttuCm * 3) % 14) || 14;
    const aayam = ((chuttuCm * 8) % 12) || 12;
    const nakshatram = ((chuttuCm * 8) % 27) || 27;
    const vayassu = vyayam < aayam ? "ബാല്യം (ഉത്തമം - Auspicious)" : "വാർദ്ധക്യം (മധ്യമം - Moderate)";

    return {
      kol: k,
      viral: v,
      chuttuCm,
      chuttuFeet,
      chuttuInches,
      yoni,
      vyayam,
      aayam,
      nakshatram,
      vayassu,
      isUtthamam: yoni.result === "Utthamam" && aayam >= vyayam
    };
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    const mathResult = calculateVastuDetails(kol, viral);

    try {
      const prompt = `[VASTHU SHASTRA AUDIT QUERY]
Selected Measurement: ${kol} Kol ${viral} Viral (Perimeter Chuttu: ${mathResult.chuttuCm} cm / ${mathResult.chuttuFeet} ft).
Calculated Yoni: ${mathResult.yoni.nameMl}, Result: ${mathResult.yoni.result}, Aayam: ${mathResult.aayam}, Vyayam: ${mathResult.vyayam}, Vayassu: ${mathResult.vayassu}.
User Specific Room Query: ${customRoomQuery || "General residential house vastu and room orientation audit."}

Please provide an authoritative Vastu Shastra consultation report in Malayalam with:
1. Analysis of this Chuttu (ഉത്തമം ആണോ അതോ മാറ്റം വരുത്തണമോ?)
2. Ideal placements for Main Door (കട്ടിള), Kitchen (അടുക്കള/ആഗ്നേയം), Master Bedroom (കന്നിമൂല/തെക്ക് പടിഞ്ഞാറ്), Pooja Room (ഈശാനകോൺ), Well (കിണർ), Septic Tank (വായുകോൺ)
3. If this Chuttu needs refinement, suggest the nearest Utthamam Kol/Viral adjustments.`;

      const res = await fetch("/api/ai-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          currentMeasurement: {
            kol,
            viral,
            chuttuCm: mathResult.chuttuCm,
            chuttuFeetInches: `${mathResult.chuttuFeet} ft`,
            yoniName: mathResult.yoni.name,
            phalam: mathResult.yoni.result
          }
        })
      });

      const data = await res.json();
      setAuditResult({
        math: mathResult,
        aiReport: data.text || "ഓഡിറ്റ് റിപ്പോർട്ട് തയ്യാറാക്കി."
      });
    } catch {
      setAuditResult({
        math: mathResult,
        aiReport: `കണക്കുകൂട്ടൽ പ്രകാരം ഈ ചുറ്റളവ് (${kol} കോൽ ${viral} വിരൽ) ${mathResult.yoni.result === "Utthamam" ? "ഉത്തമമായ" : "അധമമായ"} ഫലം നൽകുന്നതാണ്. യോനി: ${mathResult.yoni.nameMl}. ആയം: ${mathResult.aayam}, വ്യയം: ${mathResult.vyayam}.`
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div id="ai-vastu-audit-tab" className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-800/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white font-sans">
                തച്ചു ശാസ്ത്ര & വാസ്തു AI ഓഡിറ്റ് (Vastu Shastra AI)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-mono font-bold">
                വേദിക് AI
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-1">
              മനുഷ്യാലയ ചന്ദ്രിക, വാസ്തുവിദ്യാ നിയമങ്ങൾ പ്രകാരമുള്ള ചുറ്റളവ്, യോനി, ആയാദി ഷഡ്വർഗ്ഗ പരിശോധന.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAuditing ? "പരിശോധിക്കുന്നു..." : "AI ഓഡിറ്റ് നടത്തുക"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Measurement Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>ചുറ്റളവ് നിശ്ചയിക്കുക (Set Kol & Viral)</span>
            </h3>

            {/* Kol Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-slate-300 font-sans">
                  കോൽ (Kol): <span className="text-cyan-400 font-mono font-bold text-sm">{kol} കോൽ</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">1 Kol = 72 cm</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={kol}
                onChange={(e) => setKol(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Kol</span>
                <span>25 Kol</span>
                <span>50 Kol</span>
              </div>
            </div>

            {/* Viral Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-medium text-slate-300 font-sans">
                  വിരൽ (Viral): <span className="text-cyan-400 font-mono font-bold text-sm">{viral} വിരൽ</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">1 Viral = 3 cm</span>
              </div>
              <input
                type="range"
                min={0}
                max={23}
                value={viral}
                onChange={(e) => setViral(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Viral</span>
                <span>12 Viral</span>
                <span>23 Viral</span>
              </div>
            </div>

            {/* Custom Room Query */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-300 font-sans">
                പ്രത്യേക മുറി / ദിശാ സംശയങ്ങൾ (Optional Room Query)
              </label>
              <textarea
                rows={3}
                value={customRoomQuery}
                onChange={(e) => setCustomRoomQuery(e.target.value)}
                placeholder="ഉദാഹരണത്തിന്: അടുക്കള കന്നിമൂലയിൽ വന്നാൽ എന്താണ് പരിഹാരം? കിണർ എവിടെ സ്ഥാപിക്കണം?"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans resize-none"
              />
            </div>

            {/* Instant Mathematical Snapshot */}
            {(() => {
              const snap = calculateVastuDetails(kol, viral);
              return (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ആകെ ചുറ്റളവ് (Perimeter):</span>
                    <span className="font-mono font-bold text-white">
                      {snap.chuttuCm} cm ({snap.chuttuFeet} ft)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">യോനി (Yoni):</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {snap.yoni.nameMl}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ഫലം (Phalam):</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                        snap.yoni.result === "Utthamam"
                          ? "bg-emerald-950 border border-emerald-700 text-emerald-400"
                          : "bg-rose-950 border border-rose-700 text-rose-400"
                      }`}
                    >
                      {snap.yoni.result === "Utthamam" ? "ഉത്തമം (Utthamam)" : "അധമം (Adhamam)"}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Ancient Kerala Direction Map Guide */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl text-xs space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>വാസ്തു അഷ്ടദിശാ നിയമങ്ങൾ (Vastu 8 Directions)</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-slate-300">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ഈശാനം (NE): പൂജാമുറി, കിണർ</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>ആഗ്നേയം (SE): അടുക്കള (Kitchen)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>നിര്യതി (SW): മാസ്റ്റർ ബെഡ്റൂം</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>വായു (NW): അതിഥി മുറി, ടോയ്‌ലറ്റ്</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Audit Consultation Report Stream (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">
                      വാസ്തുശിൽപി AI ഓഡിറ്റ് റിപ്പോർട്ട്
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Vedic Architecture Consultation Engine
                    </p>
                  </div>
                </div>

                {auditResult && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    AUDITED
                  </span>
                )}
              </div>

              {auditResult ? (
                <div className="space-y-4 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                  {auditResult.aiReport}
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <Compass className="w-12 h-12 text-slate-700 animate-spin" style={{ animationDuration: "30s" }} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 font-sans">
                      വാസ്തു ഓഡിറ്റ് ആരംഭിച്ചിട്ടില്ല
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      ഇടതുവശത്ത് കോൽ, വിരൽ അളവുകൾ ക്രമീകരിച്ച് 'AI ഓഡിറ്റ് നടത്തുക' ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {auditResult && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>അധികാര രേഖ: മനുഷ്യാലയ ചന്ദ്രിക</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(auditResult.aiReport);
                    alert("ഓഡിറ്റ് റിപ്പോർട്ട് കോപ്പി ചെയ്തു!");
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
