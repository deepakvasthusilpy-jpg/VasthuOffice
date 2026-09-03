import React, { useState } from "react";
import { GeneralConditionClause } from "../../types";
import { DEFAULT_GENERAL_CLAUSES } from "../../utils/constructionStorageManager";
import {
  FileText,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
  Edit3,
  Search
} from "lucide-react";

interface AgreementClausesEditorProps {
  clauses: GeneralConditionClause[];
  onChange: (updatedClauses: GeneralConditionClause[]) => void;
  readOnly?: boolean;
}

const PRESET_CLAUSES: Array<{
  category: string;
  title: string;
  titleMl: string;
  content: string;
  contentMl: string;
  isMandatory: boolean;
}> = [
  {
    category: "Statutory",
    title: "LSGD Building Rules & Permit Compliance",
    titleMl: "കെട്ടിട നിർമ്മാണ ചട്ടങ്ങളും പെർമിറ്റും",
    content: "The construction shall strictly conform to the approved plan sanctioned by the local Grama Panchayat / Municipality and the Kerala Municipality/Panchayat Building Rules. Any deviation requested by the client requiring revised permit shall be processed at the client's expense.",
    contentMl: "കെട്ടിട നിർമ്മാണം തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം (LSGD) പാസാക്കിയ പെർമിറ്റ് പ്ലാനും കേരള പഞ്ചായത്ത്/മുനിസിപ്പാലിറ്റി ബിൽഡിംഗ് റൂൾസും അനുസരിച്ച് മാത്രമായിരിക്കും നിർവ്വഹിക്കുന്നത്. പ്ലാനിൽ വ്യത്യാസം വരുത്തണമെങ്കിൽ അതിനുള്ള അനുമതി ഒന്നാം കക്ഷി സ്വന്തം ചെലവിൽ വാങ്ങേണ്ടതാണ്.",
    isMandatory: true
  },
  {
    category: "Liability & Warranty",
    title: "Defect Liability Period (12 Months)",
    titleMl: "12 മാസത്തെ അറ്റകുറ്റപ്പണി ഉത്തരവാദിത്തം (Defect Liability)",
    content: "The contractor provides a 12-month Defect Liability Period from the date of final handover. Any structural cracks, roof leakages, plumbing failures, or defective workmanship arising from construction defects will be rectified free of cost. Normal wear-and-tear or client alterations are excluded.",
    contentMl: "കെട്ടിടം കൈമാറുന്ന തീയതി മുതൽ 12 മാസക്കാലം കോൺട്രാക്ടറുടെ അറ്റകുറ്റപ്പണി ഉത്തരവാദിത്ത കാലാവധിയായിരിക്കും (Defect Liability Period). നിർമ്മാണപരമായ തകരാറുകൾ, ചോർച്ചകൾ, പ്ലംബിംഗ് തകരാറുകൾ എന്നിവ ഈ കാലയളവിൽ കോൺട്രാക്ടർ സ്വന്തം ചെലവിൽ സൗജന്യമായി പരിഹരിച്ചു നൽകുന്നതാണ്.",
    isMandatory: true
  },
  {
    category: "Payments",
    title: "Cement & Steel Price Escalation Clause",
    titleMl: "സിമന്റ്, സ്റ്റീൽ വിലക്കയറ്റ നിബന്ധന (Price Escalation)",
    content: "The agreed base rate is calculated on prevailing market rates for 53 Grade Cement and Fe-500D TMT Steel. If market retail prices fluctuate by more than 10% during construction, the actual difference in material cost for remaining stages shall be mutually adjusted.",
    contentMl: "കരാർ തുക നിലവിലെ സിമന്റ്, കമ്പി (TMT Steel) വിപണി നിരക്കിനെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്. നിർമ്മാണ കാലയളവിൽ ഇവയുടെ വിലയിൽ 10%-ൽ കൂടുതൽ വർദ്ധനവുണ്ടായാൽ ബാക്കിയുള്ള ജോലികൾക്ക് വരുന്ന അധിക തുക ഒന്നാം കക്ഷി നൽകാൻ ബാധ്യസ്ഥനാണ്.",
    isMandatory: false
  },
  {
    category: "Site Facilities",
    title: "Potable Water & Construction Electricity",
    titleMl: "വെള്ളം, വൈദ്യുതി, സുരക്ഷിത സ്റ്റോറേജ്",
    content: "The First Party (Client) shall arrange uninterrupted potable water source and working single/three-phase electric power connection at the site. The contractor will construct a temporary secure lockable shed for cement and tools storage.",
    contentMl: "നിർമ്മാണ പ്രവർത്തനങ്ങൾക്കാവശ്യമായ നല്ല ശുദ്ധജലവും വൈദ്യുതി കണക്ഷനും സൈറ്റിൽ ഒന്നാം കക്ഷി സ്വന്തം ചെലവിൽ ഏർപ്പാടാക്കേണ്ടതാണ്. സാമഗ്രികൾ സൂക്ഷിക്കുന്നതിനുള്ള താൽക്കാലിക ഷെഡ് കോൺട്രാക്ടർ നിർമ്മിക്കുന്നതാണ്.",
    isMandatory: true
  },
  {
    category: "Payments",
    title: "Stage Payments & Work Stoppage for Delay",
    titleMl: "ഘട്ടം തിരിച്ചുള്ള പെയ്‌മെന്റും കാലതാമസവും",
    content: "The client shall release payment for each stage within 7 days of stage completion and verification. If payment is delayed beyond 14 days without valid reason, work will be paused, and the final completion milestone will be extended by the delayed duration.",
    contentMl: "ഓരോ നിർമ്മാണ ഘട്ടവും പൂർത്തിയാകുമ്പോൾ 7 ദിവസത്തിനകം ഒന്നാം കക്ഷി പണം നൽകേണ്ടതാണ്. പെയ്‌മെന്റിൽ 14 ദിവസത്തിൽ കൂടുതൽ കാലതാമസം ഉണ്ടായാൽ ജോലി താൽക്കാലികമായി നിർത്തിവെക്കാനും കാലതാമസത്തിന് ആനുപാതികമായി കാലാവധി നീട്ടാനും കരാറുകാരന് അവകാശമുണ്ടായിരിക്കും.",
    isMandatory: true
  },
  {
    category: "Legal & Arbitration",
    title: "Dispute Resolution & Jurisdiction",
    titleMl: "തർക്ക പരിഹാരവും കോടതി അധികാര പരിധിയും",
    content: "Any dispute arising between the parties regarding quality, rates, or execution shall first be resolved through mutual consultation with the supervising chartered engineer/architect. Unresolved disputes shall be subject to the exclusive jurisdiction of the civil courts in Palakkad District, Kerala.",
    contentMl: "കരാറുമായി ബന്ധപ്പെട്ട് എന്തെങ്കിലും തർക്കങ്ങളുണ്ടായാൽ ഇരു കക്ഷികളും ചർച്ച ചെയ്ത് എഞ്ചിനീയറുടെ മധ്യസ്ഥതയിൽ പരിഹരിക്കേണ്ടതാണ്. പരിഹരിക്കപ്പെടാത്ത തർക്കങ്ങളിൽ പാലക്കാട് ജില്ലാ കോടതികളുടെ അധികാരപരിധിക്ക് വിധേയമായിരിക്കും.",
    isMandatory: true
  },
  {
    category: "Quality",
    title: "Structural Concrete Curing (21 Days)",
    titleMl: "കോൺക്രീറ്റ് വാട്ടറിംഗ് & ക്യൂറിംഗ് (21 Days)",
    content: "All RCC structural elements, roof slabs, beams, and columns shall be continuously ponded / cured with water for a mandatory period of 21 days to ensure full characteristic compressive strength as per IS 456.",
    contentMl: "റൂഫ് സ്ലാബ്, ബീമുകൾ, കോളങ്ങൾ എന്നിവ കോൺക്രീറ്റ് ചെയ്ത ശേഷം കുറഞ്ഞത് 21 ദിവസം തുടർച്ചയായി വെള്ളം കെട്ടിനിർത്തി നനയ്ക്കേണ്ടതും (Curing) സാങ്കേതിക മേൽനോട്ടം ഉറപ്പുവരുത്തേണ്ടതുമാണ്.",
    isMandatory: false
  },
  {
    category: "Safety",
    title: "Workmen Safety & Insurance Responsibility",
    titleMl: "തൊഴിലാളി സുരക്ഷയും ഇൻഷുറൻസും",
    content: "The contractor is solely responsible for adopting all standard safety measures and providing personal protective equipment (PPE) for workers at the site. The contractor indemnifies the client from any labour compensation claims under the Workmen's Compensation Act.",
    contentMl: "സൈറ്റിൽ ജോലി ചെയ്യുന്ന തൊഴിലാളികളുടെ സുരക്ഷയും അവർക്ക് ആവശ്യമായ മുൻകരുതലുകളും ഇൻഷുറൻസും കോൺട്രാക്ടറുടെ പൂർണ്ണ ഉത്തരവാദിത്തത്തിലായിരിക്കും.",
    isMandatory: false
  },
  {
    category: "Variations",
    title: "Extra Works Written Confirmation",
    titleMl: "അധിക ജോലികൾക്ക് മുൻകൂട്ടിയുള്ള അനുമതി",
    content: "Any extra work, luxury material upgrading, or design alterations requested by the client shall be estimated with item rates and approved in writing/messaging before execution. Payment for extra works shall be made along with immediate next stage.",
    contentMl: "അംഗീകരിച്ച പ്ലാനിന് പുറമെ ഒന്നാം കക്ഷി ആവശ്യപ്പെടുന്ന അധിക നിർമ്മാണ ജോലികൾക്ക് എസ്റ്റിമേറ്റും നിരക്കും മുൻകൂട്ടി നിശ്ചയിച്ച് രേഖാമൂലം അനുമതി വാങ്ങി മാത്രമേ ജോലി ആരംഭിക്കുകയുള്ളൂ.",
    isMandatory: true
  },
  {
    category: "Handover",
    title: "Site Clearance & Key Handover",
    titleMl: "സൈറ്റ് ക്ലീനിംഗും താക്കോൽ കൈമാറ്റവും",
    content: "Upon completion of all finishing items and final chemical cleaning of tiles, the keys will be handed over to the client upon settlement of the final contract invoice and retention amount.",
    contentMl: "എല്ലാ ജോലികളും ഫ്ലോർ ക്ലീനിംഗും പൂർത്തിയാക്കി അവസാന പെയ്‌മെന്റ് നൽകുന്നതോടെ കെട്ടിടത്തിന്റെ താക്കോൽ ഒന്നാം കക്ഷിക്ക് കൈമാറുന്നതാണ്.",
    isMandatory: true
  }
];

export const AgreementClausesEditor: React.FC<AgreementClausesEditorProps> = ({
  clauses,
  onChange,
  readOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPresetsDrawer, setShowPresetsDrawer] = useState(false);

  // New Clause State
  const [newTitle, setNewTitle] = useState("");
  const [newTitleMl, setNewTitleMl] = useState("");
  const [newContentMl, setNewContentMl] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newIsMandatory, setNewIsMandatory] = useState(false);
  const [newCategory, setNewCategory] = useState("General");

  // Reorder helper
  const handleMove = (index: number, direction: "up" | "down") => {
    if (readOnly) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clauses.length) return;

    const copy = [...clauses];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Auto update clause numbers
    const renumbered = copy.map((c, i) => ({
      ...c,
      clauseNo: i + 1
    }));
    onChange(renumbered);
  };

  // Auto Renumber
  const handleAutoRenumber = () => {
    const renumbered = clauses.map((c, i) => ({
      ...c,
      clauseNo: i + 1
    }));
    onChange(renumbered);
  };

  // Add new clause
  const handleAddClause = () => {
    if (!newTitleMl.trim() && !newTitle.trim()) return;

    const newClause: GeneralConditionClause = {
      id: `cl_${Date.now()}`,
      clauseNo: clauses.length + 1,
      title: newTitle.trim() || newTitleMl.trim(),
      titleMl: newTitleMl.trim() || newTitle.trim(),
      content: newContent.trim() || newContentMl.trim(),
      contentMl: newContentMl.trim() || newContent.trim(),
      isMandatory: newIsMandatory,
      isEnabled: true,
      category: newCategory
    };

    onChange([...clauses, newClause]);
    setNewTitle("");
    setNewTitleMl("");
    setNewContent("");
    setNewContentMl("");
    setNewIsMandatory(false);
    setShowAddModal(false);
  };

  // Add Preset Clause
  const handleAddPreset = (preset: typeof PRESET_CLAUSES[0]) => {
    const newClause: GeneralConditionClause = {
      id: `cl_preset_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      clauseNo: clauses.length + 1,
      title: preset.title,
      titleMl: preset.titleMl,
      content: preset.content,
      contentMl: preset.contentMl,
      isMandatory: preset.isMandatory,
      isEnabled: true,
      category: preset.category
    };

    onChange([...clauses, newClause]);
  };

  // Delete Clause
  const handleDeleteClause = (index: number) => {
    if (readOnly) return;
    const filtered = clauses.filter((_, i) => i !== index);
    const renumbered = filtered.map((c, i) => ({
      ...c,
      clauseNo: i + 1
    }));
    onChange(renumbered);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm("ഡിഫോൾട്ട് 12 വ്യവസ്ഥകളിലേക്ക് മാറ്റണോ? (Reset all clauses to Vasthusilpy defaults?)")) {
      onChange(DEFAULT_GENERAL_CLAUSES);
    }
  };

  // Update specific clause field
  const handleUpdateField = (index: number, fields: Partial<GeneralConditionClause>) => {
    const copy = [...clauses];
    copy[index] = { ...copy[index], ...fields };
    onChange(copy);
  };

  const filteredClauses = clauses.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.titleMl && c.titleMl.toLowerCase().includes(term)) ||
      (c.title && c.title.toLowerCase().includes(term)) ||
      (c.contentMl && c.contentMl.toLowerCase().includes(term)) ||
      (c.content && c.content.toLowerCase().includes(term)) ||
      c.clauseNo.toString().includes(term)
    );
  });

  const enabledCount = clauses.filter(c => c.isEnabled).length;

  return (
    <div className="space-y-4 text-white">
      {/* Header & Controls */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">കരാർ വ്യവസ്ഥകൾ (Contract Terms & Legal Clauses)</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[11px] border border-emerald-800">
                {enabledCount} സജീവമാണ് (Active) / {clauses.length} ആകെ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              വ്യവസ്ഥകൾ കൂട്ടിച്ചേർക്കാനും, മാറ്റങ്ങൾ വരുത്താനും, നീക്കം ചെയ്യാനും താഴെയുള്ള ഓപ്ഷനുകൾ ഉപയോഗിക്കുക.
            </p>
          </div>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Auto Renumber */}
            <button
              onClick={handleAutoRenumber}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition"
              title="Renumber clauses sequentially 1, 2, 3..."
            >
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>നമ്പർ ക്രമീകരിക്കുക (1..N)</span>
            </button>

            {/* Presets Drawer Toggle */}
            <button
              onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}
              className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>സ്റ്റാൻഡേർഡ് വ്യവസ്ഥകൾ (Presets)</span>
            </button>

            {/* Reset to Defaults */}
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-mono flex items-center gap-1 cursor-pointer transition"
              title="Reset to default legal clauses"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ഡിഫോൾട്ട്</span>
            </button>

            {/* Add New Clause Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ പുതിയ വ്യവസ്ഥ ചേർക്കുക (Add Clause)</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Clauses Drawer */}
      {showPresetsDrawer && !readOnly && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-indigo-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                റെഡിമെയ്ഡ് കേരള നിർമ്മാണ കരാർ വ്യവസ്ഥകൾ (Standard Legal Presets)
              </span>
            </div>
            <button
              onClick={() => setShowPresetsDrawer(false)}
              className="text-xs text-slate-400 hover:text-white font-mono"
            >
              അടയ്ക്കുക (Close)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {PRESET_CLAUSES.map((preset, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="text-amber-300">{preset.titleMl}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 font-mono">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans line-clamp-2 mt-1">
                    {preset.contentMl}
                  </p>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>കരാറിൽ ചേർക്കുക (Add)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="വ്യവസ്ഥകൾ തിരയുക... (Search clauses by keyword / title / number)"
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-indigo-500 outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Clauses List */}
      <div className="space-y-3">
        {filteredClauses.map((clause, idx) => {
          const originalIndex = clauses.findIndex(c => c.id === clause.id);
          const isExpanded = editingClauseId === clause.id;

          return (
            <div
              key={clause.id || idx}
              className={`bg-slate-950 rounded-2xl border transition ${
                clause.isEnabled
                  ? "border-slate-800 hover:border-slate-700"
                  : "border-slate-800/40 opacity-60 bg-slate-950/40"
              }`}
            >
              {/* Card Header */}
              <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                  {/* Reorder Buttons */}
                  {!readOnly && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(originalIndex, "up")}
                        disabled={originalIndex === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(originalIndex, "down")}
                        disabled={originalIndex === clauses.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded transition cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Clause Number Badge */}
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 shrink-0">
                    {clause.clauseNo}
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={clause.titleMl || clause.title}
                        readOnly={readOnly}
                        onChange={e => handleUpdateField(originalIndex, { titleMl: e.target.value, title: e.target.value })}
                        className="font-bold text-xs sm:text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:bg-slate-900 rounded px-1 py-0.5 outline-none w-full max-w-lg transition"
                      />
                      {clause.isMandatory && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-mono shrink-0">
                          നിർബന്ധം (Mandatory)
                        </span>
                      )}
                    </div>
                    {clause.title && clause.title !== clause.titleMl && (
                      <div className="text-[11px] text-slate-400 font-mono px-1">
                        {clause.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  {/* Mandatory Toggle */}
                  {!readOnly && (
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <input
                        type="checkbox"
                        checked={clause.isMandatory}
                        onChange={e => handleUpdateField(originalIndex, { isMandatory: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>നിർബന്ധിതം</span>
                    </label>
                  )}

                  {/* Enabled Toggle */}
                  <label className="flex items-center gap-1.5 text-[11px] font-mono cursor-pointer select-none bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={clause.isEnabled}
                      disabled={readOnly}
                      onChange={e => handleUpdateField(originalIndex, { isEnabled: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500"
                    />
                    <span className={clause.isEnabled ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {clause.isEnabled ? "സജീവം (Active)" : "ഒഴിവാക്കി"}
                    </span>
                  </label>

                  {/* Expand / Edit Details */}
                  <button
                    onClick={() => setEditingClauseId(isExpanded ? null : clause.id)}
                    className={`p-1.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
                      isExpanded
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
                    }`}
                    title="Toggle Detailed Editing"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Clause */}
                  {!readOnly && (
                    <button
                      onClick={() => {
                        if (window.confirm(`"${clause.titleMl || clause.title}" എന്ന വ്യവസ്ഥ നീക്കം ചെയ്യണമെന്നുറപ്പാണോ?`)) {
                          handleDeleteClause(originalIndex);
                        }
                      }}
                      className="p-1.5 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-700/50 rounded-lg transition cursor-pointer"
                      title="Delete Clause"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Area (Malayalam Legal Text) */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                <textarea
                  rows={2}
                  value={clause.contentMl || clause.content}
                  readOnly={readOnly}
                  onChange={e => handleUpdateField(originalIndex, { contentMl: e.target.value })}
                  placeholder="മലയാളത്തിലുള്ള വ്യവസ്ഥയുടെ പൂർണ്ണരൂപം (Clause text in Malayalam)..."
                  className="w-full p-2.5 bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 font-sans text-xs sm:text-sm leading-relaxed outline-none transition"
                />

                {/* Expanded English & Advanced Meta Fields */}
                {isExpanded && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3 pt-2 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1 text-[11px]">ഇംഗ്ലീഷ് തലക്കെട്ട് (Title in English):</label>
                        <input
                          type="text"
                          value={clause.title || ""}
                          readOnly={readOnly}
                          onChange={e => handleUpdateField(originalIndex, { title: e.target.value })}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 text-[11px]">വിഭാഗം (Category):</label>
                        <select
                          value={clause.category || "General"}
                          disabled={readOnly}
                          onChange={e => handleUpdateField(originalIndex, { category: e.target.value })}
                          className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                        >
                          <option value="Scope">Scope of Work</option>
                          <option value="Statutory">Statutory & Permits</option>
                          <option value="Payments">Payments & Escalation</option>
                          <option value="Quality">Quality & Inspection</option>
                          <option value="Site Facilities">Site Facilities & Water/Power</option>
                          <option value="Liability & Warranty">Warranty & Defect Liability</option>
                          <option value="Legal & Arbitration">Legal & Arbitration</option>
                          <option value="Variations">Variations & Extra Works</option>
                          <option value="Safety">Safety & Labour</option>
                          <option value="Handover">Final Handover</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 text-[11px]">ഇംഗ്ലീഷ് വിവരണം (Legal text in English):</label>
                      <textarea
                        rows={2}
                        value={clause.content || ""}
                        readOnly={readOnly}
                        onChange={e => handleUpdateField(originalIndex, { content: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredClauses.length === 0 && (
          <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 font-mono text-xs">
            വ്യവസ്ഥകൾ ഒന്നും കണ്ടെത്തിയില്ല. പുതിയത് ചേർക്കാൻ മുകളിലെ ബട്ടൺ ഉപയോഗിക്കുക.
          </div>
        )}
      </div>

      {/* Add New Clause Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base font-sans">
                  പുതിയ കരാർ വ്യവസ്ഥ ചേർക്കുക (Add New Legal Clause)
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">തലക്കെട്ട് (മലയാളം)*:</label>
                  <input
                    type="text"
                    value={newTitleMl}
                    onChange={e => setNewTitleMl(e.target.value)}
                    placeholder="ഉദാ: വാറന്റി & അറ്റകുറ്റപ്പണി"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Title in English:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Warranty & Maintenance"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">വ്യവസ്ഥയുടെ പൂർണ്ണരൂപം (Malayalam)*:</label>
                <textarea
                  rows={3}
                  value={newContentMl}
                  onChange={e => setNewContentMl(e.target.value)}
                  placeholder="വ്യവസ്ഥയുടെ വിശദ വിവരങ്ങൾ ഇവിടെ ടൈപ്പ് ചെയ്യുക..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-sans text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Clause Content in English (Optional):</label>
                <textarea
                  rows={2}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Optional English legal wording..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="text-slate-300 block mb-1">വിഭാഗം (Category):</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="Scope">Scope of Work</option>
                    <option value="Statutory">Statutory & Permits</option>
                    <option value="Payments">Payments & Escalation</option>
                    <option value="Quality">Quality & Inspection</option>
                    <option value="Site Facilities">Site Facilities</option>
                    <option value="Liability & Warranty">Warranty & Defects</option>
                    <option value="Legal & Arbitration">Legal & Jurisdiction</option>
                    <option value="Variations">Variations</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newIsMandatory}
                      onChange={e => setNewIsMandatory(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500"
                    />
                    <span>നിർബന്ധിത വ്യവസ്ഥയാണ് (Mandatory Clause)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
              >
                റദ്ദാക്കുക (Cancel)
              </button>
              <button
                onClick={handleAddClause}
                disabled={!newTitleMl.trim() && !newTitle.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-mono font-bold cursor-pointer shadow-md shadow-emerald-950"
              >
                + ചേർക്കുക (Add to Agreement)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
