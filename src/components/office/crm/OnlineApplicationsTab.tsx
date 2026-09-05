import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Phone,
  Copy,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Filter,
  DollarSign,
  Building2,
  Share2,
  IndianRupee,
  AlertTriangle
} from "lucide-react";
import {
  OnlineApplicantRecord,
  ApplicationDetailItem,
  OnlineApplicationStatus
} from "../../../types";
import {
  loadOnlineApplicants,
  deleteOnlineApplicant,
  subscribeToOnlineApplicants,
  isApplicantPaymentCompleted,
  DEFAULT_RECEIVER_UPI,
  upsertOnlineApplicant
} from "../../../utils/onlineApplicationsManager";
import { ApplicantPaymentQrModal } from "./ApplicantPaymentQrModal";
import { ManageApplicationsModal } from "./ManageApplicationsModal";
import { ApplicantFormModal } from "./ApplicantFormModal";
import { ApplicationPaymentModal } from "./ApplicationPaymentModal";
import { ApplicationTypesView } from "./ApplicationTypesView";

const STATUS_CONFIG: {
  [key in OnlineApplicationStatus]: { label: string; badgeClass: string };
} = {
  PENDING: { label: "Pending", badgeClass: "bg-slate-800 text-slate-300 border-slate-700" },
  SUBMITTED: { label: "Submitted", badgeClass: "bg-blue-950 text-blue-300 border-blue-800" },
  IN_PROGRESS: { label: "In Progress", badgeClass: "bg-cyan-950 text-cyan-300 border-cyan-800" },
  VERIFICATION: { label: "Verification", badgeClass: "bg-purple-950 text-purple-300 border-purple-800" },
  APPROVED: { label: "Approved", badgeClass: "bg-emerald-950 text-emerald-300 border-emerald-800" },
  FEE_DUE: { label: "Fee Due", badgeClass: "bg-amber-950 text-amber-300 border-amber-800" },
  COMPLETED: { label: "Completed", badgeClass: "bg-emerald-900 text-emerald-100 border-emerald-600" },
  REJECTED: { label: "Rejected", badgeClass: "bg-rose-950 text-rose-300 border-rose-800" }
};

interface OnlineApplicationsTabProps {
  initialSubTab?: "directory" | "types";
  onSubTabChange?: (sub: "directory" | "types") => void;
}

export const OnlineApplicationsTab: React.FC<OnlineApplicationsTabProps> = ({
  initialSubTab = "directory",
  onSubTabChange
}) => {
  const [currentSubTab, setCurrentSubTab] = useState<"directory" | "types">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setCurrentSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabSwitch = (sub: "directory" | "types") => {
    setCurrentSubTab(sub);
    if (onSubTabChange) {
      onSubTabChange(sub);
    }
  };

  const [applicants, setApplicants] = useState<OnlineApplicantRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  // Modals state
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState<boolean>(false);
  const [editingApplicant, setEditingApplicant] = useState<OnlineApplicantRecord | null>(null);

  const [isManageAppsModalOpen, setIsManageAppsModalOpen] = useState<boolean>(false);
  const [selectedApplicantForApps, setSelectedApplicantForApps] = useState<OnlineApplicantRecord | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [selectedApplicantForQr, setSelectedApplicantForQr] = useState<OnlineApplicantRecord | null>(null);

  // Per-application payment modal state
  const [paymentModalTarget, setPaymentModalTarget] = useState<{
    applicant: OnlineApplicantRecord;
    application: ApplicationDetailItem;
  } | null>(null);

  // In-app Delete Confirmation (eliminates broken window.confirm in iframe)
  const [applicantToDelete, setApplicantToDelete] = useState<{ id: string; name: string } | null>(null);

  // Copied item tooltip feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inline editing state for quick edits
  const [editingCell, setEditingCell] = useState<{ id: string; field: "bill" | "paid" } | null>(null);
  const [tempCellValue, setTempCellValue] = useState<string>("");

  useEffect(() => {
    // Initial load
    setApplicants(loadOnlineApplicants());

    // Subscribe to cloud sync updates
    const unsubscribe = subscribeToOnlineApplicants((updated) => {
      setApplicants(updated);
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Safe delete execution
  const executeDeleteApplicant = () => {
    if (!applicantToDelete) return;
    const updated = deleteOnlineApplicant(applicantToDelete.id);
    setApplicants(updated);
    setApplicantToDelete(null);
  };

  const handleStatusChange = (applicant: OnlineApplicantRecord, newStatus: OnlineApplicationStatus) => {
    const updated: OnlineApplicantRecord = {
      ...applicant,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    const updatedList = upsertOnlineApplicant(updated);
    setApplicants(updatedList);
  };

  const startInlineEdit = (applicant: OnlineApplicantRecord, field: "bill" | "paid") => {
    setEditingCell({ id: applicant.id, field });
    setTempCellValue(field === "bill" ? String(applicant.billAmount) : String(applicant.paidAmount));
  };

  const saveInlineEdit = (applicant: OnlineApplicantRecord) => {
    if (!editingCell) return;
    const numVal = Math.max(0, Number(tempCellValue) || 0);
    const isPaidField = editingCell.field === "paid";

    const updated: OnlineApplicantRecord = {
      ...applicant,
      billAmount: editingCell.field === "bill" ? numVal : applicant.billAmount,
      paidAmount: isPaidField ? numVal : applicant.paidAmount,
      updatedAt: new Date().toISOString()
    };

    // Auto-update status to COMPLETED if paid in full
    if (isPaidField && numVal >= applicant.billAmount && applicant.billAmount > 0 && applicant.status !== "REJECTED") {
      updated.status = "COMPLETED";
    }

    const updatedList = upsertOnlineApplicant(updated);
    setApplicants(updatedList);
    setEditingCell(null);
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobileNo.includes(searchTerm) ||
      (item.applications || []).some(
        (app) =>
          app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.portal.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    const isPaid = isApplicantPaymentCompleted(item);
    const matchesPayment =
      paymentFilter === "ALL" ||
      (paymentFilter === "PAID" && isPaid) ||
      (paymentFilter === "PENDING" && !isPaid);

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Financial and status aggregations
  const totalApplicants = applicants.length;
  const totalApplications = applicants.reduce((sum, a) => sum + (a.applications?.length || 0), 0);
  const totalBill = applicants.reduce((sum, a) => sum + (a.billAmount || 0), 0);
  const totalPaid = applicants.reduce((sum, a) => sum + (a.paidAmount || 0), 0);
  const totalBalance = Math.max(0, totalBill - totalPaid);
  const completedCount = applicants.filter((a) => isApplicantPaymentCompleted(a)).length;

  return (
    <div className="space-y-4">
      {/* Sub-Tab Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-md">
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => handleSubTabSwitch("directory")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
              currentSubTab === "directory"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>APPLICATIONS & LOGINS DIRECTORY</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch("types")}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
              currentSubTab === "types"
                ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>APPLICATIONS TYPE</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-900/60 border border-slate-700/60 text-slate-300">
              CONFIG
            </span>
          </button>
        </div>

        {currentSubTab === "directory" && (
          <button
            type="button"
            onClick={() => {
              setEditingApplicant(null);
              setIsApplicantModalOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ NEW APPLICANT</span>
          </button>
        )}
      </div>

      {currentSubTab === "types" ? (
        <ApplicationTypesView />
      ) : (
        <>
          {/* Top Banner & Heading Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE APPLICATION PORTAL TRACKER
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {filteredApplicants.length} of {totalApplicants} Applicants
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight flex items-center gap-2">
                <span>Online Applications & Login Directory</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Manage applications, logins, individual fee entries, and UPI QR payments to <strong className="text-cyan-300">9567627277@SLC</strong>.
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingApplicant(null);
                  setIsApplicantModalOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ NEW APPLICANT</span>
              </button>
            </div>
          </div>

      {/* Metrics Summary Strip (Compact) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-0.5">
            <span>Applicants</span>
            <Building2 className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-base font-black text-white">{totalApplicants}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-0.5">
            <span>Applications</span>
            <Layers className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-base font-black text-purple-300">{totalApplications}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-0.5">
            <span>Total Bill</span>
            <DollarSign className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-base font-black text-blue-300">₹{totalBill.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-0.5">
            <span>Total Paid</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-base font-black text-emerald-300">₹{totalPaid.toLocaleString("en-IN")}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-0.5">
            <span>Balance Due</span>
            <AlertCircle className="w-3 h-3 text-amber-400" />
          </div>
          <div className={`text-base font-black ${totalBalance > 0 ? "text-amber-300" : "text-emerald-300"}`}>
            ₹{totalBalance.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase mb-0.5">
            <span>Paid in Full</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-base font-black text-emerald-400">
            {completedCount} <span className="text-[10px] text-slate-500 font-normal">({totalApplicants > 0 ? Math.round((completedCount / totalApplicants) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar (Compact) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicant name, mobile, app number, login..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map((key) => (
                <option key={key} value={key} className="bg-slate-900">
                  {STATUS_CONFIG[key as OnlineApplicationStatus].label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Filter Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setPaymentFilter("ALL")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                paymentFilter === "ALL" ? "bg-cyan-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPaymentFilter("PAID")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                paymentFilter === "PAID" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Paid (Green)</span>
            </button>
            <button
              onClick={() => setPaymentFilter("PENDING")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                paymentFilter === "PENDING" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-amber-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Due</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View (Compact Rows) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            {/* Table Headings */}
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">APPLICANT / MOBILE / STATUS</th>
                <th className="py-2.5 px-3 min-w-[370px]">APPLICATIONS & NUMBER & LOGIN</th>
                <th className="py-2.5 px-3 min-w-[100px] text-right">BILL</th>
                <th className="py-2.5 px-3 min-w-[110px] text-right">PAID AMOUNT</th>
                <th className="py-2.5 px-3 min-w-[160px] text-center">PAY VIA QR & ACTIONS</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-800/80">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
                    <p className="text-xs font-bold text-slate-400">No Online Applications Found</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {searchTerm || statusFilter !== "ALL" || paymentFilter !== "ALL"
                        ? "Try clearing your filters or search terms."
                        : "Click '+ NEW APPLICANT' to create your first entry."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant, index) => {
                  const isPaid = isApplicantPaymentCompleted(applicant);
                  const balance = Math.max(0, applicant.billAmount - applicant.paidAmount);
                  const apps = applicant.applications || [];

                  // COMPACT ROW COLOR: GREEN if fully paid!
                  const rowClass = isPaid
                    ? "bg-emerald-950/40 hover:bg-emerald-950/60 border-l-4 border-l-emerald-500 transition-colors"
                    : "bg-slate-900/60 hover:bg-slate-850/80 transition-colors";

                  return (
                    <tr key={applicant.id} className={rowClass}>
                      {/* Index & Paid Icon */}
                      <td className="py-2.5 px-2.5 text-center align-top">
                        <div className="flex flex-col items-center justify-center gap-0.5 pt-0.5">
                          <span className="text-slate-500 font-mono text-[10px]">{index + 1}</span>
                          {isPaid && (
                            <span title="Payment Completed in Full" className="text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-950 text-emerald-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* APPLICANT, MOBILE NO, STATUS COMBINED IN ONE COLUMN (ONE BELOW ANOTHER) */}
                      <td className="py-2.5 px-3 align-top min-w-[200px]">
                        <div className="space-y-2">
                          {/* 1. APPLICANT NAME */}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-bold text-xs ${isPaid ? "text-emerald-100" : "text-white"}`}>
                                {applicant.applicantName}
                              </span>
                              {isPaid && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/90 text-emerald-200 border border-emerald-600">
                                  <Check className="w-2.5 h-2.5" />
                                  PAID
                                </span>
                              )}
                            </div>
                            {applicant.notes && (
                              <div className="text-[9px] text-slate-400 italic bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/80 line-clamp-1 mt-0.5">
                                {applicant.notes}
                              </div>
                            )}
                          </div>

                          {/* 2. MOBILE NO */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 font-bold text-cyan-300 text-xs">
                              <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                              <a href={`tel:${applicant.mobileNo}`} className="hover:underline" title="Click to Call">
                                {applicant.mobileNo}
                              </a>
                            </div>

                            <a
                              href={`https://wa.me/${
                                applicant.mobileNo.replace(/[^0-9]/g, "").length === 10
                                  ? `91${applicant.mobileNo.replace(/[^0-9]/g, "")}`
                                  : applicant.mobileNo.replace(/[^0-9]/g, "")
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] text-green-400 hover:text-green-300 bg-green-950/50 hover:bg-green-900/60 px-1.5 py-0.5 rounded border border-green-800/80 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <Share2 className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>

                          {/* 3. STATUS */}
                          <div className="pt-0.5">
                            <select
                              value={applicant.status}
                              onChange={(e) =>
                                handleStatusChange(applicant, e.target.value as OnlineApplicationStatus)
                              }
                              className={`w-full text-[10px] font-bold font-mono px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                STATUS_CONFIG[applicant.status]?.badgeClass || "bg-slate-800 text-white"
                              }`}
                            >
                              {Object.keys(STATUS_CONFIG).map((st) => (
                                <option key={st} value={st} className="bg-slate-900 text-white">
                                  {STATUS_CONFIG[st as OnlineApplicationStatus].label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* APPLICATIONS & NUMBER & LOGIN (COMPACT WITH PAYMENT ENTRY) */}
                      <td className="py-2 px-3 align-top">
                        <div className="space-y-1.5">
                          {apps.length === 0 ? (
                            <div className="text-slate-500 text-[10px] italic">
                              No applications linked yet.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {apps.map((app) => {
                                const aBill = app.billAmount || 0;
                                const aPaid = app.paidAmount || 0;
                                const aDue = Math.max(0, aBill - aPaid);
                                const isAppPaid = aBill > 0 && aPaid >= aBill;

                                return (
                                  <div
                                    key={app.id}
                                    className={`border rounded-lg p-1.5 space-y-1 transition-colors ${
                                      isAppPaid
                                        ? "bg-emerald-950/20 border-emerald-800/50"
                                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                                    }`}
                                  >
                                    {/* Application Name & Actions */}
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs sm:text-[13px] font-black px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-200 border border-cyan-700/80 uppercase tracking-wide">
                                          {app.portal}
                                        </span>
                                      </div>

                                      {/* Per-Application Payment Status Badge & "+ Pay" button */}
                                      <div className="flex items-center gap-1">
                                        {isAppPaid ? (
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                                            ₹{aPaid} PAID
                                          </span>
                                        ) : aDue > 0 ? (
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                            DUE: ₹{aDue}
                                          </span>
                                        ) : null}

                                        {/* "+ Payment" Button on each application */}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setPaymentModalTarget({ applicant, application: app })
                                          }
                                          className="text-[9px] font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 px-1.5 py-0.5 rounded transition-all cursor-pointer flex items-center gap-0.5"
                                          title={`Record payment or scan UPI QR for ${app.portal}`}
                                        >
                                          <IndianRupee className="w-2.5 h-2.5" />
                                          <span>+ Pay</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* App Number & Login ID Inline */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                                      {/* App No */}
                                      <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">No:</span>
                                        <div className="flex items-center gap-1 font-bold text-white truncate">
                                          <span className="truncate max-w-[130px] font-mono font-black text-xs sm:text-[13px] text-white tracking-wider">{app.applicationNumber}</span>
                                          <button
                                            onClick={() => handleCopy(app.applicationNumber, `no_${app.id}`)}
                                            className="text-slate-400 hover:text-cyan-300 shrink-0 p-0.5"
                                            title="Copy App Number"
                                          >
                                            {copiedKey === `no_${app.id}` ? (
                                              <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Login ID */}
                                      <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                        <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">ID:</span>
                                        <div className="flex items-center gap-1 font-bold text-emerald-400 truncate">
                                          <span className="truncate max-w-[110px] font-mono font-bold text-xs text-emerald-400 uppercase">{app.loginId}</span>
                                          <button
                                            onClick={() => handleCopy(app.loginId, `login_${app.id}`)}
                                            className="text-slate-400 hover:text-cyan-300 shrink-0 p-0.5"
                                            title="Copy Login ID"
                                          >
                                            {copiedKey === `login_${app.id}` ? (
                                              <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="w-3 h-3" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Button to manage / add more applications */}
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApplicantForApps(applicant);
                                setIsManageAppsModalOpen(true);
                              }}
                              className="w-full bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/50 hover:border-cyan-500 py-0.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>
                                {apps.length > 0
                                  ? `Manage Applications (${apps.length})`
                                  : "+ Add Application & Login"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* BILL */}
                      <td className="py-2.5 px-3 align-top text-right">
                        {editingCell?.id === applicant.id && editingCell?.field === "bill" ? (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              autoFocus
                              value={tempCellValue}
                              onChange={(e) => setTempCellValue(e.target.value)}
                              onBlur={() => saveInlineEdit(applicant)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveInlineEdit(applicant);
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              className="w-16 bg-slate-950 border border-cyan-500 rounded px-1 py-0.5 text-white font-bold text-right text-xs focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => startInlineEdit(applicant, "bill")}
                            className="group cursor-pointer flex flex-col items-end"
                            title="Click to edit Bill Amount"
                          >
                            <span className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors">
                              ₹{applicant.billAmount.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[8px] text-slate-500 group-hover:text-slate-400">
                              Edit
                            </span>
                          </div>
                        )}
                      </td>

                      {/* PAID AMOUNT */}
                      <td className="py-2.5 px-3 align-top text-right">
                        {editingCell?.id === applicant.id && editingCell?.field === "paid" ? (
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-emerald-400 text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              autoFocus
                              value={tempCellValue}
                              onChange={(e) => setTempCellValue(e.target.value)}
                              onBlur={() => saveInlineEdit(applicant)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveInlineEdit(applicant);
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              className="w-16 bg-slate-950 border border-emerald-500 rounded px-1 py-0.5 text-emerald-400 font-bold text-right text-xs focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => startInlineEdit(applicant, "paid")}
                            className="group cursor-pointer flex flex-col items-end"
                            title="Click to edit Paid Amount"
                          >
                            <span className="font-bold text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors">
                              ₹{applicant.paidAmount.toLocaleString("en-IN")}
                            </span>

                            {balance > 0 ? (
                              <span className="text-[9px] text-amber-400 font-bold">
                                Due: ₹{balance.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-400 font-bold">
                                Settled
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* PAY VIA QR CODE & ACTIONS */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* QR CODE PAYMENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApplicantForQr(applicant);
                              setIsQrModalOpen(true);
                            }}
                            className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm ${
                              isPaid
                                ? "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600"
                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20"
                            }`}
                            title={`Pay via UPI QR to 9567627277@SLC (Balance: ₹${balance})`}
                          >
                            <QrCode className="w-3 h-3 shrink-0" />
                            <span>
                              {isPaid ? "VIEW QR" : `PAY ₹${balance.toLocaleString("en-IN")} QR`}
                            </span>
                          </button>

                          {/* Action Icon buttons: Edit, Delete */}
                          <div className="flex items-center gap-1.5 w-full justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingApplicant(applicant);
                                setIsApplicantModalOpen(true);
                              }}
                              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit Applicant"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>

                            {/* Safe Delete Button (opens in-app confirm dialog) */}
                            <button
                              type="button"
                              onClick={() =>
                                setApplicantToDelete({ id: applicant.id, name: applicant.applicantName })
                              }
                              className="px-2 py-0.5 bg-rose-950/40 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 rounded border border-rose-900/50 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Delete Applicant"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary bar */}
        <div className="bg-slate-950 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Showing <strong className="text-white">{filteredApplicants.length}</strong> of{" "}
              <strong className="text-white">{totalApplicants}</strong> applicants
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Green rows = Payment Completed in full
            </span>
          </div>

          <div className="flex items-center gap-4 font-bold">
            <span className="text-slate-300">
              Total Due: <span className="text-amber-400">₹{totalBalance.toLocaleString("en-IN")}</span>
            </span>
            <span className="text-slate-300">
              UPI VPA: <strong className="text-cyan-300">{DEFAULT_RECEIVER_UPI}</strong>
            </span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* MODAL 1: ADD / EDIT APPLICANT */}
      <ApplicantFormModal
        applicant={editingApplicant}
        isOpen={isApplicantModalOpen}
        onClose={() => {
          setIsApplicantModalOpen(false);
          setEditingApplicant(null);
        }}
        onSaved={(savedRecord) => {
          const current = loadOnlineApplicants();
          setApplicants(current);
        }}
      />

      {/* MODAL 2: MANAGE APPLICATIONS */}
      <ManageApplicationsModal
        applicant={selectedApplicantForApps}
        isOpen={isManageAppsModalOpen}
        onClose={() => {
          setIsManageAppsModalOpen(false);
          setSelectedApplicantForApps(null);
        }}
        onUpdated={(updatedRecord) => {
          const current = loadOnlineApplicants();
          setApplicants(current);
        }}
      />

      {/* MODAL 3: UPI QR PAYMENT MODAL (APPLICANT LEVEL) */}
      <ApplicantPaymentQrModal
        applicant={selectedApplicantForQr}
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setSelectedApplicantForQr(null);
        }}
        onPaymentRecorded={(updatedRecord) => {
          const current = loadOnlineApplicants();
          setApplicants(current);
        }}
      />

      {/* MODAL 4: PER-APPLICATION PAYMENT MODAL */}
      {paymentModalTarget && (
        <ApplicationPaymentModal
          applicant={paymentModalTarget.applicant}
          application={paymentModalTarget.application}
          isOpen={!!paymentModalTarget}
          onClose={() => setPaymentModalTarget(null)}
          onSaved={(updatedRecord) => {
            const current = loadOnlineApplicants();
            setApplicants(current);
            setPaymentModalTarget(null);
          }}
        />
      )}

      {/* MODAL 5: SAFE IN-APP DELETE CONFIRMATION MODAL */}
      {applicantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-sans">
                Delete Applicant Record?
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-rose-300">"{applicantToDelete.name}"</strong> and all their linked applications?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplicantToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteApplicant}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs font-mono cursor-pointer transition-all shadow-lg shadow-rose-600/20"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
