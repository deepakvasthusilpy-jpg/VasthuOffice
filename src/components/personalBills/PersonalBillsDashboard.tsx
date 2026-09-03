import React, { useState, useEffect } from "react";
import { PersonalBillsTabType } from "../../types";
import { StaffSalaryTab } from "./StaffSalaryTab";
import { PoovMalaBillTab } from "./PoovMalaBillTab";
import { KsebBillTab } from "./KsebBillTab";
import { HealthInsuranceTab } from "./HealthInsuranceTab";
import { RdAccountTab } from "./RdAccountTab";
import { PanchayathBillsTab } from "./PanchayathBillsTab";
import { VendorsAndBillsTab } from "./VendorsAndBillsTab";
import {
  Users,
  Sparkles,
  Zap,
  HeartPulse,
  PiggyBank,
  Landmark,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

interface PersonalBillsDashboardProps {
  initialSubTab?: PersonalBillsTabType;
}

export const PersonalBillsDashboard: React.FC<PersonalBillsDashboardProps> = ({
  initialSubTab = "staff_salary"
}) => {
  const [activeTab, setActiveTab] = useState<PersonalBillsTabType>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const subTabs = [
    {
      id: "staff_salary" as PersonalBillsTabType,
      label: "സ്റ്റാഫ് ശമ്പളം & പേയ്‌മെന്റുകൾ",
      subtitle: "Staff Salary & Slips",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      accent: "text-purple-300"
    },
    {
      id: "poov_mala" as PersonalBillsTabType,
      label: "പൂവ് മാല ബിൽ",
      subtitle: "Poov Mala Bill",
      icon: Sparkles,
      color: "from-amber-500 to-yellow-500",
      accent: "text-amber-300"
    },
    {
      id: "kseb_bills" as PersonalBillsTabType,
      label: "KSEB വൈദ്യുതി ബിൽ",
      subtitle: "Electricity Bills",
      icon: Zap,
      color: "from-amber-400 to-orange-500",
      accent: "text-orange-300"
    },
    {
      id: "health_insurance" as PersonalBillsTabType,
      label: "ആരോഗ്യ ഇൻഷുറൻസ്",
      subtitle: "Health Insurance",
      icon: HeartPulse,
      color: "from-rose-500 to-pink-500",
      accent: "text-rose-300"
    },
    {
      id: "rd_accounts" as PersonalBillsTabType,
      label: "ആവർത്തന നിക്ഷേപം (RD)",
      subtitle: "Recurring Deposits",
      icon: PiggyBank,
      color: "from-purple-500 to-indigo-500",
      accent: "text-purple-300"
    },
    {
      id: "licence_panchayath" as PersonalBillsTabType,
      label: "പഞ്ചായത്ത് ഫീസ് & ലൈസൻസ്",
      subtitle: "Licence & Taxes",
      icon: Landmark,
      color: "from-teal-500 to-cyan-500",
      accent: "text-teal-300"
    },
    {
      id: "all_vendors" as PersonalBillsTabType,
      label: "വെണ്ടർമാരും ബില്ലുകളും",
      subtitle: "Vendors & Payments",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      accent: "text-cyan-300"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* SECTION HEADER & SUB-TABS BAR */}
      <div className="p-2 rounded-3xl bg-[#140424]/90 border border-purple-500/30 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 scrollbar-thin scrollbar-thumb-purple-500/20">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 whitespace-nowrap cursor-pointer group ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black shadow-lg shadow-purple-500/30 scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 hover:border-purple-400/30"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition ${
                    isActive
                      ? "bg-black/30 text-white"
                      : "bg-purple-950/60 text-purple-300 group-hover:text-amber-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className={`text-xs font-black leading-tight ${isActive ? "text-white" : "text-purple-100"}`}>
                    {tab.label}
                  </div>
                  <div className={`text-[10px] font-medium leading-none mt-0.5 ${isActive ? "text-purple-200" : "text-purple-300/60"}`}>
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER ACTIVE SUB-TAB CONTENT */}
      <div className="transition-all duration-300">
        {activeTab === "staff_salary" && <StaffSalaryTab />}
        {(activeTab === "poov_mala" || activeTab === "poov_mala_bill") && <PoovMalaBillTab />}
        {(activeTab === "kseb_bills" || activeTab === "kseb_bill") && <KsebBillTab />}
        {activeTab === "health_insurance" && <HealthInsuranceTab />}
        {(activeTab === "rd_accounts" || activeTab === "rd_deposit") && <RdAccountTab />}
        {(activeTab === "licence_panchayath" || activeTab === "panchayath_bills" || activeTab === "panchayath_fees") && <PanchayathBillsTab />}
        {(activeTab === "all_vendors" || activeTab === "all_vendors_bills" || activeTab === "personal_vendors") && <VendorsAndBillsTab />}
      </div>
    </div>
  );
};

