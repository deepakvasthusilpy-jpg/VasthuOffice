import React, { useState, useMemo } from "react";
import { ThachuRow, PhalamType } from "../types";
import { THACHU_DATA, NAKSHATRA_LIST, VAYASSU_LIST } from "../data/thachuShastraData";
import { Search, Download, ChevronLeft, ChevronRight, Eye, CheckCircle2, AlertTriangle, Info, SlidersHorizontal, Table } from "lucide-react";

interface FullTableTabProps {
  onSelectRow: (row: ThachuRow) => void;
}

export const FullTableTab: React.FC<FullTableTabProps> = ({ onSelectRow }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [phalamFilter, setPhalamFilter] = useState<"ALL" | PhalamType>("ALL");
  const [nakshatramFilter, setNakshatramFilter] = useState<string>("ALL");
  const [vayassuFilter, setVayassuFilter] = useState<string>("ALL");
  const [selectedPageFilter, setSelectedPageFilter] = useState<number | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Filter logic
  const filteredData = useMemo(() => {
    return THACHU_DATA.filter((row) => {
      // Search term check
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          row.kol.toString().includes(term) ||
          row.viral.toString().includes(term) ||
          row.chuttuCm.toString().includes(term) ||
          row.nakshatram.toLowerCase().includes(term) ||
          row.pakshamTithi.toLowerCase().includes(term) ||
          row.karanam.toLowerCase().includes(term) ||
          row.phalam.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      // Phalam filter
      if (phalamFilter !== "ALL" && row.phalam !== phalamFilter) return false;

      // Nakshatram filter
      if (nakshatramFilter !== "ALL" && row.nakshatram !== nakshatramFilter) return false;

      // Vayassu filter
      if (vayassuFilter !== "ALL" && row.vayassu !== vayassuFilter) return false;

      // PDF Page filter
      if (selectedPageFilter !== "ALL" && row.page !== selectedPageFilter) return false;

      return true;
    });
  }, [searchTerm, phalamFilter, nakshatramFilter, vayassuFilter, selectedPageFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleExportCSV = () => {
    const headers = [
      "ID", "Kol", "Viral", "Centimeters", "Meters", "Feet/Inches",
      "Yoni", "Vyayam", "Aayam Kol", "Aayam Viral", "Aayam Cm",
      "Nakshatram", "Nazhika", "Vayassu", "Paksham/Tithi", "Nazhika",
      "Karanam", "Azhcha", "Pakshanthara Vyayam", "Phalam", "PDF Page"
    ];

    const rows = filteredData.map((r) => [
      r.id, r.kol, r.viral, r.chuttuCm, r.chuttuMeters, `"${r.chuttuFeetInches}"`,
      `"${r.yoniName}"`, r.vayam, r.aayamKol, r.aayamViral, r.aayamCm,
      r.nakshatram, r.nakshatramNazhika, r.vayassu, `"${r.pakshamTithi}"`, r.tithiNazhika,
      r.karanam, `"${r.azhchaFullName}"`, r.pakshantharaVyayam, r.phalam, r.page
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `thachu_shastra_kanakku_${phalamFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar - Corporate Tech */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 backdrop-blur-sm bg-blueprint-grid">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-cyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Kol, Viral, Nakshatram, Tithi, Cm..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Phalam Quick Toggle Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1">
            <button
              onClick={() => {
                setPhalamFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                phalamFilter === "ALL"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              ALL ({THACHU_DATA.length})
            </button>
            <button
              onClick={() => {
                setPhalamFilter("ഉത്തമം");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                phalamFilter === "ഉത്തമം"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                  : "bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/80"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ഉത്തമം ({THACHU_DATA.filter((r) => r.phalam === "ഉത്തമം").length})</span>
            </button>
            <button
              onClick={() => {
                setPhalamFilter("മധ്യമം");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                phalamFilter === "മധ്യമം"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm"
                  : "bg-cyan-950/60 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/80"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>മധ്യമം ({THACHU_DATA.filter((r) => r.phalam === "മധ്യമം").length})</span>
            </button>
            <button
              onClick={() => {
                setPhalamFilter("അധമം");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                phalamFilter === "അധമം"
                  ? "bg-rose-500 text-slate-950 border-rose-400 shadow-sm"
                  : "bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/80"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>അധമം ({THACHU_DATA.filter((r) => r.phalam === "അധമം").length})</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs font-mono font-semibold transition cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <label className="block font-mono text-[11px] text-slate-400 mb-1">Nakshtram Filter</label>
            <select
              value={nakshatramFilter}
              onChange={(e) => {
                setNakshatramFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Nakshatram</option>
              {NAKSHATRA_LIST.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-slate-400 mb-1">Age Category (Vayassu)</label>
            <select
              value={vayassuFilter}
              onChange={(e) => {
                setVayassuFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Age Types</option>
              {VAYASSU_LIST.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] text-slate-400 mb-1">Blueprint Page Filter</label>
            <select
              value={selectedPageFilter}
              onChange={(e) => {
                setSelectedPageFilter(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Pages (1–17)</option>
              {Array.from({ length: 17 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Page {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setPhalamFilter("ALL");
                setNakshatramFilter("ALL");
                setVayassuFilter("ALL");
                setSelectedPageFilter("ALL");
                setCurrentPage(1);
              }}
              className="w-full p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-mono transition cursor-pointer text-center text-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* LANDSCAPE RESPONSIVE DATA TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <span>FILTERED RESULTS: {filteredData.length} ROWS</span>
          </div>
          <span className="text-slate-400">
            (Displaying {paginatedData.length} entries per page)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header matching the Technical Blueprint Style */}
            <thead>
              <tr className="bg-slate-950 text-cyan-300 font-mono font-bold border-b border-slate-800 text-center uppercase tracking-wider">
                <th className="p-3 border-r border-slate-800">കോൽ</th>
                <th className="p-3 border-r border-slate-800">വിരൽ</th>
                <th className="p-3 border-r border-slate-800 bg-slate-900 text-cyan-400">ചുറ്റ് (CM)</th>
                <th className="p-3 border-r border-slate-800">യോനി</th>
                <th className="p-3 border-r border-slate-800">വ്യയം</th>
                <th className="p-3 border-r border-slate-800">ആയം കോൽ</th>
                <th className="p-3 border-r border-slate-800">ആയം വിരൽ</th>
                <th className="p-3 border-r border-slate-800 font-mono">ആയം CM</th>
                <th className="p-3 border-r border-slate-800">നക്ഷത്രം</th>
                <th className="p-3 border-r border-slate-800">നാഴിക</th>
                <th className="p-3 border-r border-slate-800">വയസ്സ്</th>
                <th className="p-3 border-r border-slate-800">തിഥി</th>
                <th className="p-3 border-r border-slate-800">നാഴിക</th>
                <th className="p-3 border-r border-slate-800">കരണം</th>
                <th className="p-3 border-r border-slate-800">ആഴ്ച</th>
                <th className="p-3 border-r border-slate-800">പക്ഷാന്തര വ്യയം</th>
                <th className="p-3 border-r border-slate-800">ഗുണ ദോഷ ഫലം</th>
                <th className="p-3">VIEW</th>
              </tr>
            </thead>

            {/* Table Body with Corporate Blueprint highlights */}
            <tbody className="divide-y divide-slate-800 font-mono">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={18} className="p-8 text-center text-slate-400 font-mono">
                    No matching Vastu measurements found for selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((r) => {
                  const rowClass =
                    r.phalam === "ഉത്തമം"
                      ? "bg-emerald-950/40 hover:bg-emerald-900/60 text-slate-100"
                      : r.phalam === "മധ്യമം"
                      ? "bg-cyan-950/40 hover:bg-cyan-900/60 text-slate-100"
                      : "bg-rose-950/40 hover:bg-rose-900/60 text-slate-100";

                  return (
                    <tr
                      key={r.id}
                      className={`${rowClass} transition cursor-pointer text-center font-semibold`}
                      onClick={() => onSelectRow(r)}
                    >
                      <td className="p-3 border-r border-slate-800/80 text-white font-bold">{r.kol}</td>
                      <td className="p-3 border-r border-slate-800/80 text-white font-bold">{r.viral}</td>
                      <td className="p-3 border-r border-slate-800/80 font-mono font-bold text-cyan-300 bg-slate-950/60">
                        {r.chuttuCm}
                      </td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200">{r.yoni}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200">{r.vayam}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-300">{r.aayamKol}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-300">{r.aayamViral}</td>
                      <td className="p-3 border-r border-slate-800/80 font-mono text-cyan-300">{r.aayamCm}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200 font-sans whitespace-nowrap">
                        {r.nakshatram}
                      </td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-300">{r.nakshatramNazhika}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200 whitespace-nowrap">{r.vayassu}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200 whitespace-nowrap">{r.pakshamTithi}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-300">{r.tithiNazhika}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200 whitespace-nowrap">{r.karanam}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-200">{r.azhcha}</td>
                      <td className="p-3 border-r border-slate-800/80 text-slate-300">{r.pakshantharaVyayam}</td>
                      <td className="p-3 border-r border-slate-800/80 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold shadow-xs ${
                            r.phalam === "ഉത്തമം"
                              ? "bg-emerald-500 text-slate-950 border border-emerald-400"
                              : r.phalam === "മധ്യമം"
                              ? "bg-cyan-500 text-slate-950 border border-cyan-400"
                              : "bg-rose-500 text-slate-950 border border-rose-400"
                          }`}
                        >
                          {r.phalam}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRow(r);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition cursor-pointer"
                          title="View specification detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-400">
              PAGE {currentPage} OF {totalPages} ({filteredData.length} TOTAL ROWS)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-slate-200 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
                <span>PREV</span>
              </button>

              <span className="px-3 py-1.5 bg-cyan-500 font-bold text-slate-950 rounded-lg">
                {currentPage}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-slate-200 cursor-pointer flex items-center gap-1"
              >
                <span>NEXT</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

