import React, { useState } from "react";
import { MainSectionType, TabType } from "../../types";
import { GoogleAuthenticatorSetupModal } from "../auth/GoogleAuthenticatorSetupModal";
import { SubscriptionRequestsTab } from "./SubscriptionRequestsTab";
import { AllToolsDashboardTab } from "./AllToolsDashboardTab";
import { DataStorageTab } from "./DataStorageTab";
import { useAuth } from "../../context/AuthContext";
import { PRIMARY_ADMIN_EMAILS } from "../../lib/firebase";
import { getOrCreateTotpSecret } from "../../utils/totp";
import { ALL_TOOLS_DATA, TOOL_CATEGORIES } from "../../data/allToolsData";
import { isOnamThemeActive, getOnamRemainingStatus } from "../../utils/onamTheme";
import { getActiveWebsiteTheme, ActiveThemeConfig } from "../../utils/festivalTheme";
import { SpecialDayInfo } from "../../utils/keralaCalendarData";
import { KeralaDigitalClock } from "./KeralaDigitalClock";
import { DynamicFestivalBanner } from "../common/DynamicFestivalBanner";
import {
  OnamToranBanner,
  OnamGreetingHero,
  PookkalamGraphic,
  NilavilakkuGraphic,
  OnamFestiveBadge
} from "../common/OnamFestiveElements";
import {
  Compass,
  Building2,
  MapPin,
  HardHat,
  FolderKanban,
  FileSpreadsheet,
  Ruler,
  Calculator,
  Bot,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  ChevronRight,
  Landmark,
  Flame,
  Globe,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  HelpCircle,
  Briefcase,
  QrCode,
  Smartphone,
  KeyRound,
  Lock,
  Receipt,
  Users,
  LayoutGrid,
  Search,
  ArrowRight,
  HardDrive,
  FileCheck2,
  Calendar as CalendarIcon,
  Image as ImageIcon
} from "lucide-react";
import { PanchangamDashboard } from "../panchangam/PanchangamDashboard";

interface HomePageProps {
  activeTab?: TabType;
  setActiveTab?: (tab: TabType) => void;
  onNavigate: (section: MainSectionType, tab: TabType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ activeTab = "home_overview", setActiveTab, onNavigate }) => {
  const { subscriptionRequests, isPrimaryAdmin } = useAuth();
  const pendingRequestsCount = subscriptionRequests.filter((r) => r.status === "pending").length;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryService, setInquiryService] = useState("Vastu & Architectural Planning");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [overviewCategory, setOverviewCategory] = useState("all");
  const [overviewSearch, setOverviewSearch] = useState("");

  // Dynamic Festival & Special Day Theme State
  const [customThemePreview, setCustomThemePreview] = useState<SpecialDayInfo | null>(null);

  // Compute active theme based on custom preview or today's live date
  const activeThemeConfig: ActiveThemeConfig = customThemePreview
    ? {
        specialDay: customThemePreview,
        themeType: customThemePreview.themeType,
        themeName: customThemePreview.themeName,
        isSpecialDay: true,
        bgHeroGradient: customThemePreview.themeColors.bgGradient,
        containerBorder: customThemePreview.themeColors.border,
        accentText: customThemePreview.themeColors.accent,
        badgeBg: customThemePreview.themeColors.badgeBg,
        badgeText: customThemePreview.themeColors.badgeText,
        greetingEn: customThemePreview.greetingEn,
        greetingMl: customThemePreview.greetingMl,
        iconSymbol: customThemePreview.iconSymbol,
        kasavuBorder: customThemePreview.themeColors.kasavuAccent || "border-amber-400/50",
        decorType: customThemePreview.themeType === "onam" ? "pookkalam_toran" : "standard",
      }
    : getActiveWebsiteTheme();

  // Authenticator 2FA Setup State (Moved to Home Tab)
  const [showAuthSetupModal, setShowAuthSetupModal] = useState(false);
  const [authSetupEmail, setAuthSetupEmail] = useState("deepak.vasthusilpy@gmail.com");
  const [isCustomAuthEmail, setIsCustomAuthEmail] = useState(false);
  const [customAuthEmailInput, setCustomAuthEmailInput] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const effectiveAuthEmail = isCustomAuthEmail
    ? customAuthEmailInput.trim().toLowerCase() || "deepak.vasthusilpy@gmail.com"
    : authSetupEmail;

  const currentSecret = getOrCreateTotpSecret(effectiveAuthEmail);

  const handleCopySecret = () => {
    if (!currentSecret) return;
    navigator.clipboard.writeText(currentSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  const handleOpenInNewWindow = (section: MainSectionType, tab: TabType) => {
    const url = `${window.location.origin}${window.location.pathname}?section=${encodeURIComponent(section)}&tab=${encodeURIComponent(tab)}`;
    window.open(url, "_blank");
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("7012383137@okbizaxis");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    const whatsappText = encodeURIComponent(
      `*New Consultation Inquiry via Vasthusilpy Portal*\n` +
      `👤 *Name:* ${inquiryName}\n` +
      `📞 *Phone:* ${inquiryPhone}\n` +
      `📐 *Service:* ${inquiryService}\n` +
      `📝 *Message:* ${inquiryMessage || "I would like to schedule a consultation with Er. Deepak K."}`
    );

    window.open(`https://wa.me/919747995961?text=${whatsappText}`, "_blank");
    setInquirySuccess(true);
    setTimeout(() => {
      setInquiryName("");
      setInquiryPhone("");
      setInquiryMessage("");
      setInquirySuccess(false);
    }, 4000);
  };

  const SERVICES = [
    {
      title: "തച്ചുശാസ്ത്രം & വാസ്തു കൺസൾട്ടേഷൻ",
      englishTitle: "Traditional Thachu Shastra & Vasthu",
      description:
        "ആയം, വ്യയം, യോനി, ഗുണദോഷ വിചാരം, 2-Side Perimeter Vastu, പദവിന്യാസം അടിസ്ഥാനമാക്കിയുള്ള സമഗ്ര വാസ്തു നിർണ്ണയം.",
      icon: Compass,
      color: "from-cyan-500 to-blue-600",
      accent: "text-cyan-400 border-cyan-800 bg-cyan-950/60",
      linkSection: "vasthu" as MainSectionType,
      linkTab: "calculator" as TabType
    },
    {
      title: "ആർക്കിടെക്ചറൽ പ്ലാനിംഗ് & 3D എലിവേഷൻ",
      englishTitle: "Architectural Plans & 3D Elevations",
      description:
        "ആധുനിക കേരള ശൈലിയിലുള്ള 2D ഫ്ലോർ പ്ലാനുകൾ, 3D ഫോട്ടോറിയലിസ്റ്റിക് എക്സ്റ്റീരിയർ എലിവേഷൻ, ഇന്റീരിയർ ലേഔട്ടുകൾ.",
      icon: Building2,
      color: "from-emerald-500 to-teal-600",
      accent: "text-emerald-400 border-emerald-800 bg-emerald-950/60",
      linkSection: "office_dashboard" as MainSectionType,
      linkTab: "office_crm_projects" as TabType
    },
    {
      title: "കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ & KSMART",
      englishTitle: "KPBR 2019/2024 & KSMART Sanction",
      description:
        "കേരള പഞ്ചായത്ത്/മുനിസിപ്പാലിറ്റി കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (KPBR/KMBR), KSMART ഓൺലൈൻ സബ്മിഷൻ ഡ്രോയിംഗുകൾ, സെറ്റ്ബാക്ക് പരിശോധന.",
      icon: ShieldCheck,
      color: "from-indigo-500 to-purple-600",
      accent: "text-indigo-400 border-indigo-800 bg-indigo-950/60",
      linkSection: "building_rules" as MainSectionType,
      linkTab: "rules_ai_chat" as TabType
    },
    {
      title: "വിശദമായ റേറ്റ് എസ്റ്റിമേറ്റ് & ബാങ്ക് വാല്യുവേഷൻ",
      englishTitle: "Detailed Estimate (BOQ) & Bank Valuation",
      description:
        "കേരള PWD നിരക്കുകൾ പ്രകാരമുള്ള ക്വാണ്ടിറ്റി സർവേ, സ്റ്റേജ് സർട്ടിഫിക്കറ്റ്, കംപ്ലീഷൻ സർട്ടിഫിക്കറ്റ്, എഞ്ചിനീയർ ഒദ്യോഗിക സീൽ സർട്ടിഫിക്കേഷൻ.",
      icon: FileSpreadsheet,
      color: "from-amber-500 to-orange-600",
      accent: "text-amber-400 border-amber-800 bg-amber-950/60",
      linkSection: "estimate" as MainSectionType,
      linkTab: "estimate_dashboard" as TabType
    },
    {
      title: "നിർമ്മാണ പ്രവർത്തനങ്ങൾ & കരാറുകൾ",
      englishTitle: "Construction Works & Legal E-Stamp Agreements",
      description:
        "കെട്ടിട നിർമ്മാണ പ്രോജക്ടുകൾ, 25 ഘട്ട പെയ്‌മെന്റ് ഷെഡ്യൂളുകൾ, ഇ-സ്റ്റാമ്പ് കരാർ പ്രിന്റിംഗ്, സ്പെസിഫിക്കേഷൻ മെട്രിക്സ്, QR വെരിഫിക്കേഷൻ.",
      icon: HardHat,
      color: "from-amber-500 to-emerald-500",
      accent: "text-emerald-400 border-emerald-800 bg-emerald-950/60",
      linkSection: "construction_works" as MainSectionType,
      linkTab: "construction_dashboard" as TabType
    },
    {
      title: "ഡിജിറ്റൽ ലാൻഡ് സർവ്വേ & ഏരിയ കണക്കുകൂട്ടൽ",
      englishTitle: "Digital Land Survey & Area Calculation",
      description:
        "FMB അടിസ്ഥാനമാക്കിയുള്ള അതിർത്തി നിർണ്ണയം, Missing Side Polygon കാൽക്കുലേഷൻ, Heron's Formula പ്ലോട്ട് ഏരിയ, സെന്റ്/ഏക്കർ കൺവേർഷൻ.",
      icon: MapPin,
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-400 border-blue-800 bg-blue-950/60",
      linkSection: "survey" as MainSectionType,
      linkTab: "missing_side" as TabType
    },
    {
      title: "സിവിൽ എഞ്ചിനീയറിംഗ് & BBS ബാർ ബെൻഡിംഗ്",
      englishTitle: "Civil Calculations & IS 2502 BBS Schedules",
      description:
        "ബ്രിക്ക് മെയ്സൺറി, കോൺക്രീറ്റ് ബ്ലോക്കുകൾ, IS 456 PCC/RCC ഗ്രേഡുകൾ, സ്ലാബ്, ബീം, കോളം റീഇൻഫോഴ്‌സ്‌മെന്റ് BBS ഷെഡ്യൂളുകൾ.",
      icon: HardHat,
      color: "from-rose-500 to-pink-600",
      accent: "text-rose-400 border-rose-800 bg-rose-950/60",
      linkSection: "civil" as MainSectionType,
      linkTab: "material_quantity_bbs" as TabType
    }
  ];

  const QUICK_TOOLS = [
    {
      name: "നിർമ്മാണ കരാർ ജനറേറ്റർ",
      subtitle: "E-Stamp Legal Builder Agreement & QR",
      section: "construction_works" as MainSectionType,
      tab: "new_construction" as TabType,
      icon: FileCheck2,
      color: "border-emerald-800 hover:border-emerald-500 bg-emerald-950/30 text-emerald-400"
    },
    {
      name: "തച്ചു ശാസ്ത്ര കാൽക്കുലേറ്റർ",
      subtitle: "Kol, Viral, Aayam, Vyayam & Yoni",
      section: "vasthu" as MainSectionType,
      tab: "calculator" as TabType,
      icon: Calculator,
      color: "border-cyan-800 hover:border-cyan-500 bg-cyan-950/30 text-cyan-400"
    },
    {
      name: "പ്രോജക്ട്സ് CRM & പൈപ്പ്ലൈൻ",
      subtitle: "Active Projects & Activity Log",
      section: "office_dashboard" as MainSectionType,
      tab: "office_crm_projects" as TabType,
      icon: FolderKanban,
      color: "border-emerald-800 hover:border-emerald-500 bg-emerald-950/30 text-emerald-400"
    },
    {
      name: "ഇൻവോയ്‌സ് & പേയ്‌മെന്റുകൾ",
      subtitle: "Billing, Products, Customers & Reports",
      section: "invoices_payments" as MainSectionType,
      tab: "invoices_list" as TabType,
      icon: Receipt,
      color: "border-teal-800 hover:border-teal-500 bg-teal-950/30 text-teal-400"
    },
    {
      name: "ബിൽഡിംഗ് റേറ്റ് എസ്റ്റിമേറ്റർ",
      subtitle: "Item of Work BOQ & Cost Reports",
      section: "estimate" as MainSectionType,
      tab: "estimate_dashboard" as TabType,
      icon: FileSpreadsheet,
      color: "border-amber-800 hover:border-amber-500 bg-amber-950/30 text-amber-400"
    },
    {
      name: "KPBR AI അസിസ്റ്റന്റ്",
      subtitle: "Voice & Text Kerala Building Rules Chatbot",
      section: "building_rules" as MainSectionType,
      tab: "rules_ai_chat" as TabType,
      icon: Bot,
      color: "border-indigo-800 hover:border-indigo-500 bg-indigo-950/30 text-indigo-400"
    },
    {
      name: "ഭൂമി അളവ് & സർവ്വേ",
      subtitle: "Missing Side Calc & Heron's Land Area",
      section: "survey" as MainSectionType,
      tab: "missing_side" as TabType,
      icon: MapPin,
      color: "border-blue-800 hover:border-blue-500 bg-blue-950/30 text-blue-400"
    },
    {
      name: "മെറ്റീരിയൽ & BBS കാൽക്കുലേറ്റർ",
      subtitle: "Brick, Concrete, Block & Rebar Schedules",
      section: "civil" as MainSectionType,
      tab: "material_quantity_bbs" as TabType,
      icon: HardHat,
      color: "border-rose-800 hover:border-rose-500 bg-rose-950/30 text-rose-400"
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden pb-16">
      {/* Background Subtle Twilight Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Onam Festive Hanging Garland (Active upto 30-08-2026) */}
      {isOnamThemeActive() && <OnamToranBanner />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">

        {/* HOME SUB-TABS NAVIGATION BAR */}
        <div className="glass-card border border-white/15 p-2 rounded-3xl flex items-center gap-2 overflow-x-auto shadow-2xl backdrop-blur-2xl">
          <button
            onClick={() => setActiveTab && setActiveTab("home_overview")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "home_overview"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 border border-white/30"
                : "text-purple-200/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>ഹോം & പ്രൊഫൈൽ (Overview)</span>
            {isOnamThemeActive() && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50 text-[10px] font-mono font-bold">
                🌸 ഓണം
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("panchangam_calendar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "panchangam_calendar"
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-950/50 border border-white/30"
                : "text-amber-200/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-amber-300" />
            <span>കേരള പഞ്ചാംഗം & കലണ്ടർ (Kerala Panchangam)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-mono text-[10px] font-bold border border-amber-400/40">
              ചിങ്ങം 1202
            </span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("all_tools")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all_tools"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 border border-white/30"
                : "text-purple-200/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-purple-300" />
            <span>എല്ലാ ടൂളുകളും ({ALL_TOOLS_DATA.length} Tools Dashboard)</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-purple-200 font-mono text-[10px] font-bold border border-white/20">
              {ALL_TOOLS_DATA.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("data_storage")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "data_storage"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 border border-white/30"
                : "text-purple-200/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-300" />
            <span>ഡാറ്റ സ്റ്റോറേജ് (Data Storage & CAD Vault)</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-mono text-[10px] font-bold border border-emerald-400/40">
              CAD / DWG
            </span>
          </button>

          <button
            onClick={() => setActiveTab && setActiveTab("subscription_requests")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "subscription_requests"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-950/50 border border-white/30"
                : "text-purple-200/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>സബ്‌സ്ക്രിപ്ഷൻ അഭ്യർത്ഥനകൾ (Subscription Requests)</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black animate-pulse">
                {pendingRequestsCount} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setShowAuthSetupModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-amber-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap ml-auto"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>2FA Authenticator Setup</span>
          </button>
        </div>

        {activeTab === "data_storage" ? (
          <DataStorageTab />
        ) : activeTab === "subscription_requests" ? (
          <SubscriptionRequestsTab />
        ) : activeTab === "all_tools" ? (
          <AllToolsDashboardTab onNavigate={onNavigate} />
        ) : activeTab === "panchangam_calendar" ? (
          <PanchangamDashboard initialTab="panchangam_calendar" onNavigate={onNavigate} />
        ) : (
          <>
            {/* Dynamic Festival & Special Day Greeting Banner (Auto-adjusts for Onam, Vishu, Republic Day, etc.) */}
            <DynamicFestivalBanner
              themeConfig={activeThemeConfig}
              onResetDefaultTheme={() => setCustomThemePreview(null)}
              isCustomPreview={!!customThemePreview}
            />

            {/* =========================================================================
                1. VASTHUSILPY BUSINESS PROFILE & HERO
               ========================================================================= */}
            <section className={`relative rounded-3xl border shadow-2xl backdrop-blur-xl p-6 sm:p-10 transition-all ${
              activeThemeConfig.isSpecialDay
                ? `${activeThemeConfig.containerBorder} bg-gradient-to-br ${activeThemeConfig.bgHeroGradient}`
                : "border-slate-800 bg-slate-900/90"
            }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Col: Main Business Info */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/90 border border-cyan-800 px-3 py-1 rounded-full">
                  BUILDING CONSULTATION & ENGINEERING
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 border border-emerald-800 px-3 py-1 rounded-full">
                  LSGD KSMART REGISTERED
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/90 border border-amber-800 px-3 py-1 rounded-full">
                  ESTD. KERALASSERY
                </span>
                {activeThemeConfig.isSpecialDay && (
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${activeThemeConfig.badgeText} ${activeThemeConfig.badgeBg} border px-3 py-1 rounded-full flex items-center gap-1`}>
                    <span>{activeThemeConfig.iconSymbol}</span>
                    <span>{activeThemeConfig.themeName.toUpperCase()}</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans uppercase">
                  VASTHUSILPY
                </h1>
                <div className="text-lg sm:text-xl font-bold text-slate-300 font-sans mt-1">
                  Architects, Engineers & Interior Designers
                </div>
                <div className="text-sm font-semibold text-cyan-400 font-sans mt-0.5">
                  വാസ്തുശില്പി - കേരളശ്ശേരി | Er. Deepak K. (Lead Consultant)
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl">
                Vasthusilpy is Kerala’s premier technical engineering and traditional Thachu Shastra consultation firm. We blend centuries-old Vedic architectural principles (Aayam, Vyayam, Yoni calculations) with modern structural engineering, 3D elevation modeling, Kerala Building Rules (KPBR 2019/2024), LSGD KSMART online clearances, and detailed bank valuation estimating.
              </p>

              {/* Direct Contact Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="tel:+919747995961"
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+91 9747995961</span>
                </a>

                <a
                  href="mailto:deepak.vasthusilpy@gmail.com"
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-slate-200 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>deepak.vasthusilpy@gmail.com</span>
                </a>

                <button
                  onClick={handleCopyUpi}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-amber-300 transition-colors cursor-pointer"
                  title="Click to copy official UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedUpi ? "UPI Copied!" : "UPI: 7012383137@okbizaxis"}</span>
                </button>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Keralassery, Palakkad, Kerala - 678641</span>
                </div>
              </div>
            </div>

            {/* Right Col: Quick Stats & Highlights */}
            <div className="lg:col-span-4 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Firm Metrics & Achievements</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl text-center">
                  <div className="text-2xl font-black text-emerald-400 font-mono">15+</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">Years Experience</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl text-center">
                  <div className="text-2xl font-black text-cyan-400 font-mono">50000+</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">Plans Crafted</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl text-center">
                  <div className="text-2xl font-black text-indigo-400 font-mono">100%</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">Kerala Vasthu Complience</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl text-center">
                  <div className="text-2xl font-black text-amber-400 font-mono">1000+</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">Bank Estimate</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Officially licensed for building permit drawings, structural certifications, and stage progress estimates across all Kerala local bodies.</span>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. KERALA TIME DIGITAL CLOCK & PANCHANGAM
           ========================================================================= */}
        <section>
          <KeralaDigitalClock
            onSelectSpecialDay={(specialDay) => {
              setCustomThemePreview(specialDay);
              const banner = document.getElementById("dynamic-festival-hero");
              if (banner) banner.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </section>

        {/* =========================================================================
            3. QUICK TOOL LAUNCHER SUITE (WITH CATEGORIES & LIVE SEARCH)
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                  {ALL_TOOLS_DATA.length} INTEGRATED TOOLS
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                  7 DISCIPLINES
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-sans flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Technical Engineering & Vastu Software Suite</span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                തച്ചുശാസ്ത്രം, കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ, ഡിജിറ്റൽ ലാൻഡ് സർവ്വേ, സിവിൽ എഞ്ചിനീയറിംഗ്, PWD റേറ്റ് എസ്റ്റിമേറ്റ്, CRM, GST ഇൻവോയ്സിംഗ്.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setActiveTab && setActiveTab("data_storage")}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <HardDrive className="w-4 h-4" />
                <span>ഡാറ്റ സ്റ്റോറേജ് (CAD Vault) →</span>
              </button>

              <button
                onClick={() => setActiveTab && setActiveTab("all_tools")}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Full {ALL_TOOLS_DATA.length} Tools Dashboard →</span>
              </button>
            </div>
          </div>

          {/* Quick Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  placeholder="Quick search tools by name or IS standard (e.g. BBS, KPBR, Heron, Setback, GST)..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 pb-1 sm:pb-0 scrollbar-none">
                {TOOL_CATEGORIES.slice(0, 5).map((cat) => {
                  const isSelected = overviewCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setOverviewCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {cat.nameMl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_TOOLS_DATA.filter((tool) => {
              if (overviewCategory !== "all" && tool.category !== overviewCategory) return false;
              if (overviewSearch.trim()) {
                const q = overviewSearch.toLowerCase().trim();
                return (
                  tool.name.toLowerCase().includes(q) ||
                  tool.nameMl.toLowerCase().includes(q) ||
                  tool.englishName.toLowerCase().includes(q) ||
                  tool.standard.toLowerCase().includes(q) ||
                  tool.description.toLowerCase().includes(q)
                );
              }
              return true;
            })
              .slice(0, 9)
              .map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between group hover:border-cyan-500/60 bg-slate-900/90 shadow-md`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40">
                          <Icon className={`w-5 h-5 ${tool.accentColor}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {tool.isAi && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-600 text-[9px] font-mono text-indigo-300 font-bold">
                              AI
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {tool.standard}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-sm font-bold text-white font-sans group-hover:text-cyan-300 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                          {tool.descriptionMl}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onNavigate(tool.section, tool.tab)}
                        className="py-1.5 px-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title={`Open ${tool.name}`}
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenInNewWindow(tool.section, tool.tab)}
                        className="py-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title={`Open in new tab`}
                      >
                        <span>New Tab</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Callout to Dashboard */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white font-sans">
                  Looking for more engineering calculators & tools?
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  Access all 35 tools categorized with Kerala codes, AI assistants, and printable reports in the dedicated dashboard.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab && setActiveTab("all_tools")}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <span>Explore All 35 Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* =========================================================================
            4. COMPREHENSIVE BUSINESS SERVICES GRID
           ========================================================================= */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              OUR SPECIALIZED SERVICES • സേവനങ്ങൾ
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-sans">
              Comprehensive Architectural, Civil & Vastu Services
            </h2>
            <p className="text-xs text-slate-400 font-sans max-w-2xl">
              From traditional Thachu Shastra foundation calculations to modern structural designs and bank valuations, Vasthusilpy delivers end-to-end building consulting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${srv.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white font-sans group-hover:text-cyan-400 transition-colors">
                        {srv.title}
                      </h3>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        {srv.englishTitle}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {srv.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenInNewWindow(srv.linkSection, srv.linkTab)}
                    className="mt-5 w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title={`Open ${srv.englishTitle} in a new tab`}
                  >
                    <span>Open in New Window</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            5. CONSULTATION INQUIRY & CONTACT SECTION
           ========================================================================= */}
        <section
          id="consultation-section"
          className={`rounded-3xl border shadow-2xl backdrop-blur-xl p-6 sm:p-8 transition-all ${
            isOnamThemeActive()
              ? "border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900/95 to-slate-900 shadow-[0_0_40px_rgba(245,158,11,0.06)]"
              : "border-slate-800 bg-slate-900/90"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Office Details & Hours */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-md uppercase">
                    DIRECT CONSULTATION
                  </span>
                  {isOnamThemeActive() && (
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-md">
                      🌸 ഓണം ഓഫർ 2026
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-sans mt-2">
                  Visit or Contact Our Office
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Schedule an in-person or online consultation with Er. Deepak K. for Vastu planning, building permits, or valuation reports.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs text-slate-300">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-white">Office Address:</span>
                  </div>
                  <div className="pl-6 text-slate-300">
                    Vasthusilpy Building Consultations<br />
                    Keralassery, Palakkad District,<br />
                    Kerala, India - PIN 678641
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">Office Working Hours:</span>
                  </div>
                  <div className="pl-6 text-slate-300">
                    Mon - Sat: 9:00 AM - 6:30 PM<br />
                    Sunday: By Prior Appointment
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Phone & WhatsApp:</span>
                  </div>
                  <div className="pl-6 text-slate-300">
                    +91 9747995961 / +91 7012383137
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick WhatsApp Consultation Form */}
            <div className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Send a Quick Consultation Inquiry</span>
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Direct message to Er. Deepak K. on WhatsApp with your project requirements
                </p>
              </div>

              {inquirySuccess ? (
                <div className="p-6 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-white text-sm">Opening WhatsApp Chat!</div>
                  <p className="text-xs text-emerald-200">
                    Your inquiry details have been formatted and transferred to WhatsApp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">Mobile / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9847000000"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 flex items-center justify-between">
                      <span>Required Service</span>
                      {isOnamThemeActive() && (
                        <span className="text-[10px] text-amber-400 font-bold">🌸 ഓണം ഓഫർ ഉൾപ്പെടെ</span>
                      )}
                    </label>
                    <select
                      value={inquiryService}
                      onChange={(e) => setInquiryService(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {isOnamThemeActive() && (
                        <option value="🌸 Onam Festive Special Vasthu & Construction Consultation">
                          🌸 Onam Festive Special Vasthu & Construction Consultation (2026)
                        </option>
                      )}
                      <option value="Thachu Shastra & Vasthu Plan">Thachu Shastra & Vasthu Plan</option>
                      <option value="Architectural 2D/3D Design">Architectural 2D/3D Design</option>
                      <option value="KPBR / KSMART Building Permit">KPBR / KSMART Building Permit</option>
                      <option value="Stage Certificate & Estimate">Stage Certificate & Estimate</option>
                      <option value="Land Survey & Heron Area Calc">Land Survey & Heron Area Calc</option>
                      <option value="Turnkey Building Construction">Turnkey Building Construction</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Project Location & Details (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. 2400 sq.ft 2-story residential house in Palakkad, need Vastu check and permit drawings."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Connect with Er. Deepak K. on WhatsApp</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* =========================================================================
            6. FIRST TIME SETTING UP GOOGLE AUTHENTICATOR (2FA SETUP SECTION)
           ========================================================================= */}
        <section className="relative rounded-3xl border border-indigo-900/60 bg-gradient-to-br from-slate-950 via-slate-900/95 to-indigo-950/40 shadow-2xl backdrop-blur-xl p-6 sm:p-8 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Header / Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950 pb-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SECURITY & 2FA ACCESS • സുരക്ഷാ സംവിധാനം</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-sans flex items-center gap-2.5">
                  <QrCode className="w-6 h-6 text-indigo-400" />
                  <span>First Time Setting Up Google Authenticator?</span>
                </h2>
                <p className="text-xs text-slate-400 font-sans max-w-2xl">
                  സുരക്ഷിതമായി ലോഗിൻ ചെയ്യുന്നതിനായി നിങ്ങളുടെ മൊബൈൽ ഫോണിൽ Google Authenticator (TOTP 2FA) ആപ്പ് സജ്ജീകരിക്കുക.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthSetupModal(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>Open Setup QR Code</span>
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Account Selection & Steps (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Account Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-300">
                    തിരഞ്ഞെടുത്ത ഇമെയിൽ (Target Engineer Account):
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRIMARY_ADMIN_EMAILS.map((email) => {
                      const isSelected = !isCustomAuthEmail && authSetupEmail === email;
                      return (
                        <button
                          key={email}
                          type="button"
                          onClick={() => {
                            setIsCustomAuthEmail(false);
                            setAuthSetupEmail(email);
                          }}
                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-950/70 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-md"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                              isSelected
                                ? "bg-indigo-500 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {email.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate flex-1">
                            <p className="font-mono text-xs font-bold truncate leading-tight">
                              {email}
                            </p>
                            <span className="text-[10px] text-emerald-400 font-sans">
                              Primary Admin
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Email Option */}
                  <div className="pt-1">
                    {!isCustomAuthEmail ? (
                      <button
                        type="button"
                        onClick={() => setIsCustomAuthEmail(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono underline cursor-pointer"
                      >
                        + Configure custom engineer account email
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-mono">Custom Engineer Email:</span>
                          <button
                            type="button"
                            onClick={() => setIsCustomAuthEmail(false)}
                            className="text-[11px] text-slate-400 hover:text-slate-200 font-mono underline cursor-pointer"
                          >
                            Switch to Primary Admin
                          </button>
                        </div>
                        <input
                          type="email"
                          value={customAuthEmailInput}
                          onChange={(e) => setCustomAuthEmailInput(e.target.value)}
                          placeholder="engineer@gmail.com"
                          className="w-full bg-slate-950 border border-indigo-900/60 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 4 Steps Timeline */}
                <div className="bg-slate-950/70 border border-indigo-950 p-4 rounded-2xl space-y-3">
                  <h4 className="font-mono font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>4 ലളിതമായ ഘട്ടങ്ങൾ (4 Simple Setup Steps):</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 font-mono font-bold text-indigo-300">
                        <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-[10px] text-indigo-400">1</span>
                        <span>Install App</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        മൊബൈലിൽ <strong>Google Authenticator</strong> (Play Store / App Store) ഡൗൺലോഡ് ചെയ്യുക.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 font-mono font-bold text-teal-300">
                        <span className="w-5 h-5 rounded-full bg-teal-950 border border-teal-700 flex items-center justify-center text-[10px] text-teal-400">2</span>
                        <span>Tap + (Add)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        ആപ്പ് തുറന്ന് <strong>+</strong> ബട്ടൺ ടാപ്പ് ചെയ്ത് <strong>Scan a QR code</strong> തിരഞ്ഞെടുക്കുക.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 font-mono font-bold text-cyan-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] text-cyan-400">3</span>
                        <span>Scan Portal QR</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        <strong>Open Setup QR Code</strong> ബട്ടൺ അമർത്തി സ്ക്രീനിലുള്ള QR കോഡ് ക്യാമറയിൽ കാണിക്കുക.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center gap-2 font-mono font-bold text-emerald-300">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[10px] text-emerald-400">4</span>
                        <span>Enter 6 Digits</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        ഓരോ 30 സെക്കൻഡിലും മാറുന്ന 6 അക്ക കോഡ് നൽകി ലോഗിൻ ചെയ്യുക.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Secret Key & Direct Modal Launch (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/80 border border-indigo-900/40 p-5 rounded-2xl space-y-4">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <span>Manual Secret Key (മാനുവൽ കീ):</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                      RFC 6238 Standard
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    QR കോഡ് സ്കാൻ ചെയ്യാൻ സാധിക്കുന്നില്ലെങ്കിൽ, Authenticator ആപ്പിൽ <strong>"Enter a setup key"</strong> തിരഞ്ഞെടുത്ത് താഴെ നൽകിയിരിക്കുന്ന കീ പേസ്റ്റ് ചെയ്യുക:
                  </p>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-300 tracking-wider truncate">
                      {currentSecret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      title="Copy Secret Key"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedSecret ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowAuthSetupModal(true)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Fullscreen QR & Download (QR തുറക്കുക)</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Works 100% Offline</span>
                    </span>
                    <span>Google / Authy / Microsoft</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        </>
        )}

        {/* Footer info */}
        <footer className="text-center text-xs font-mono text-slate-500 pt-4 border-t border-slate-800/60">
          <div>VASTHUSILPY TECHNICAL ENGINEERING SYSTEM • KERALASSERY, PALAKKAD • 2026</div>
          <div className="text-[11px] text-slate-600 mt-1">
            Compliant with KPBR 2019/2024, Traditional Thachu Shastra Shlokas, IS 456, IS 1077 & IS 2502 Standards.
          </div>
        </footer>

      </div>

      {/* Google Authenticator Setup Modal */}
      <GoogleAuthenticatorSetupModal
        isOpen={showAuthSetupModal}
        onClose={() => setShowAuthSetupModal(false)}
        email={effectiveAuthEmail}
      />
    </div>
  );
};
