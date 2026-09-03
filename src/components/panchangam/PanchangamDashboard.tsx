import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Compass,
  Sun,
  Moon,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen,
  Search,
  Filter,
  Layers,
  Flame,
  CheckCircle2,
  AlertCircle,
  Share2,
  Printer,
  Copy,
  Check,
  Star,
  Building2,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import {
  generateDailyPanchangam,
  POPULAR_LOCATIONS,
  PanchangamLocation,
  DailyPanchangamData
} from "../../utils/panchangamApi";
import {
  SPECIAL_DAYS_DATABASE,
  SpecialDayInfo,
  MALAYALAM_MONTHS,
  WEEKDAYS_KERALA,
  toMalayalamNumerals
} from "../../utils/keralaCalendarData";
import { IndianCalendar } from "../home/IndianCalendar";
import { PanchangamTabType, TabType, MainSectionType } from "../../types";

interface PanchangamDashboardProps {
  initialTab?: PanchangamTabType | TabType;
  onTabChange?: (tab: PanchangamTabType) => void;
  onNavigate?: (section: MainSectionType, tab: TabType) => void;
}

export const PanchangamDashboard: React.FC<PanchangamDashboardProps> = ({
  initialTab = "panchangam_calendar",
  onTabChange,
  onNavigate
}) => {
  // Navigation & Sub-tab State
  const [activeSubTab, setActiveSubTab] = useState<PanchangamTabType>(
    (initialTab && initialTab.startsWith("panchangam_") ? initialTab : "panchangam_calendar") as PanchangamTabType
  );

  useEffect(() => {
    if (initialTab && initialTab.startsWith("panchangam_")) {
      setActiveSubTab(initialTab as PanchangamTabType);
    }
  }, [initialTab]);

  const handleSubTabClick = (tab: PanchangamTabType) => {
    setActiveSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Location State
  const [selectedLocationId, setSelectedLocationId] = useState<string>("keralassery");
  const currentLocation = useMemo(() => {
    return POPULAR_LOCATIONS.find((loc) => loc.id === selectedLocationId) || POPULAR_LOCATIONS[0];
  }, [selectedLocationId]);

  // Date State for Daily Panchangam
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 2)); // Default Sep 2, 2026 reference
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Live IST Clock
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  const istTimeString = istFormatter.format(now);

  // Computed Panchangam for Selected Date & Location
  const dailyData: DailyPanchangamData = useMemo(() => {
    return generateDailyPanchangam(selectedDate, currentLocation);
  }, [selectedDate, currentLocation]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleJumpToToday = () => {
    setSelectedDate(new Date(2026, 8, 2)); // Reference date
  };

  // Festivals Filter State
  const [festivalSearchQuery, setFestivalSearchQuery] = useState("");
  const [festivalCategoryFilter, setFestivalCategoryFilter] = useState("all");

  const filteredFestivals = useMemo(() => {
    return SPECIAL_DAYS_DATABASE.filter((fest) => {
      const matchesCategory =
        festivalCategoryFilter === "all" ||
        (festivalCategoryFilter === "govt" && fest.isPublicHoliday) ||
        (festivalCategoryFilter === "national" && fest.category === "national_holiday") ||
        (festivalCategoryFilter === "kerala" && fest.category === "kerala_festival") ||
        fest.category === festivalCategoryFilter;

      const q = festivalSearchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        fest.nameEn.toLowerCase().includes(q) ||
        fest.nameMl.toLowerCase().includes(q) ||
        (fest.descriptionEn && fest.descriptionEn.toLowerCase().includes(q)) ||
        (fest.descriptionMl && fest.descriptionMl.toLowerCase().includes(q)) ||
        fest.dateFormatted.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [festivalCategoryFilter, festivalSearchQuery]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(`${label} copied to clipboard`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          1. HEADER HERO BANNER & IST REAL-TIME CLOCK
         ========================================================================= */}
      <div className="glass-card rounded-3xl p-5 md:p-6 border border-white/20 bg-gradient-to-br from-[#1a0826]/90 via-[#260c38]/80 to-[#12041c]/90 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background rings */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & System Identification */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
                <CalendarIcon className="w-3.5 h-3.5" />
                കൊല്ലവർഷം {dailyData.eras.kollamYear} {dailyData.eras.kollamMonthMl} {toMalayalamNumerals(dailyData.eras.kollamDay)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-mono text-[11px] font-bold border border-purple-400/30">
                ശകവർഷം {dailyData.eras.sakaYear} • വിക്രം സംവത് {dailyData.eras.vikramYear}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-400/30">
                {dailyData.eras.ayanamMl} ({dailyData.eras.ayanamEn})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight flex items-center gap-3">
              <Compass className="w-7 h-7 text-amber-400" />
              <span>കേരള പഞ്ചാംഗം & കലണ്ടർ</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 font-sans max-w-2xl">
              ദൃക്-ഗണിത അടിസ്ഥാനത്തിലുള്ള സൂര്യോദയ-സൂര്യാസ്തമയ സമയങ്ങൾ, തിഥി, നക്ഷത്രം, രാഹുകാലം, ഗുളികകാലം, യമഗണ്ഡം, ശുഭ-അശുഭ മുഹൂർത്തങ്ങൾ & വാസ്തു ശാസ്ത്ര നിർമ്മാണ നിർദ്ദേശങ്ങൾ.
            </p>
          </div>

          {/* Location Selector & Real-Time IST Digital Clock */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
            {/* District Location Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>സ്ഥലം / LOCATION (14 DISTRICTS)</span>
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="bg-[#0e021a] text-white text-xs font-sans rounded-xl px-3 py-2 border border-white/20 focus:border-amber-400 focus:outline-none cursor-pointer"
              >
                <optgroup label="കേരളത്തിലെ ജില്ലകൾ (Kerala Districts)">
                  {POPULAR_LOCATIONS.filter((l) => l.state === "Kerala").map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nameMl} ({loc.nameEn})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="മറ്റ് പ്രധാന നഗരങ്ങൾ (Other Cities)">
                  {POPULAR_LOCATIONS.filter((l) => l.state !== "Kerala").map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nameMl} ({loc.nameEn})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Live IST Digital Clock Display */}
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-gradient-to-b from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-xl min-w-[150px]">
              <span className="text-[9px] font-mono text-amber-300/80 font-bold tracking-widest uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                IST TIME (ASIA/KOLKATA)
              </span>
              <span className="text-lg font-mono font-black text-amber-200 tracking-wider">
                {istTimeString}
              </span>
              <span className="text-[9.5px] font-sans text-purple-200/70">
                {currentLocation.lat.toFixed(2)}° N, {currentLocation.lng.toFixed(2)}° E
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Dock / Workstation Navigation */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleSubTabClick("panchangam_calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "panchangam_calendar"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50 border border-white/30 scale-102"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-amber-300" />
            <span>മാസ കലണ്ടർ (Monthly Calendar)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">1202</span>
          </button>

          <button
            onClick={() => handleSubTabClick("panchangam_daily")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "panchangam_daily"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50 border border-white/30 scale-102"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            <Sun className="w-4 h-4 text-amber-300" />
            <span>ദിവസേനയുള്ള പഞ്ചാംഗം (Daily Panchangam)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px]">EPHEMERIS</span>
          </button>

          <button
            onClick={() => handleSubTabClick("panchangam_muhurtham")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "panchangam_muhurtham"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50 border border-white/30 scale-102"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>വാസ്തു മുഹൂർത്തം (Vasthu Muhurtham)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px]">BHOOMI POOJA</span>
          </button>

          <button
            onClick={() => handleSubTabClick("panchangam_festivals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "panchangam_festivals"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50 border border-white/30 scale-102"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>വിശേഷ ദിവസങ്ങളും അവധികളും (Festivals & Holidays)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-200 text-[10px]">{SPECIAL_DAYS_DATABASE.length}</span>
          </button>

          <button
            onClick={() => handleSubTabClick("panchangam_choghadiya")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "panchangam_choghadiya"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-950/50 border border-white/30 scale-102"
                : "text-purple-200/80 hover:text-white hover:bg-white/10 border border-transparent"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>ചോഘടിയ & ശുഭ സമയങ്ങൾ (Choghadiya)</span>
          </button>
        </div>
      </div>

      {/* Copied Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 1: MONTHLY CALENDAR (മാസ കലണ്ടർ)
         ========================================================================= */}
      {activeSubTab === "panchangam_calendar" && (
        <div className="space-y-6">
          <IndianCalendar />
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: DAILY PANCHANGAM & EPHEMERIS (ദിവസേനയുള്ള പഞ്ചാംഗം)
         ========================================================================= */}
      {activeSubTab === "panchangam_daily" && (
        <div className="space-y-6">
          {/* Date Selector Navigation Bar */}
          <div className="glass-card rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#140520]/80">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                title="Previous Day (തലേദിവസം)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xs font-mono font-bold text-amber-300">
                  {selectedDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="text-sm font-sans font-black text-white">
                  {dailyData.eras.kollamFormattedMl}
                </span>
              </div>

              <button
                onClick={handleNextDay}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                title="Next Day (അടുത്ത ദിവസം)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dailyData.dateStr}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                  }
                }}
                className="bg-[#0e021a] text-white text-xs font-mono rounded-xl px-3 py-2 border border-white/20 focus:border-amber-400 focus:outline-none cursor-pointer"
              />

              <button
                onClick={handleJumpToToday}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Today (ഇന്ന്)</span>
              </button>

              <button
                onClick={() => {
                  const summary = `കേരള പഞ്ചാംഗം (${dailyData.dateStr} - ${currentLocation.nameMl})\nകൊല്ലവർഷം: ${dailyData.eras.kollamFormattedMl}\nവാരം: ${dailyData.vara.nameMl}\nതിഥി: ${dailyData.tithi.nameMl} (${dailyData.tithi.pakshaMl})\nനക്ഷത്രം: ${dailyData.nakshatra.nameMl} (പാദം ${dailyData.nakshatra.pada})\nസൂര്യോദയം: ${dailyData.sunrise} | സൂര്യാസ്തമയം: ${dailyData.sunset}\nരാഹുകാലം: ${dailyData.inauspiciousTimings.rahuKalam.formatted}\nഗുളികകാലം: ${dailyData.inauspiciousTimings.gulikaKalam.formatted}\nയമഗണ്ഡം: ${dailyData.inauspiciousTimings.yamagandam.formatted}`;
                  copyToClipboard(summary, "Panchangam Summary");
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer"
                title="Copy Panchangam Text"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5 Limbs of Panchangam (പഞ്ചാംഗം 5 അംഗങ്ങൾ) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* 1. Vara (വാരം) */}
            <div className="glass-card p-4 rounded-2xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                <span className="font-bold">1. വാരം (VARA)</span>
                <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
                  {dailyData.vara.nameSkt}
                </span>
              </div>
              <div className="text-lg font-black text-white font-sans">
                {dailyData.vara.nameMl}
              </div>
              <div className="text-xs text-slate-300 font-sans">
                അധിപൻ: <span className="text-amber-300 font-bold">{dailyData.vara.rulingPlanet}</span>
              </div>
            </div>

            {/* 2. Tithi (തിഥി) */}
            <div className="glass-card p-4 rounded-2xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span className="font-bold">2. തിഥി (TITHI)</span>
                <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
                  {dailyData.tithi.paksha}
                </span>
              </div>
              <div className="text-lg font-black text-white font-sans">
                {dailyData.tithi.nameMl}
              </div>
              <div className="text-xs text-slate-300 font-sans">
                {dailyData.tithi.pakshaMl}
              </div>
              <div className="text-[10px] font-mono text-purple-200/70">
                അവസാനം: <span className="text-white font-bold">{dailyData.tithi.endTime}</span>
              </div>
            </div>

            {/* 3. Nakshatra (നക്ഷത്രം) */}
            <div className="glass-card p-4 rounded-2xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                <span className="font-bold">3. നക്ഷത്രം (NAKSHATRAM)</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  പാദം {dailyData.nakshatra.pada}
                </span>
              </div>
              <div className="text-lg font-black text-white font-sans">
                {dailyData.nakshatra.nameMl}
              </div>
              <div className="text-xs text-slate-300 font-sans">
                {dailyData.nakshatra.nameEn} • അധിപൻ: <span className="text-amber-300 font-bold">{dailyData.nakshatra.rulingPlanet}</span>
              </div>
              <div className="text-[10px] font-mono text-purple-200/70">
                അവസാനം: <span className="text-white font-bold">{dailyData.nakshatra.endTime}</span>
              </div>
            </div>

            {/* 4. Yoga (യോഗം) */}
            <div className="glass-card p-4 rounded-2xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-300">
                <span className="font-bold">4. യോഗം (YOGA)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dailyData.yoga.isAuspicious ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" : "bg-rose-500/20 text-rose-200 border-rose-400/30"}`}>
                  {dailyData.yoga.isAuspicious ? "ശുഭം" : "അശുഭം"}
                </span>
              </div>
              <div className="text-lg font-black text-white font-sans">
                {dailyData.yoga.nameMl}
              </div>
              <div className="text-xs text-slate-300 font-sans">
                {dailyData.yoga.nameEn} ({dailyData.yoga.meaning})
              </div>
            </div>

            {/* 5. Karana (കരണം) */}
            <div className="glass-card p-4 rounded-2xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-pink-300">
                <span className="font-bold">5. കരണം (KARANA)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dailyData.karana.isAuspicious ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" : "bg-rose-500/20 text-rose-200 border-rose-400/30"}`}>
                  {dailyData.karana.isAuspicious ? "ശുഭം" : "അശുഭം"}
                </span>
              </div>
              <div className="text-lg font-black text-white font-sans">
                {dailyData.karana.nameMl}
              </div>
              <div className="text-xs text-slate-300 font-sans">
                ദേവത: <span className="text-pink-300 font-bold">{dailyData.karana.rulingDeity}</span>
              </div>
            </div>
          </div>

          {/* Timings: Solar, Inauspicious & Auspicious Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Solar Timings (സൂര്യോദയ - സൂര്യാസ്തമയ കണക്കുകൂട്ടൽ) */}
            <div className="glass-card p-5 rounded-2xl border border-white/15 bg-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-white font-sans">സൂര്യോദയ & അസ്തമയ കണക്ക്</h3>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  NOAA ALGORITHM
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-xs text-purple-200">സൂര്യോദയം (Sunrise)</span>
                  <span className="text-sm font-mono font-bold text-amber-300">{dailyData.sunrise}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-xs text-purple-200">സൂര്യാസ്തമയം (Sunset)</span>
                  <span className="text-sm font-mono font-bold text-orange-300">{dailyData.sunset}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-xs text-purple-200">ഉച്ച സമയം (Solar Noon)</span>
                  <span className="text-sm font-mono font-bold text-yellow-200">{dailyData.solarNoon}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                  <span className="text-xs text-purple-200">പകൽ ദൈർഘ്യം (Day Length)</span>
                  <span className="text-sm font-mono font-bold text-slate-200">{dailyData.dayDuration}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl text-xs text-amber-200/90 leading-relaxed">
                തിരഞ്ഞെടുത്ത സ്ഥലം: <span className="font-bold text-white">{currentLocation.nameMl}</span> ({currentLocation.lat.toFixed(2)}° N, {currentLocation.lng.toFixed(2)}° E). കൃത്യമായ അക്ഷാംശ രേഖാംശ വ്യതിയാനം അനുസരിച്ച് കണക്കാക്കിയത്.
              </div>
            </div>

            {/* Inauspicious Periods (അശുഭ കാലങ്ങൾ) */}
            <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-sm text-white font-sans">അശുഭ കാലങ്ങൾ (വർജ്ജ്യങ്ങൾ)</h3>
                </div>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-400/30">
                  വർജ്ജ്യം
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-200">രാഹുകാലം (Rahu Kalam)</div>
                    <div className="text-[10px] text-rose-300/70">ശുഭകാര്യങ്ങൾ ആരംഭിക്കാൻ പാടില്ല</div>
                  </div>
                  <span className="text-sm font-mono font-black text-rose-200">
                    {dailyData.inauspiciousTimings.rahuKalam.formatted}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-200">ഗുളികകാലം (Gulika Kalam)</div>
                    <div className="text-[10px] text-amber-300/70">മന്ദൻ്റെ കാലം (സാധാരണ പണികൾ ചെയ്യാം)</div>
                  </div>
                  <span className="text-sm font-mono font-black text-amber-200">
                    {dailyData.inauspiciousTimings.gulikaKalam.formatted}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-purple-200">യമഗണ്ഡം (Yamagandam)</div>
                    <div className="text-[10px] text-purple-300/70">ഗുരുവിൻ്റെ അശുഭ കാലഘട്ടം</div>
                  </div>
                  <span className="text-sm font-mono font-black text-purple-200">
                    {dailyData.inauspiciousTimings.yamagandam.formatted}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs text-purple-200">
                  <span>ദുർമുഹൂർത്തം (Durmuhurtham)</span>
                  <span className="font-mono font-bold text-rose-300">
                    {dailyData.inauspiciousTimings.durmuhurtham.formatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Auspicious Timings (ശുഭ കാലങ്ങൾ & മുഹൂർത്തങ്ങൾ) */}
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white font-sans">ശുഭ കാലങ്ങൾ (ഉത്തമ മുഹൂർത്തം)</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ഉത്തമം
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-200">അഭിജിത് മുഹൂർത്തം (Abhijit)</div>
                    <div className="text-[10px] text-emerald-300/70">സർവ്വ ദോഷ നിവാരകമായ ഉച്ച മുഹൂർത്തം</div>
                  </div>
                  <span className="text-sm font-mono font-black text-emerald-200">
                    {dailyData.auspiciousTimings.abhijith.formatted}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-cyan-200">ബ്രഹ്മ മുഹൂർത്തം (Brahma)</div>
                    <div className="text-[10px] text-cyan-300/70">പ്രഭാതത്തിനു മുൻപുള്ള ശാന്ത സമയം</div>
                  </div>
                  <span className="text-sm font-mono font-black text-cyan-200">
                    {dailyData.auspiciousTimings.brahmaMuhurtham.formatted}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-amber-200">അമൃത കാലം (Amrit Kalam)</div>
                    <div className="text-[10px] text-amber-300/70">സർവ്വ കാര്യ വിജയ മുഹൂർത്തം</div>
                  </div>
                  <span className="text-sm font-mono font-black text-amber-200">
                    {dailyData.auspiciousTimings.amritKalam.formatted}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs text-purple-200">
                  <span>വിജയ മുഹൂർത്തം (Vijay)</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {dailyData.auspiciousTimings.vijayMuhurtham.formatted}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: VASTHU SHASTRA MUHURTHAM (വാസ്തു മുഹൂർത്തം)
         ========================================================================= */}
      {activeSubTab === "panchangam_muhurtham" && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/20 bg-gradient-to-br from-[#1a0826]/90 to-[#0e021a]/90 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 uppercase">
                  VASTHU SHASTRA EVALUATION
                </span>
                <h2 className="text-xl font-black text-white font-sans mt-1 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>നിർമ്മാണ പ്രവർത്തനങ്ങൾക്കുള്ള വാസ്തു ശുദ്ധി പരിശോധന</span>
                </h2>
                <p className="text-xs text-purple-200/70 mt-0.5">
                  തീയതി: <span className="text-white font-bold">{selectedDate.toLocaleDateString("en-IN", { dateStyle: "long" })}</span> ({dailyData.eras.kollamFormattedMl})
                </p>
              </div>

              {/* Vasthu Suitability Badge & Score */}
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-purple-300">VASTU SCORE</div>
                  <div className="text-2xl font-mono font-black text-amber-300">
                    {dailyData.vasthuEvaluation.score}%
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                  dailyData.vasthuEvaluation.status === "EXCELLENT"
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                    : dailyData.vasthuEvaluation.status === "FAVORABLE"
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/40"
                    : dailyData.vasthuEvaluation.status === "NEUTRAL"
                    ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                    : "bg-rose-500/20 text-rose-200 border-rose-400/40"
                }`}>
                  {dailyData.vasthuEvaluation.status}
                </div>
              </div>
            </div>

            {/* Verdict Headline */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-white font-sans">
                  {dailyData.vasthuEvaluation.titleMl}
                </div>
                <div className="text-xs text-amber-200/80 mt-0.5 font-sans">
                  {dailyData.vasthuEvaluation.titleEn}
                </div>
              </div>
            </div>

            {/* Core Civil & Construction Operations Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${dailyData.vasthuEvaluation.bhoomiPoojaAllowed ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200" : "bg-rose-950/30 border-rose-500/40 text-rose-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs font-mono">1. ഭൂമി പൂജ (BHOOMI POOJA)</span>
                  {dailyData.vasthuEvaluation.bhoomiPoojaAllowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-sm font-bold text-white">
                  {dailyData.vasthuEvaluation.bhoomiPoojaAllowed ? "ഉചിതമാണ് (Permitted)" : "ഒഴിവാക്കുക (Avoid)"}
                </div>
                <div className="text-[11px] opacity-80 mt-1">
                  നിർമ്മാണാരംഭത്തിനു ഭൂമി വണങ്ങൽ
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${dailyData.vasthuEvaluation.foundationStoneAllowed ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200" : "bg-rose-950/30 border-rose-500/40 text-rose-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs font-mono">2. തറക്കല്ലിടൽ (FOUNDATION)</span>
                  {dailyData.vasthuEvaluation.foundationStoneAllowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-sm font-bold text-white">
                  {dailyData.vasthuEvaluation.foundationStoneAllowed ? "ശുഭകരം (Favorable)" : "മറ്റൊരു ദിനം തിരഞ്ഞെടുക്കുക"}
                </div>
                <div className="text-[11px] opacity-80 mt-1">
                  പ്രാഥമിക ശിലാസ്ഥാപന കർമ്മം
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${dailyData.vasthuEvaluation.grihapraveshamAllowed ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200" : "bg-white/5 border-white/10 text-purple-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs font-mono">3. ഗൃഹപ്രവേശം (HOUSE WARMING)</span>
                  {dailyData.vasthuEvaluation.grihapraveshamAllowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div className="text-sm font-bold text-white">
                  {dailyData.vasthuEvaluation.grihapraveshamAllowed ? "ഉത്തമ ദിനം (Excellent)" : "പ്രത്യേക മുഹൂർത്തം കുറിക്കുക"}
                </div>
                <div className="text-[11px] opacity-80 mt-1">
                  പുതിയ വീട്ടിലേക്കുള്ള താമസം
                </div>
              </div>
            </div>

            {/* Reasons & Astrological Factors */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
                കാരണങ്ങളും തച്ചുശാസ്ത്ര സൂചനകളും (VASTHU FACTORS)
              </h4>
              <div className="space-y-2">
                {dailyData.vasthuEvaluation.reasonsMl.map((reason, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 text-xs text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Directions & Best Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">
                  ഉത്തമ ദിക്കുകൾ (FAVORABLE DIRECTIONS)
                </span>
                <div className="text-sm font-bold text-amber-200">
                  {dailyData.vasthuEvaluation.recommendedDirections.join(" • ")}
                </div>
                <p className="text-[11px] text-purple-200/70">
                  തറക്കല്ലിടുമ്പോൾ ഈശാന കോണിൽ (വടക്കുകിഴക്ക്) ആദ്യശില സ്ഥാപിക്കുന്നത് ഉത്തമം.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">
                  ഉത്തമ സമയപരിധി (BEST TIME WINDOW)
                </span>
                <div className="text-sm font-bold text-emerald-300">
                  {dailyData.vasthuEvaluation.bestTimeWindow} (അഭിജിത് മുഹൂർത്തം)
                </div>
                <p className="text-[11px] text-purple-200/70">
                  രാഹുകാലം ({dailyData.inauspiciousTimings.rahuKalam.formatted}) പൂർണ്ണമായും ഒഴിവാക്കുക.
                </p>
              </div>
            </div>

            {/* Direct Link to Vasthu Calculators */}
            {onNavigate && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white font-sans">
                    തച്ചുശാസ്ത്ര കോൽവിരൽ കണക്കുകൾ പരിശോധിക്കാൻ ആഗ്രഹിക്കുന്നുവോ?
                  </div>
                  <div className="text-xs text-purple-200/80 font-sans">
                    ആയം, വ്യയം, യോനി, നക്ഷത്രം, പ്രായം, ചതുർമാന ചുറ്റളവ് കാൽക്കുലേറ്ററിലേക്ക് നേരിട്ട് പോകുക.
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("vasthu", "calculator")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <span>വാസ്തു കാൽക്കുലേറ്റർ തുറക്കുക</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: FESTIVALS & HOLIDAYS DIRECTORY (വിശേഷ ദിവസങ്ങൾ & അവധികൾ)
         ========================================================================= */}
      {activeSubTab === "panchangam_festivals" && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/20 bg-[#140520]/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white font-sans flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>കേരളത്തിലെ വിശേഷ ദിവസങ്ങളും പൊതു അവധികളും</span>
                </h2>
                <p className="text-xs text-purple-200/70 mt-0.5">
                  ഓണം, വിഷു, ദേശീയ ദിനങ്ങൾ, സർക്കാർ ഗസറ്റ് അവധികൾ, വ്രത ദിനങ്ങൾ & വിശേഷങ്ങൾ
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFestivalCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    festivalCategoryFilter === "all"
                      ? "bg-amber-500 text-slate-950"
                      : "bg-white/10 text-purple-200 hover:bg-white/15"
                  }`}
                >
                  എല്ലാം ({SPECIAL_DAYS_DATABASE.length})
                </button>
                <button
                  onClick={() => setFestivalCategoryFilter("govt")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    festivalCategoryFilter === "govt"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-white/10 text-purple-200 hover:bg-white/15"
                  }`}
                >
                  സർക്കാർ അവധികൾ
                </button>
                <button
                  onClick={() => setFestivalCategoryFilter("national")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    festivalCategoryFilter === "national"
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-white/10 text-purple-200 hover:bg-white/15"
                  }`}
                >
                  ദേശീയ ദിനങ്ങൾ
                </button>
                <button
                  onClick={() => setFestivalCategoryFilter("hindu")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    festivalCategoryFilter === "hindu"
                      ? "bg-orange-500 text-slate-950"
                      : "bg-white/10 text-purple-200 hover:bg-white/15"
                  }`}
                >
                  ഹൈന്ദവം
                </button>
                <button
                  onClick={() => setFestivalCategoryFilter("christian")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    festivalCategoryFilter === "christian"
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-purple-200 hover:bg-white/15"
                  }`}
                >
                  ക്രൈസ്തവം
                </button>
                <button
                  onClick={() => setFestivalCategoryFilter("muslim")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    festivalCategoryFilter === "muslim"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-white/10 text-purple-200 hover:bg-white/15"
                  }`}
                >
                  ഇസ്ലാമികം
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-3" />
              <input
                type="text"
                value={festivalSearchQuery}
                onChange={(e) => setFestivalSearchQuery(e.target.value)}
                placeholder="ഉത്സവങ്ങൾ അല്ലെങ്കിൽ വിശേഷ ദിനങ്ങൾ തിരയുക (ഉദാ: Onam, വിഷു, റിപ്പബ്ലിക് ദിനം)..."
                className="w-full bg-[#0e021a] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/20 focus:border-amber-400 focus:outline-none placeholder-purple-300/40"
              />
            </div>

            {/* Festival Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFestivals.map((fest) => (
                <div
                  key={fest.id}
                  className="glass-card p-4 rounded-2xl border border-white/15 bg-white/5 space-y-2 hover:border-amber-400/40 transition hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {fest.dateFormatted}
                    </span>
                    {fest.isPublicHoliday && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9.5px] font-mono font-bold">
                        PUBLIC HOLIDAY
                      </span>
                    )}
                  </div>

                  <div className="text-base font-black text-white font-sans">
                    {fest.nameMl}
                  </div>
                  <div className="text-xs text-purple-200/80 font-sans">
                    {fest.nameEn}
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1 border-t border-white/10">
                    {fest.descriptionMl || fest.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 5: CHOGHADIYA & TIMINGS (ചോഘടിയ & ശുഭ സമയങ്ങൾ)
         ========================================================================= */}
      {activeSubTab === "panchangam_choghadiya" && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/20 bg-[#140520]/80 space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 uppercase">
                DAYTIME CHOGHADIYA PANCHANGAM
              </span>
              <h2 className="text-xl font-black text-white font-sans mt-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>ദിവസേനയുള്ള ചോഘടിയ മുഹൂർത്തങ്ങൾ</span>
              </h2>
              <p className="text-xs text-purple-200/70 mt-0.5">
                സൂര്യോദയം മുതൽ അസ്തമയം വരെയുള്ള 8 ഭാഗങ്ങളാക്കിയ ശുഭ-അശുഭ ഘട്ടങ്ങൾ ({dailyData.sunrise} – {dailyData.sunset})
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dailyData.choghadiya.map((chog, idx) => {
                const isBest = chog.type === "Best";
                const isGood = chog.type === "Good";
                const isNeutral = chog.type === "Neutral";
                const isBad = chog.type === "Bad";
                const isWorst = chog.type === "Worst";

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isBest
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-950/40"
                        : isGood
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200"
                        : isNeutral
                        ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                        : isBad
                        ? "bg-orange-950/30 border-orange-500/40 text-orange-200"
                        : "bg-rose-950/40 border-rose-500/50 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                      <span>ഘട്ടം {idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 uppercase">
                        {chog.type}
                      </span>
                    </div>

                    <div className="text-lg font-black text-white font-sans">
                      {chog.nameMl}
                    </div>
                    <div className="text-xs opacity-80 font-sans">
                      {chog.nameEn} • ഗ്രഹം: {chog.rulingPlanet}
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 font-mono text-xs font-bold text-white">
                      {chog.timeRange}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
