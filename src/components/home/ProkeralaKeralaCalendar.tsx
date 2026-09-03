import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Info,
  Check,
  Share2,
} from "lucide-react";
import {
  getProkeralaDayData,
  getProkeralaMonthData,
  PROKERALA_MONTHS,
  ProkeralaDayRecord,
} from "../../utils/prokeralaCalendarData";
import {
  getAstrologyForDate,
  getSpecialDayForDate,
  MONTHS_CONFIG,
  MALAYALAM_MONTHS,
  toMalayalamNumerals,
} from "../../utils/keralaCalendarData";

interface ProkeralaKeralaCalendarProps {
  initialYear?: number;
  initialMonthIndex?: number;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export const ProkeralaKeralaCalendar: React.FC<ProkeralaKeralaCalendarProps> = ({
  initialYear = 2026,
  initialMonthIndex = 8, // September
  selectedDate: externalSelectedDate,
  onSelectDate: externalOnSelectDate,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialMonthIndex);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(
    externalSelectedDate || new Date(2026, 8, 2) // Default Sep 2, 2026
  );
  const [language, setLanguage] = useState<"ml" | "en">("ml");
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const selectedDate = externalSelectedDate || internalSelectedDate;

  const handleSelectDate = (date: Date) => {
    setInternalSelectedDate(date);
    if (externalOnSelectDate) {
      externalOnSelectDate(date);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const target = new Date(2026, 8, 2);
    setCurrentYear(2026);
    setCurrentMonthIndex(8);
    handleSelectDate(target);
  };

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const firstDayWeekday = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sunday
  }, [currentYear, currentMonthIndex]);

  // Prokerala Month metadata
  const monthData = useMemo(() => {
    return getProkeralaMonthData(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  const monthConfig = MONTHS_CONFIG[currentMonthIndex];

  // Selected date astrology & special info
  const selectedAstrology = useMemo(() => {
    return getAstrologyForDate(selectedDate);
  }, [selectedDate]);

  const selectedProkeralaDay = useMemo(() => {
    return getProkeralaDayData(selectedDate);
  }, [selectedDate]);

  const selectedSpecialDay = useMemo(() => {
    return getSpecialDayForDate(selectedDate);
  }, [selectedDate]);

  // Copy day details
  const handleCopyDetails = () => {
    const text =
      `📅 കേരള പഞ്ചാംഗം (${selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })})\n` +
      `🌴 കൊല്ലവർഷം: ${selectedAstrology.kollavarshamMonthMl} ${selectedAstrology.kollavarshamDay} (${selectedAstrology.kollavarshamYear})\n` +
      `⭐ നക്ഷത്രം: ${selectedProkeralaDay?.nakshatra || selectedAstrology.nakshatraDetailMl}\n` +
      `🌙 തിഥി: ${selectedProkeralaDay?.tithi || selectedAstrology.thithiDetailMl}\n` +
      `🌅 സൂര്യോദയം: ${selectedAstrology.sunrise} | സൂര്യാസ്തമയം: ${selectedAstrology.sunset}\n` +
      `⏱️ രാഹുകാലം: ${selectedAstrology.rahuKalam}\n` +
      `⏱️ ഗുളികകാലം: ${selectedAstrology.gulikaKalam}\n` +
      (selectedProkeralaDay?.festival ? `🚩 വിശേഷം: ${selectedProkeralaDay.festival}\n` : "") +
      `🔗 Prokerala Calendar Source: https://www.prokerala.com/general/calendar/`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast("പഞ്ചാംഗ വിവരങ്ങൾ പകർത്തി!");
      setTimeout(() => setCopiedToast(null), 3000);
    }
  };

  const WEEKDAY_HEADERS = [
    { ml: "ഞായർ", en: "SUN", isSunday: true },
    { ml: "തിങ്കൾ", en: "MON", isSunday: false },
    { ml: "ചൊവ്വ", en: "TUE", isSunday: false },
    { ml: "ബുധൻ", en: "WED", isSunday: false },
    { ml: "വ്യാഴം", en: "THU", isSunday: false },
    { ml: "വെള്ളി", en: "FRI", isSunday: false },
    { ml: "ശനി", en: "SAT", isSunday: false },
  ];

  const MONTH_NAMES_ML = [
    "ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ",
    "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ",
  ];

  return (
    <div className="space-y-4" id="prokerala-kerala-calendar">
      {/* =========================================================================
          PROKERALA HEADER BAR (Exact styling: Slate header, Month-Year, Kollam Era)
         ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600/60 text-white shadow-xl overflow-hidden">
        {/* Top bar with Prokerala Link & Reference Badge */}
        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200 font-sans tracking-wide">
              ഔദ്യോഗിക കേരള പഞ്ചാംഗം & കലണ്ടർ (Official Kerala Calendar)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.prokerala.com/general/calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-300 hover:text-amber-200 hover:underline bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
              title="Open official reference in new tab"
            >
              <span>prokerala.com/general/calendar</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] font-bold border border-slate-600 transition-colors cursor-pointer"
            >
              ഇന്ന് (Today)
            </button>
          </div>
        </div>

        {/* Main Header with Navigation, Month Name, Kollam Era & Selectors */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Prev/Next Buttons + Big Month Name + Kollam Era Subtitle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-600 border border-slate-600 text-white transition-all cursor-pointer shadow-md"
              title="മുൻ മാസം (Previous Month)"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-white">
                  {language === "ml"
                    ? `${MONTH_NAMES_ML[currentMonthIndex]} - ${currentYear}`
                    : `${monthConfig.nameEn} - ${currentYear}`}
                </h2>
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 font-sans mt-0.5 flex items-center gap-1.5">
                <span>{monthData?.kollamHeaderMl || monthConfig.kollamRangeMl}</span>
                <span className="text-slate-400 font-mono">•</span>
                <span className="text-emerald-300 font-mono text-xs">
                  {monthData ? `കൊല്ലവർഷം ${monthData.kollamYear}` : `1202 ME`}
                </span>
              </div>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-600 border border-slate-600 text-white transition-all cursor-pointer shadow-md"
              title="അടുത്ത മാസം (Next Month)"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Selectors for Month, Year & Language */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Dropdown */}
            <select
              value={currentMonthIndex}
              onChange={(e) => setCurrentMonthIndex(Number(e.target.value))}
              className="bg-slate-800 border border-slate-600 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {MONTH_NAMES_ML.map((name, idx) => (
                <option key={name} value={idx}>
                  {name} ({MONTHS_CONFIG[idx].nameEn})
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-slate-800 border border-slate-600 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            {/* Language Switcher */}
            <div className="flex rounded-xl bg-slate-800 border border-slate-600 p-0.5">
              <button
                onClick={() => setLanguage("ml")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === "ml"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                മലയാളം
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CALENDAR GRID TABLE (7 Columns, Clean white/light cards, Exact Prokerala Layout)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden">
        {/* Table Header: Sunday (Red) through Saturday */}
        <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-100/90 text-center font-bold">
          {WEEKDAY_HEADERS.map((day, idx) => (
            <div
              key={idx}
              className={`py-2.5 sm:py-3 px-1 border-r border-slate-200 last:border-r-0 ${
                day.isSunday ? "text-red-600 bg-red-50/50" : "text-slate-700"
              }`}
            >
              <div className="text-xs sm:text-base font-black font-sans leading-tight">
                {language === "ml" ? day.ml : day.en}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 hidden sm:block">
                {language === "ml" ? day.en : day.ml}
              </div>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 bg-slate-200 gap-[1px]">
          {/* Leading empty offset cells */}
          {Array.from({ length: firstDayWeekday }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[105px] sm:min-h-[125px] bg-slate-50/60 p-2 border-r border-slate-200 last:border-r-0 opacity-40"
            />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const cellDate = new Date(currentYear, currentMonthIndex, dayNum);
            const dayOfWeek = cellDate.getDay();
            const isSunday = dayOfWeek === 0;

            // Retrieve Prokerala day record
            const prokeralaData: ProkeralaDayRecord | null =
              getProkeralaDayData(cellDate) ||
              (monthData ? monthData.days.find((d) => d.gregorianDay === dayNum) || null : null);

            // Fallback to astrology data if day record is not hardcoded
            const fallbackAstro = getAstrologyForDate(cellDate);
            const fallbackSpecial = getSpecialDayForDate(cellDate);

            const kollamDay = prokeralaData ? prokeralaData.kollamDay : fallbackAstro.kollavarshamDay;
            const isFirstOfMalayalamMonth =
              prokeralaData?.kollamMonthName !== undefined ||
              kollamDay === 1 ||
              (fallbackAstro.kollavarshamDay === 1 && !prokeralaData);

            const malayalamMonthName =
              prokeralaData?.kollamMonthName ||
              (kollamDay === 1 ? fallbackAstro.kollavarshamMonthMl : undefined);

            const tithiStr = prokeralaData ? prokeralaData.tithi : fallbackAstro.thithiDetailMl;
            const nakshatraStr = prokeralaData ? prokeralaData.nakshatra : fallbackAstro.nakshatraDetailMl;

            const festival = prokeralaData?.festival || fallbackSpecial?.nameMl;
            const isBankHoliday = prokeralaData?.isBankHoliday || fallbackSpecial?.isBankHoliday;
            const isPublicHoliday = prokeralaData?.isPublicHoliday || fallbackSpecial?.isPublicHoliday || isSunday;

            const moonPhase = prokeralaData?.moonPhase ||
              (fallbackAstro.isAmavasi ? "amavasi" : fallbackAstro.isPournami ? "pournami" : undefined);

            const isSelected =
              selectedDate.getFullYear() === currentYear &&
              selectedDate.getMonth() === currentMonthIndex &&
              selectedDate.getDate() === dayNum;

            const isToday =
              currentYear === 2026 && currentMonthIndex === 8 && dayNum === 2;

            return (
              <button
                key={`cell-${dayNum}`}
                onClick={() => handleSelectDate(cellDate)}
                className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2.5 text-left transition-all relative flex flex-col justify-between cursor-pointer focus:outline-none ${
                  // Festive/holiday cells receive pale yellow tint like official Prokerala
                  festival || isBankHoliday
                    ? "bg-[#fffde7] hover:bg-[#fff9c4]"
                    : isSunday
                    ? "bg-red-50/20 hover:bg-red-50/50"
                    : "bg-white hover:bg-slate-50"
                } ${
                  isSelected
                    ? "ring-2 ring-inset ring-blue-600 bg-blue-50/30 z-10 shadow-md"
                    : ""
                }`}
              >
                {/* 1. TOP ROW: Moon Icon (Left) & Tithi with Duration (Right) */}
                <div className="flex items-center justify-between gap-1 leading-none">
                  <div>
                    {moonPhase === "amavasi" && (
                      <span
                        className="inline-flex items-center text-xs font-bold text-slate-900"
                        title="അമാവാസി (New Moon / കറുത്ത വാവ്)"
                      >
                        ⚫
                      </span>
                    )}
                    {moonPhase === "pournami" && (
                      <span
                        className="inline-flex items-center text-xs font-bold text-amber-500"
                        title="പൗർണ്ണമി (Full Moon / വെളുത്ത വാവ്)"
                      >
                        ⚪
                      </span>
                    )}
                  </div>

                  {/* Tithi & Duration (e.g. ചതുർത്ഥി 3-32) */}
                  <div
                    className="text-[9px] sm:text-[10px] text-slate-600 font-sans truncate font-medium text-right"
                    title={tithiStr}
                  >
                    {tithiStr}
                  </div>
                </div>

                {/* 2. CENTER SECTION: Big Gregorian Date + Small Red Kollam Date + Month Name on 1st */}
                <div className="my-auto py-1 flex items-baseline justify-center gap-1.5 relative">
                  {/* Big bold English Gregorian Date */}
                  <span
                    className={`text-xl sm:text-3xl font-black font-sans leading-none ${
                      isSunday || isPublicHoliday ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Small RED Kollam Date */}
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs sm:text-sm font-black text-red-600 font-sans">
                      {kollamDay}
                    </span>

                    {/* Special Prokerala Feature: Malayalam Month name shown on Day 1 */}
                    {isFirstOfMalayalamMonth && malayalamMonthName && (
                      <span className="text-[10px] sm:text-[11px] font-black text-red-600 font-sans mt-0.5 leading-none">
                        {malayalamMonthName}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. BOTTOM SECTION: Nakshatra with duration + Festival/Holiday & BH */}
                <div className="space-y-0.5 leading-tight">
                  {/* Nakshatra Line (e.g. അശ്വതി 51-1) */}
                  <div
                    className="text-[9px] sm:text-[10.5px] font-bold text-slate-700 font-sans truncate"
                    title={nakshatraStr}
                  >
                    {nakshatraStr}
                  </div>

                  {/* Festival / Holiday Title & Red BH Badge */}
                  {festival && (
                    <div
                      className="text-[8.5px] sm:text-[10px] font-bold text-red-700 font-sans truncate flex items-center gap-1"
                      title={festival}
                    >
                      {isBankHoliday && (
                        <span className="px-1 py-0.2 bg-red-600 text-white rounded text-[8px] font-black font-mono">
                          BH
                        </span>
                      )}
                      <span className="truncate">{festival}</span>
                    </div>
                  )}

                  {!festival && isBankHoliday && (
                    <div className="text-[8.5px] font-bold text-red-600 font-mono">
                      [BH] ബാങ്ക് അവധി
                    </div>
                  )}

                  {isToday && (
                    <div className="text-[8px] font-black font-mono text-emerald-700 bg-emerald-100/90 px-1 rounded text-center">
                      ഇന്ന് (TODAY)
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            PROKERALA FOOTER CAPTION / LEGEND (Exact text from prokerala.com)
           ========================================================================= */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-300 text-[11px] sm:text-xs text-slate-700 font-sans flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5 font-medium leading-relaxed">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-slate-900">
                • Big bold numbers:
              </span>
              <span>English date</span>
              <span className="text-slate-400">|</span>
              <span className="font-bold text-red-600">
                • Small number in red color:
              </span>
              <span>Kolla Varsham date</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600 text-[10.5px]">
              <span>
                • <strong className="text-slate-800">Bottom text line 1:</strong> Day's nakshatra with duration Nazika-Vinazhika
              </span>
              <span className="text-slate-400">|</span>
              <span>
                • <strong className="text-slate-800">Bottom text line 2:</strong> Tithi & its duration (വിനാഴിക)
              </span>
              <span className="text-slate-400">|</span>
              <span>
                • <strong className="text-red-700">[BH]:</strong> Bank Holiday
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.prokerala.com/general/calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1"
            >
              <span>സ്രോതസ്സ്: prokerala.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SELECTED DAY ASTROLOGICAL INSPECTOR CARD
         ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>തിരഞ്ഞെടുത്ത ദിവസത്തെ പഞ്ചാംഗ വിവരങ്ങൾ (Selected Day Details)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black font-sans text-white mt-1">
              {selectedDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              കൊല്ലവർഷം: {selectedAstrology.kollavarshamMonthMl} {selectedAstrology.kollavarshamDay}, {selectedAstrology.kollavarshamYear} • ശകവർഷം: {selectedAstrology.sakaYear}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDetails}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>പങ്കിടുക / Share</span>
            </button>
          </div>
        </div>

        {/* Astrological Panchangam Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Nakshatra */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-amber-400 font-mono font-bold text-[10px] uppercase">
              നക്ഷത്രം / NAKSHATRA
            </div>
            <div className="text-sm font-black text-white font-sans mt-0.5">
              {selectedProkeralaDay?.nakshatra || selectedAstrology.nakshatraDetailMl}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              അധിപൻ: {selectedAstrology.nakshatraEn}
            </div>
          </div>

          {/* Tithi */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-sky-400 font-mono font-bold text-[10px] uppercase">
              തിഥി / TITHI
            </div>
            <div className="text-sm font-black text-white font-sans mt-0.5">
              {selectedProkeralaDay?.tithi || selectedAstrology.thithiDetailMl}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {selectedAstrology.pakshamMl}
            </div>
          </div>

          {/* Sunrise & Sunset */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-orange-400 font-mono font-bold text-[10px] uppercase">
              സൂര്യോദയം / അസ്തമയം
            </div>
            <div className="text-sm font-black text-white font-sans mt-0.5">
              {selectedAstrology.sunrise} / {selectedAstrology.sunset}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              തിരുവനന്തപുരം സമയം
            </div>
          </div>

          {/* Rahu Kalam */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-rose-400 font-mono font-bold text-[10px] uppercase">
              രാഹുകാലം / RAHU KALAM
            </div>
            <div className="text-sm font-black text-white font-sans mt-0.5">
              {selectedAstrology.rahuKalam}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              ഗുളികൻ: {selectedAstrology.gulikaKalam}
            </div>
          </div>
        </div>

        {/* Special Festival Banner if present */}
        {selectedProkeralaDay?.festival && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-mono font-bold text-amber-300 uppercase block">
                  വിശേഷ ദിവസം (Festival / Observance)
                </span>
                <span className="text-sm font-black text-white font-sans">
                  {selectedProkeralaDay.festival}
                </span>
              </div>
            </div>
            {selectedProkeralaDay.isBankHoliday && (
              <span className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-black font-mono shadow">
                ബാങ്ക് അവധി (BANK HOLIDAY)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Copied Toast Alert */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-2xl font-mono text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{copiedToast}</span>
        </div>
      )}
    </div>
  );
};
