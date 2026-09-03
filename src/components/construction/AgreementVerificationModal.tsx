import React, { useState, useEffect } from "react";
import { ConstructionAgreement } from "../../types";
import { ConstructionStorageManager, formatIndianCurrency } from "../../utils/constructionStorageManager";
import { ShieldCheck, ShieldAlert, CheckCircle2, QrCode, Search, Building2, User, Calendar, MapPin, Layers } from "lucide-react";

interface AgreementVerificationModalProps {
  initialToken?: string;
  onClose?: () => void;
}

export const AgreementVerificationModal: React.FC<AgreementVerificationModalProps> = ({
  initialToken = "",
  onClose
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [agreement, setAgreement] = useState<ConstructionAgreement | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialToken) {
      verifyToken(initialToken);
    }
  }, [initialToken]);

  const verifyToken = (tokenToTest: string) => {
    const trimmed = tokenToTest.trim();
    if (!trimmed) return;
    const found = ConstructionStorageManager.getAgreementById(trimmed);
    setAgreement(found || null);
    setHasSearched(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyToken(tokenInput);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight font-sans">
                കരാർ ഡിജിറ്റൽ വെരിഫിക്കേഷൻ
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                SECURE QR & TOKEN VERIFICATION PORTAL
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Token Form */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter Agreement No (CW-2026-00001) or Token (VST-CW-...)"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>പരിശോധിക്കുക (Verify)</span>
            </button>
          </div>
        </form>

        {/* Verification Result */}
        {hasSearched && (
          <div>
            {agreement && agreement.status !== "ARCHIVED" && agreement.status !== "CANCELLED" ? (
              <div className="space-y-4">
                {/* Status Banner */}
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-sm">
                        സാധുതയുള്ള കെട്ടിട നിർമ്മാണ കരാർ (VALID AGREEMENT)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/50">
                        {agreement.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5">
                      This construction contract is verified authentic and officially registered with Vasthusilpy Architectural Consultants.
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <div className="space-y-1">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>കരാർ നമ്പർ (Agreement No):</span>
                    </div>
                    <div className="font-mono font-bold text-white text-sm">{agreement.agreementNo}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>കരാർ തീയതി (Date of Agreement):</span>
                    </div>
                    <div className="font-mono font-bold text-white">{agreement.agreementDate}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ഉടമസ്ഥൻ (First Party / Client):</span>
                    </div>
                    <div className="font-bold text-white">{agreement.client.clientName}</div>
                    <div className="text-slate-400 text-[11px]">{agreement.client.houseName}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>കോൺട്രാക്ടർ (Second Party):</span>
                    </div>
                    <div className="font-bold text-white">{agreement.contractor.proprietorName}</div>
                    <div className="text-slate-400 text-[11px]">{agreement.contractor.companyName}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>സൈറ്റ് ലൊക്കേഷൻ (Site Address):</span>
                    </div>
                    <div className="text-slate-200">{agreement.location.fullAddress || agreement.client.siteAddress}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      <span>വിസ്തീർണ്ണവും കരാർ തുകയും:</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-400">
                      {agreement.totalBuiltUpArea.toLocaleString()} Sq.Ft | {formatIndianCurrency(agreement.finalContractAmount)}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-center font-mono">
                  Verification Token: <span className="text-slate-400 font-bold">{agreement.verificationToken}</span> • Version: v{agreement.version}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-center space-y-2">
                <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-rose-300 font-bold text-sm">
                  കരാർ കണ്ടെത്താനായില്ല / അസാധുവാണ് (AGREEMENT NOT FOUND / INVALID)
                </h3>
                <p className="text-slate-300 text-xs max-w-md mx-auto">
                  No active verified construction agreement matches the provided ID or verification token. Please verify the credentials or contact the office.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
