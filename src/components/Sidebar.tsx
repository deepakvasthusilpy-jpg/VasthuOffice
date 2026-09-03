import React, { useState } from "react";
import { MainSectionType, TabType, VasthuTabType, BuildingRulesTabType, SurveyTabType } from "../types";
import { useTheme } from "../context/ThemeContext";
import { ALL_TOOLS_DATA } from "../data/allToolsData";
import { Logo } from "./Logo";
import { ThemeSelectorModal } from "./theme/ThemeSelectorModal";
import {
  Compass,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ArrowRightLeft,
  Bot,
  Table,
  FileText,
  FileCode,
  BookOpen,
  Search,
  Layers,
  Cpu,
  Ruler,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  HardHat,
  Package,
  Box,
  Truck,
  Globe,
  FileSpreadsheet,
  Award,
  FolderKanban,
  Star,
  Briefcase,
  Receipt,
  History,
  Sun,
  Moon,
  ListPlus,
  Eye,
  FileCheck2,
  Home,
  Sparkles,
  Users,
  BarChart3,
  ListTodo,
  PenTool,
  Grid,
  Palette,
  Columns,
  Crown,
  Trees,
  LayoutGrid,
  Plus,
  HardDrive,
  Stamp,
  Image as ImageIcon,
  MessageSquare,
  Wallet,
  Zap,
  HeartPulse,
  PiggyBank,
  Landmark,
  Calendar,
  Clock
} from "lucide-react";

interface SidebarProps {
  activeSection: MainSectionType;
  setActiveSection: (section: MainSectionType) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  totalRows: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  activeTab,
  setActiveTab,
  totalRows,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { theme, currentThemeMeta, cycleNextTheme } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<MainSectionType>(activeSection);
  const [hoveredDockItem, setHoveredDockItem] = useState<string | null>(null);

  // Sync expandedSection with activeSection when activeSection changes
  React.useEffect(() => {
    setExpandedSection(activeSection);
  }, [activeSection]);

  const handleSectionClick = (section: MainSectionType, defaultTab: TabType) => {
    setActiveSection(section);
    setExpandedSection(section);
    setActiveTab(defaultTab);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleTabClick = (section: MainSectionType, tab: TabType) => {
    setActiveSection(section);
    setActiveTab(tab);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleQuickAgreement = () => {
    setActiveSection("construction_works");
    setActiveTab("construction_agreements");
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const SECTIONS = [
    {
      id: "home" as MainSectionType,
      title: "ഹോം പേജ്",
      subtitle: "HOME & BUSINESS OVERVIEW",
      shortLabel: "ഹോം",
      icon: Home,
      defaultTab: "home_overview" as TabType,
      color: "from-cyan-500 to-blue-600",
      activeBorder: "border-cyan-400",
      activeText: "text-cyan-300",
      subTabs: [
        { id: "home_overview" as TabType, label: "ഹോം & പ്രൊഫൈൽ", sub: "BUSINESS OVERVIEW & PROFILE", icon: Sparkles },
        { id: "all_tools" as TabType, label: `എല്ലാ ടൂളുകളും (${ALL_TOOLS_DATA.length})`, sub: "ALL TOOLS DASHBOARD", icon: LayoutGrid, badge: `${ALL_TOOLS_DATA.length}` },
        { id: "data_storage" as TabType, label: "ഡാറ്റ സ്റ്റോറേജ്", sub: "DATA STORAGE & CAD VAULT", icon: HardDrive, badge: "CAD" },
        { id: "subscription_requests" as TabType, label: "സബ്‌സ്ക്രിപ്ഷൻ അഭ്യർത്ഥനകൾ", sub: "SUBSCRIPTION REQUESTS", icon: ShieldCheck, badge: "NEW" }
      ]
    },
    {
      id: "ai_agent" as MainSectionType,
      title: "AI ആർക്കിടെക്റ്റ് & എഞ്ചിനീയർ",
      subtitle: "UNIFIED AI AGENT • ARCHITECT",
      shortLabel: "AI ഏജന്റ്",
      icon: Bot,
      defaultTab: "ai_agent_chat" as TabType,
      color: "from-cyan-500 via-blue-600 to-indigo-600",
      activeBorder: "border-cyan-400",
      activeText: "text-cyan-300",
      badge: "AVATAR",
      subTabs: [
        { id: "ai_agent_chat" as TabType, label: "AI ചീഫ് എഞ്ചിനീയർ ചാറ്റ്", sub: "Live Male AI Avatar & Audio", icon: Bot, badge: "LIVE" },
        { id: "ai_vastu" as TabType, label: "തച്ചു ശാസ്ത്ര & വാസ്തു ഓഡിറ്റ്", sub: "Vastu Shastra & Kol Calculations", icon: Compass },
        { id: "ai_kpbr" as TabType, label: "KPBR 2019/2026 കെട്ടിട ചട്ടങ്ങൾ", sub: "Setbacks, Coverage & Rules", icon: Building2 },
        { id: "ai_survey" as TabType, label: "ഭൂമി സർവ്വേ & അളവ് പരിശോധന", sub: "FMB, Cent Conversions & Area", icon: MapPin },
        { id: "ai_estimate" as TabType, label: "എസ്റ്റിമേറ്റ് & നിരക്ക് വിശകലനം", sub: "Kerala PWD Rates & BOQ", icon: FileSpreadsheet },
        { id: "ai_structural" as TabType, label: "സിവിൽ & സ്ട്രക്ചറൽ ഗൈഡ്", sub: "RCC Mix, BBS & Masonry", icon: HardHat },
        { id: "ai_visual_scanner" as TabType, label: "ബ്ലൂപ്രിന്റ് & പ്ലാൻ സ്കാനർ", sub: "Multimodal Plan & Drawing OCR", icon: FileCode, badge: "VISION" }
      ]
    },
    {
      id: "construction_works" as MainSectionType,
      title: "നിർമ്മാണ പ്രവർത്തനങ്ങൾ",
      subtitle: "CONSTRUCTION & E-STAMP",
      shortLabel: "കരാറുകൾ",
      icon: HardHat,
      defaultTab: "construction_dashboard" as TabType,
      color: "from-amber-500 to-emerald-500",
      activeBorder: "border-amber-400",
      activeText: "text-amber-300",
      badge: "E-STAMP",
      subTabs: [
        { id: "construction_dashboard" as TabType, label: "കൺസ്ട്രക്ഷൻ ഡാഷ്‌ബോർഡ്", sub: "CONSTRUCTION DASHBOARD", icon: LayoutGrid, badge: "OVERVIEW" },
        { id: "construction_agreements" as TabType, label: "ഇ-സ്റ്റാമ്പ് കരാറുകൾ (Agreements)", sub: "E-STAMP & PLAIN A4 PRINT", icon: FileCheck2, badge: "PRINT" },
        { id: "new_construction" as TabType, label: "പുതിയ നിർമ്മാണം & കരാർ", sub: "NEW PROJECT & AGREEMENT", icon: Plus, badge: "WIZARD" },
        { id: "construction_projects" as TabType, label: "പ്രോജക്ടുകൾ & ക്ലയന്റ്സ്", sub: "PROJECTS / CLIENTS", icon: FolderKanban },
        { id: "construction_cost_calculator" as TabType, label: "അടിസ്ഥാന നിരക്ക് & ചെലവ്", sub: "BASE RATE & COST CALCULATOR", icon: Calculator, badge: "RATE" },
        { id: "construction_payment_stages" as TabType, label: "പെയ്‌മെന്റ് സ്റ്റേജുകൾ", sub: "PAYMENT STAGES", icon: Receipt },
        { id: "construction_reports" as TabType, label: "ധനകാര്യ റിപ്പോർട്ടുകൾ", sub: "FINANCIAL REPORTS", icon: FileSpreadsheet },
        { id: "construction_settings" as TabType, label: "നിർമ്മാണ ക്രമീകരണങ്ങൾ", sub: "STAGES & PRINT MARGINS", icon: Sparkles },
        { id: "construction_search" as TabType, label: "QR വെരിഫിക്കേഷൻ", sub: "QR VERIFICATION", icon: ShieldCheck, badge: "QR" }
      ]
    },
    {
      id: "estimate" as MainSectionType,
      title: "റേറ്റ് എസ്റ്റിമേറ്റർ & വാല്യുവേഷൻ",
      subtitle: "ESTIMATE & QUANTITY SURVEY",
      shortLabel: "എസ്റ്റിമേറ്റ്",
      icon: FileSpreadsheet,
      defaultTab: "estimate_dashboard" as TabType,
      color: "from-emerald-500 to-amber-500",
      activeBorder: "border-emerald-500",
      activeText: "text-emerald-400",
      badge: "BOQ",
      subTabs: [
        { id: "estimate_dashboard" as TabType, label: "എസ്റ്റിമേറ്റ് ഡാഷ്‌ബോർഡ്", sub: "Estimates Directory", icon: FileSpreadsheet },
        { id: "estimate_sheet" as TabType, label: "വിശദമായ റേറ്റ് എസ്റ്റിമേറ്റ്", sub: "Quantity Survey Sheet", icon: Calculator, badge: "BOQ" },
        { id: "valuation" as TabType, label: "വാല്യുവേഷൻ സർട്ടിഫിക്കറ്റ്", sub: "Section 28B/28C Valuation", icon: FileCheck2, badge: "GOVT" },
        { id: "stage_completion_certificate" as TabType, label: "സ്റ്റേജ് / കംപ്ലീഷൻ സർട്ടിഫിക്കറ്റ്", sub: "Stage & Completion Certs", icon: Award, badge: "CERT" },
        { id: "items_of_work" as TabType, label: "ഐറ്റം ഓഫ് വർക്ക് ലൈബ്രറി", sub: "Items of Work Master", icon: ListPlus, badge: "LIBRARY" },
        { id: "engineer_seals" as TabType, label: "എഞ്ചിനീയർ സീൽ & സൈൻ", sub: "Engineer Seals", icon: ShieldCheck }
      ]
    },
    {
      id: "office_dashboard" as MainSectionType,
      title: "ഓഫീസ് ഡാഷ്‌ബോർഡ്",
      subtitle: "OFFICE DASHBOARD & CRM",
      shortLabel: "ഓഫീസ്",
      icon: FolderKanban,
      defaultTab: "office_crm_projects" as TabType,
      color: "from-emerald-500 to-teal-600",
      activeBorder: "border-emerald-500",
      activeText: "text-emerald-400",
      subTabs: [
        { id: "office_crm_projects" as TabType, label: "പ്രോജക്ട്സ് പൈപ്പ്ലൈൻ", sub: "PROJECTS PIPELINE", icon: Briefcase, badge: "CRM" },
        { id: "office_tasks" as TabType, label: "ടാസ്കുകൾ & ഉപടാസ്കുകൾ", sub: "TASKS & SUB-TASKS", icon: ListTodo, badge: "TASKS" },
        { id: "office_activities" as TabType, label: "ആക്ടിവിറ്റി ഹിസ്റ്ററി", sub: "ACTIVITY HISTORY", icon: History },
        { id: "office_important_sites" as TabType, label: "ഇംപോർട്ടന്റ് സൈറ്റുകൾ", sub: "IMPORTANT SITES & VAULT", icon: Globe, badge: "VAULT" }
      ]
    },
    {
      id: "invoices_payments" as MainSectionType,
      title: "ഇൻവോയ്‌സ് & പേയ്‌മെന്റ്",
      subtitle: "INVOICE & PAYMENTS",
      shortLabel: "ബില്ലിംഗ്",
      icon: Receipt,
      defaultTab: "invoices_list" as TabType,
      color: "from-teal-400 to-emerald-500",
      activeBorder: "border-teal-400",
      activeText: "text-teal-300",
      badge: "PAY",
      subTabs: [
        { id: "invoices_list" as TabType, label: "ഇൻവോയ്‌സ് & പേയ്‌മെന്റുകൾ", sub: "INVOICES & BILLING", icon: Receipt },
        { id: "products_services" as TabType, label: "Products & Services", sub: "CATALOG & RATES", icon: Box, badge: "RATES" },
        { id: "customers" as TabType, label: "കസ്റ്റമേഴ്സ് / ക്ലയന്റുകൾ", sub: "CUSTOMERS DIRECTORY", icon: Users },
        { id: "reports_analysis" as TabType, label: "റിപ്പോർട്ടുകൾ & അനലിറ്റിക്‌സ്", sub: "REPORTS & ANALYSIS", icon: BarChart3 }
      ]
    },
    {
      id: "vasthu" as MainSectionType,
      title: "വാസ്തു ശാസ്ത്രം",
      subtitle: "VASTHU SHASTRA",
      shortLabel: "വാസ്തു",
      icon: Compass,
      defaultTab: "calculator" as TabType,
      color: "from-cyan-500 to-blue-600",
      activeBorder: "border-cyan-500",
      activeText: "text-cyan-400",
      subTabs: [
        { id: "calculator" as TabType, label: "കാൽക്കുലേറ്റർ", sub: "Calculator", icon: Calculator },
        { id: "side_finder" as TabType, label: "വശങ്ങൾ കണ്ടെത്തുക", sub: "Side Finder", icon: ArrowRightLeft },
        { id: "perimeter_vasthu" as TabType, label: "ഇരുവശ ചുറ്റളവ് & വാസ്തു", sub: "2-Side Perimeter Vastu", icon: Ruler },
        { id: "table" as TabType, label: "പൂർണ്ണ പട്ടിക", sub: `${totalRows} Rows`, icon: Table },
        { id: "attachment" as TabType, label: "മൂലരേഖ", sub: "17 Pages", icon: FileText },
        { id: "guide" as TabType, label: "തച്ചുശാസ്ത്ര നിയമങ്ങൾ", sub: "Guide", icon: BookOpen }
      ]
    },
    {
      id: "building_rules" as MainSectionType,
      title: "കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ",
      subtitle: "BUILDING RULES",
      shortLabel: "ചട്ടങ്ങൾ",
      icon: Building2,
      defaultTab: "rules_search" as TabType,
      color: "from-emerald-400 to-cyan-500",
      activeBorder: "border-emerald-500",
      activeText: "text-emerald-400",
      subTabs: [
        { id: "rules_search" as TabType, label: "നിയമ തിരച്ചിൽ", sub: "Rule Search", icon: Search },
        { id: "rules_occupancies" as TabType, label: "ഉപയോഗ ഗണങ്ങൾ", sub: "Occupancies A1-J", icon: Layers },
        { id: "rules_calculator" as TabType, label: "സെറ്റ്ബാക്ക് കാൽക്കുലേറ്റർ", sub: "Setback Calc", icon: Calculator },
        { id: "rules_calculators" as TabType, label: "കാൽക്കുലേറ്ററുകൾ", sub: "5 Tools", icon: Cpu }
      ]
    },
    {
      id: "ksmart" as MainSectionType,
      title: "കെ-സ്മാർട്ട്",
      subtitle: "KSMART LSGD PORTAL",
      shortLabel: "KSMART",
      icon: Globe,
      defaultTab: "rules_ksmart" as TabType,
      color: "from-emerald-500 to-teal-500",
      activeBorder: "border-emerald-400",
      activeText: "text-emerald-400",
      badge: "LSGD",
      subTabs: [
        { id: "rules_ksmart" as TabType, label: "KSMART ഫയൽ ട്രാക്കിംഗ്", sub: "Live LSGD Tracker", icon: Search, badge: "TRACK" },
        { id: "ksmart_plan_scrutiny" as TabType, label: "CAD പ്ലാൻ സ്ക്രൂട്ടീനി", sub: "Auto-DCR Plan Scrutiny", icon: FileCode, badge: "AUTO-DCR" },
        { id: "ksmart_quick_certificates" as TabType, label: "ക്വിക്ക് സർട്ടിഫിക്കറ്റുകൾ", sub: "Birth/Death/Marriage", icon: Award, badge: "CERTS" },
        { id: "ksmart_property_tax" as TabType, label: "കെട്ടിട നികുതി", sub: "Property Tax & Assessment", icon: Receipt, badge: "TAX" }
      ]
    },
    {
      id: "survey" as MainSectionType,
      title: "സർവ്വേ",
      subtitle: "SURVEY & LAND AREA",
      shortLabel: "സർവ്വേ",
      icon: MapPin,
      defaultTab: "missing_side" as TabType,
      color: "from-blue-500 to-indigo-600",
      activeBorder: "border-blue-500",
      activeText: "text-blue-400",
      subTabs: [
        { id: "missing_side" as TabType, label: "Missing Side Calc", sub: "GEO-04", icon: Ruler },
        { id: "land_area" as TabType, label: "Land Area Calc", sub: "Heron's Formula", icon: MapPin },
        { id: "unit_converters" as TabType, label: "യൂണിറ്റ് കൺവെർട്ടർ", sub: "Length & Area", icon: ArrowRightLeft, badge: "CONVERT" }
      ]
    },
    {
      id: "civil" as MainSectionType,
      title: "സിവിൽ എഞ്ചിനീയറിംഗ്",
      subtitle: "CIVIL ENGINEERING",
      shortLabel: "സിവിൽ",
      icon: HardHat,
      defaultTab: "brick_masonry" as TabType,
      color: "from-amber-500 to-rose-600",
      activeBorder: "border-amber-500",
      activeText: "text-amber-400",
      subTabs: [
        { id: "brick_masonry" as TabType, label: "Brick Masonry Calc", sub: "IS 1077 Standard", icon: Package },
        { id: "concrete_block" as TabType, label: "Concrete Block Calc", sub: "Solid/Hollow CMU", icon: Box },
        { id: "cement_concrete" as TabType, label: "Cement Concrete Calc", sub: "IS 456 PCC/RCC", icon: Truck },
        { id: "material_quantity_bbs" as TabType, label: "Material Quantity & BBS", sub: "IS 456 & IS 2502 BBS", icon: Layers, badge: "BBS" }
      ]
    },
    {
      id: "personal_bills" as MainSectionType,
      title: "വ്യക്തിഗത ബില്ലുകളും പേയ്‌മെന്റുകളും",
      subtitle: "PERSONAL BILLS & PAYMENTS",
      shortLabel: "പേയ്‌മെന്റുകൾ",
      icon: Wallet,
      defaultTab: "staff_salary" as TabType,
      color: "from-purple-500 via-pink-500 to-amber-500",
      activeBorder: "border-purple-400",
      activeText: "text-purple-300",
      badge: "NEW",
      subTabs: [
        { id: "staff_salary" as TabType, label: "സ്റ്റാഫ് ശമ്പളം & പേയ്‌മെന്റുകൾ", sub: "STAFF SALARY & OTHER PAYMENTS", icon: Users, badge: "SALARY" },
        { id: "poov_mala_bill" as TabType, label: "പൂവ് മാല ബിൽ", sub: "POOV MALA BILL & PHOTO", icon: Sparkles, badge: "CALC" },
        { id: "kseb_bills" as TabType, label: "KSEB വൈദ്യുതി ബിൽ", sub: "ELECTRICITY BILLS", icon: Zap, badge: "KSEB" },
        { id: "health_insurance" as TabType, label: "ആരോഗ്യ ഇൻഷുറൻസ്", sub: "HEALTH INSURANCE & MEDICLAIM", icon: HeartPulse, badge: "HEALTH" },
        { id: "rd_accounts" as TabType, label: "ആവർത്തന നിക്ഷേപം (RD)", sub: "60-MONTH RD MATRIX", icon: PiggyBank, badge: "PASSBOOK" },
        { id: "panchayath_bills" as TabType, label: "പഞ്ചായത്ത് ഫീസ് & നികുതി", sub: "LICENCE & LOCAL TAXES", icon: Landmark, badge: "K-SMART" },
        { id: "personal_vendors" as TabType, label: "വെണ്ടർമാരും ബില്ലുകളും", sub: "VENDORS & ALL BILLS", icon: Users, badge: "GPAY" }
      ]
    }
  ];

  // Collapsed Dock View
  const collapsedDockView = (
    <div className="h-full flex flex-col justify-between items-center py-3 select-none bg-[#0e021a]/85 backdrop-blur-2xl border-r border-white/15">
      {/* Top Dock Brand & Expand Trigger */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-2xl hover:bg-white/10 transition-transform hover:scale-105 cursor-pointer"
          title="Expand Dock (ഡ്രോയർ വികസിപ്പിക്കുക)"
        >
          <Logo size={36} />
        </button>

        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer shadow-sm group"
          title="Expand Dock / വികസിപ്പിക്കുക"
        >
          <PanelLeftOpen className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Center Dock Icons with floating Tooltip Popovers */}
      <div className="flex-1 w-full overflow-y-auto py-3 px-2 flex flex-col items-center gap-2 scrollbar-none">
        {SECTIONS.map((sec) => {
          const isSecActive = activeSection === sec.id;
          const SecIcon = sec.icon;

          return (
            <div
              key={sec.id}
              className="relative flex items-center justify-center w-full"
              onMouseEnter={() => setHoveredDockItem(sec.id)}
              onMouseLeave={() => setHoveredDockItem(null)}
            >
              <button
                onClick={() => handleSectionClick(sec.id, sec.defaultTab)}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isSecActive
                    ? `bg-gradient-to-br ${sec.color} text-slate-950 font-bold shadow-lg shadow-purple-950/50 scale-105 ring-2 ring-white/60`
                    : "bg-white/5 hover:bg-white/15 text-purple-200 hover:text-white border border-white/15 hover:border-white/30 hover:scale-105 backdrop-blur-md"
                }`}
              >
                <SecIcon className={`w-5 h-5 ${isSecActive ? "text-slate-950 stroke-[2.2]" : "text-purple-100"}`} />

                {/* Section Badge dot */}
                {sec.badge && !isSecActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-400 ring-2 ring-[#0e021a]" />
                )}
              </button>

              {/* Hover Tooltip Card (positioned to the right of the dock) */}
              {hoveredDockItem === sec.id && (
                <div className="absolute left-14 z-50 w-56 glass-card border border-white/20 text-slate-100 rounded-3xl p-3.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-left-2 duration-150 pointer-events-none">
                  <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
                    <span className="font-bold text-xs text-white">{sec.title}</span>
                    {sec.badge && (
                      <span className="text-[8.5px] font-mono font-bold bg-pink-500/20 text-pink-200 px-2 py-0.5 rounded-full border border-pink-400/40">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] font-mono text-purple-300 uppercase tracking-wider mb-2">
                    {sec.subtitle}
                  </div>
                  <div className="text-[9.5px] text-purple-200/70 font-sans">
                    {sec.subTabs.length} ടൂളുകൾ & വിഭാഗങ്ങൾ
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Quick Actions Dock */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/15 w-full px-2">
        {/* Quick E-Stamp Print Launcher */}
        <button
          onClick={handleQuickAgreement}
          className="w-11 h-11 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 flex items-center justify-center transition hover:scale-105 cursor-pointer shadow-sm backdrop-blur-md"
          title="Quick E-Stamp & Plain A4 Agreements / ഇ-സ്റ്റാമ്പ് പ്രിന്റ്"
        >
          <Stamp className="w-5 h-5" />
        </button>

        {/* Theme Studio Button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-purple-300 flex items-center justify-center transition hover:scale-105 cursor-pointer shadow-sm relative backdrop-blur-md"
          title="Architectural Theme Studio (6 Themes)"
        >
          <Palette className="w-4 h-4" />
          <span
            className="absolute bottom-1 right-1 w-2 h-2 rounded-full ring-1 ring-[#0e021a]"
            style={{ backgroundColor: currentThemeMeta.primaryColor }}
          />
        </button>
      </div>
    </div>
  );

  // Full Expanded Dock View
  const expandedDockView = (
    <div className="h-full flex flex-col justify-between select-none bg-[#0e021a]/85 backdrop-blur-2xl border-r border-white/15 text-white">
      {/* Sidebar Header & Brand Logo */}
      <div className="p-3.5 border-b border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <Logo size={38} />

          <div className="truncate">
            <span className="text-[9px] font-mono font-bold text-purple-200 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/40 uppercase block w-max mb-0.5">
              VASTHUSILPY
            </span>
            <h2 className="text-sm font-black text-white font-sans uppercase tracking-tight truncate">
              ENGINEERING STUDIO
            </h2>
          </div>
        </div>

        {/* Collapse Toggle Button (Desktop) */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="hidden md:flex items-center justify-center p-1.5 text-purple-200/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer"
          title="Collapse Dock to slim icon rail (ഡോക്ക് ചെറുതാക്കുക)"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-purple-200 hover:text-white bg-white/10 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Access Action Bar */}
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
        <button
          onClick={handleQuickAgreement}
          className="flex-1 py-1.5 px-3 bg-gradient-to-r from-amber-500/25 to-pink-500/25 hover:from-amber-500/35 hover:to-pink-500/35 border border-amber-400/40 text-amber-200 rounded-full text-[10.5px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm backdrop-blur-md"
          title="ഇ-സ്റ്റാമ്പ് & പ്ലെയിൻ A4 കരാർ നിർമ്മാണം"
        >
          <Stamp className="w-3.5 h-3.5" />
          <span>ഇ-സ്റ്റാമ്പ് കരാർ</span>
        </button>

        <button
          onClick={() => {
            setActiveSection("estimate");
            setActiveTab("estimate_sheet");
            if (isMobileOpen) setIsMobileOpen(false);
          }}
          className="py-1.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-[10.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition backdrop-blur-md"
          title="പുതിയ എസ്റ്റിമേറ്റ്"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-300" />
          <span>BOQ</span>
        </button>
      </div>

      {/* Main Sections Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2.5 space-y-2 scrollbar-none">
        {SECTIONS.map((sec) => {
          const isSecActive = activeSection === sec.id;
          const SecIcon = sec.icon;

          return (
            <div key={sec.id} className="space-y-1">
              {/* Section Header Button */}
              <button
                onClick={() => handleSectionClick(sec.id, sec.defaultTab)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-2xl transition-all cursor-pointer ${
                  isSecActive
                    ? `bg-white/15 border border-white/30 text-white shadow-lg backdrop-blur-xl`
                    : "text-purple-200/80 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
                title={sec.title}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSecActive
                      ? `bg-gradient-to-r ${sec.color} text-slate-950 font-bold shadow`
                      : "bg-white/5 text-purple-200 border border-white/15"
                  }`}
                >
                  <SecIcon className="w-4 h-4" />
                </div>

                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-bold font-sans text-white truncate flex items-center justify-between">
                    <span>{sec.title}</span>
                    {sec.badge && (
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-400/40">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] font-mono text-purple-200/60 tracking-wider truncate">
                    {sec.subtitle}
                  </div>
                </div>
              </button>

              {/* Sub-tabs List (visible if Section is Active) */}
              {isSecActive && (
                <div className="pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-white/20 ml-4 my-1">
                  {sec.subTabs.map((sub) => {
                    const isTabActive =
                      activeTab === sub.id ||
                      (sec.id === "construction_works" && (
                        (sub.id === "construction_dashboard" && (activeTab === "dashboard" || activeTab === "construction_dashboard")) ||
                        (sub.id === "new_construction" && (activeTab === "new_construction" || activeTab === "construction_new")) ||
                        (sub.id === "construction_projects" && (activeTab === "projects" || activeTab === "construction_projects")) ||
                        (sub.id === "construction_agreements" && (activeTab === "agreements" || activeTab === "construction_agreements")) ||
                        (sub.id === "construction_cost_calculator" && (activeTab === "cost_calculator" || activeTab === "construction_cost_calculator" || activeTab === "construction_calculator")) ||
                        (sub.id === "construction_payment_stages" && (activeTab === "payment_stages" || activeTab === "construction_payment_stages" || activeTab === "construction_payments")) ||
                        (sub.id === "construction_reports" && (activeTab === "reports" || activeTab === "construction_reports")) ||
                        (sub.id === "construction_settings" && (activeTab === "settings" || activeTab === "construction_settings")) ||
                        (sub.id === "construction_search" && (activeTab === "search" || activeTab === "construction_search" || activeTab === "construction_verify"))
                      ));
                    const SubIcon = sub.icon;

                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleTabClick(sec.id, sub.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono transition cursor-pointer ${
                          isTabActive
                            ? "bg-white/20 text-white font-bold border border-white/35 shadow-sm backdrop-blur-md"
                            : "text-purple-200/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isTabActive ? "text-pink-300" : "text-purple-300/60"}`} />
                          <span className="truncate">{sub.label}</span>
                        </div>

                        {sub.badge && (
                          <span className="text-[8.5px] font-mono bg-white/10 text-purple-200 px-2 py-0.5 rounded-full border border-white/20 shrink-0">
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info Badge & Theme Studio Trigger */}
      <div className="p-3 m-2.5 glass-card border border-white/15 rounded-3xl text-[10px] font-mono text-purple-200/70 space-y-2 backdrop-blur-xl">
        <div className="flex items-center justify-between text-white font-bold">
          <span>VASTHUSILPY DOCK</span>
          <span className="text-purple-300">v2.5</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="flex-1 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full text-white transition-colors cursor-pointer text-left truncate"
            title="Open Architectural Theme Studio (6 Themes)"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: currentThemeMeta.primaryColor }}
            />
            <span className="font-bold uppercase text-[9.5px] truncate">
              {currentThemeMeta.name.split(" ")[0]}
            </span>
          </button>

          <button
            onClick={cycleNextTheme}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-purple-200 font-bold text-[9px] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Cycle to next theme"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Theme Studio Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Desktop Persistent Collapsible Side Dock */}
      <aside
        className={`hidden md:block print:hidden sticky top-0 h-screen bg-[#0e021a]/85 backdrop-blur-2xl border-r border-white/15 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? "w-[72px]" : "w-72"
        }`}
      >
        {isCollapsed ? collapsedDockView : expandedDockView}
      </aside>

      {/* Mobile Off-canvas Drawer */}
      {isMobileOpen && (
        <div className="md:hidden print:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-72 bg-[#0e021a]/95 border-r border-white/20 h-full z-10 print:hidden backdrop-blur-2xl">
            {expandedDockView}
          </aside>
        </div>
      )}
    </>
  );
};
