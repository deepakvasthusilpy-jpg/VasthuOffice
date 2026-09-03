import React, { useState } from "react";
import { CrmProject, StaffName, ProjectStatus, Invoice } from "../../../types";
import {
  FolderKanban,
  Search,
  Filter,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  ChevronRight,
  Eye,
  Building2,
  Phone,
  MapPin,
  Check,
  Edit3,
  Trash2,
  RotateCcw,
  LayoutGrid,
  List,
  IndianRupee,
  CheckCircle,
  TrendingUp,
  Layers,
  Sparkles,
  Share2,
  QrCode,
  CreditCard,
  Receipt,
  ExternalLink,
  Database
} from "lucide-react";

interface ProjectsListViewProps {
  projects: CrmProject[];
  invoices?: Invoice[];
  onSelectProject: (project: CrmProject) => void;
  onUpdateProject: (updated: CrmProject) => void;
  onEditProject?: (project: CrmProject) => void;
  onDeleteProject?: (id: string) => void;
  onShareProject?: (project: CrmProject) => void;
  onReloadProjects?: () => void;
  onOpenNewProjectModal: () => void;
  onRecordPaymentForInvoice?: (invoice: Invoice) => void;
  onCreateInvoiceForProject?: (project: CrmProject) => void;
  onSelectInvoice?: (invoice: Invoice) => void;
  onOpenBackupRestore?: () => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  projects,
  invoices = [],
  onSelectProject,
  onUpdateProject,
  onEditProject,
  onDeleteProject,
  onShareProject,
  onReloadProjects,
  onOpenNewProjectModal,
  onRecordPaymentForInvoice,
  onCreateInvoiceForProject,
  onSelectInvoice,
  onOpenBackupRestore
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const staffList: StaffName[] = ["DEEPAK", "VISHNU", "DIBIN"];
  const statuses: ProjectStatus[] = [
    "PENDING",
    "LAND SURVEY",
    "PROGRESS",
    "READY TO SUBMIT",
    "COMPLETED"
  ];

  // Reload window handler
  const handleReload = () => {
    setIsReloading(true);
    setStatusFilter("ALL");
    setAssigneeFilter("ALL");
    setSearchTerm("");
    if (onReloadProjects) {
      onReloadProjects();
    }
    setToastMessage("Project window reloaded & filters reset.");
    setTimeout(() => {
      setIsReloading(false);
    }, 600);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Quick Assignee Swap directly on list row
  const handleSwapAssignee = (
    e: React.MouseEvent,
    project: CrmProject,
    newStaff: StaffName
  ) => {
    e.stopPropagation();
    if (newStaff === project.assignee) return;
    const updated: CrmProject = {
      ...project,
      assignee: newStaff,
      activities: [
        {
          id: `act_${Date.now()}`,
          actor: newStaff,
          action: `Swapped assignee to ${newStaff}`,
          timestamp: new Date().toLocaleString()
        },
        ...project.activities
      ]
    };
    onUpdateProject(updated);
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesAssignee =
      assigneeFilter === "ALL" || p.assignee === assigneeFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientPhone.includes(searchTerm) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesAssignee && matchesSearch;
  });

  // Calculate Status Counts & Financial Totals
  const getStatusCount = (st: string) => {
    if (st === "ALL") return projects.length;
    return projects.filter((p) => p.status === st).length;
  };

  const totalValuation = projects.reduce(
    (sum, p) => sum + (p.estimatedAmount || 0),
    0
  );
  const completedCount = projects.filter((p) => p.status === "COMPLETED").length;
  const activeCount = projects.filter(
    (p) => p.status === "PROGRESS" || p.status === "LAND SURVEY"
  ).length;

  const getStatusBadgeStyle = (st: ProjectStatus) => {
    switch (st) {
      case "PENDING":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "LAND SURVEY":
        return "bg-blue-950 text-blue-300 border-blue-800";
      case "PROGRESS":
        return "bg-amber-950 text-amber-300 border-amber-800";
      case "READY TO SUBMIT":
        return "bg-cyan-950 text-cyan-300 border-cyan-800";
      case "COMPLETED":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-950 hover:text-white font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* EXECUTIVE TOP KPI BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              TOTAL REGISTERED
            </span>
            <FolderKanban className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">
              {projects.length}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Projects Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Vasthusilpy Engineering CRM
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              IN PROGRESS / SURVEY
            </span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">
              {activeCount}
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              Ongoing Works
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Active Site Operations
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              COMPLETED PERMITS
            </span>
            <CheckCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-sans">
              {completedCount}
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {projects.length > 0
                ? Math.round((completedCount / projects.length) * 100)
                : 0}
              % Completion
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Delivered to Clients
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              CONTRACT PIPELINE
            </span>
            <IndianRupee className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-purple-300 font-sans">
              ₹{totalValuation.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Total Project Value
          </p>
        </div>
      </div>

      {/* TOP HEADER & ACTION CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 uppercase">
              PROFESSIONAL CRM ENGINE
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {filteredProjects.length} Displayed
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Vasthusilpy Project Pipeline & Window
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Real-time project tracking, staff assignments, customer contacts, and task management.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* OFFLINE BACKUP & RESTORE BUTTON */}
          {onOpenBackupRestore && (
            <button
              type="button"
              onClick={onOpenBackupRestore}
              className="bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/80 hover:border-cyan-500 px-4 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
              title="Backup or restore all CRM projects, invoices, and estimates offline"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>OFFLINE BACKUP & RESTORE</span>
            </button>
          )}

          {/* RELOAD PROJECT WINDOW BUTTON */}
          <button
            onClick={handleReload}
            className={`bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 px-4 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isReloading ? "opacity-75" : ""
            }`}
            title="Reload and Refresh Project Window Data"
          >
            <RotateCcw
              className={`w-4 h-4 text-cyan-400 ${
                isReloading ? "animate-spin text-emerald-400" : ""
              }`}
            />
            <span>RELOAD WINDOW</span>
          </button>

          {/* VIEW MODE TOGGLE */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid Cards Layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Executive Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* NEW PROJECT BUTTON */}
          <button
            onClick={onOpenNewProjectModal}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NEW CRM PROJECT</span>
          </button>
        </div>
      </div>

      {/* PIPELINE STATUS FILTER TABS */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center gap-2 shadow-lg">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <span>ALL PROJECTS</span>
          <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-full font-black">
            {getStatusCount("ALL")}
          </span>
        </button>

        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>{st}</span>
            <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-full font-black">
              {getStatusCount(st)}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH BAR & STAFF SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, client name, mobile phone, survey location..."
            className="w-full bg-transparent text-white focus:outline-none placeholder:text-slate-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-slate-500 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Staff Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase text-[11px]">Staff Assignee:</span>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL STAFF (DEEPAK, VISHNU, DIBIN)</option>
            {staffList.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN CONTENT DISPLAY VIEW */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300 font-sans">
            No Projects Matching Criteria
          </h3>
          <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
            No projects matched your active filters. Click "RELOAD WINDOW" or create a new CRM project above.
          </p>
          <button
            onClick={handleReload}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer"
          >
            Reset Filters & Reload Window
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const totalSt = proj.subTasks.length;
            const doneSt = proj.subTasks.filter((st) => st.completed).length;
            const percent = totalSt > 0 ? Math.round((doneSt / totalSt) * 100) : 0;

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-5 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between space-y-4 hover:shadow-2xl relative group"
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      #{proj.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${getStatusBadgeStyle(
                        proj.status
                      )}`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-sans line-clamp-1 group-hover:text-emerald-300 transition-colors">
                      {proj.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 pt-1">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-white">{proj.clientName}</span>
                    </div>
                  </div>

                  {/* Client Contact & Location */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-cyan-400" />
                        <span>Phone:</span>
                      </span>
                      <span className="font-bold text-cyan-300">{proj.clientPhone}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Location:</span>
                      </span>
                      <span className="font-bold text-slate-300 line-clamp-1">{proj.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>Due Date:</span>
                      </span>
                      <span className="font-bold text-emerald-400">{proj.dueDate}</span>
                    </div>
                  </div>

                  {/* Invoice & Payment Button Bar */}
                  {(() => {
                    const linkedInvoice = (invoices || []).find(
                      (inv) => inv.projectId === proj.id || (proj.invoiceId && inv.id === proj.invoiceId)
                    );

                    return (
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                            <span>INVOICE & PAYMENT:</span>
                          </span>
                          {linkedInvoice ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectInvoice) onSelectInvoice(linkedInvoice);
                              }}
                              className="text-cyan-300 hover:text-cyan-200 hover:underline font-bold font-mono text-[11px] cursor-pointer flex items-center gap-1"
                              title="Click to view full invoice"
                            >
                              <span>#{linkedInvoice.invoiceNumber}</span>
                              <ExternalLink className="w-3 h-3 text-cyan-400" />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No Invoice</span>
                          )}
                        </div>

                        {linkedInvoice ? (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                            <div className="text-[11px] font-mono">
                              <span
                                className={`font-bold block ${
                                  linkedInvoice.paymentStatus === "PAID"
                                    ? "text-emerald-400"
                                    : linkedInvoice.paymentStatus === "PARTIALLY PAID"
                                    ? "text-amber-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {linkedInvoice.paymentStatus || "UNPAID"}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {linkedInvoice.balanceDue > 0
                                  ? `Due: ₹${linkedInvoice.balanceDue.toLocaleString("en-IN")}`
                                  : `Total: ₹${linkedInvoice.grandTotal.toLocaleString("en-IN")}`}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onRecordPaymentForInvoice) {
                                  onRecordPaymentForInvoice(linkedInvoice);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                                linkedInvoice.paymentStatus === "PAID"
                                  ? "bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20"
                              }`}
                              title="Record payment for linked invoice"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>
                                {linkedInvoice.paymentStatus === "PAID" ? "Payment Log" : "Pay Invoice"}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-500">Unbilled Project</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onCreateInvoiceForProject) {
                                  onCreateInvoiceForProject(proj);
                                }
                              }}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              title="Create an invoice for this project"
                            >
                              <Plus className="w-3 h-3 text-cyan-400" />
                              <span>Create Invoice</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Staff Switcher & Invoice Bar */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Assignee:</span>
                    <div
                      className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {staffList.map((st) => (
                        <button
                          key={st}
                          onClick={(e) => handleSwapAssignee(e, proj, st)}
                          className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                            proj.assignee === st
                              ? "bg-cyan-500 text-slate-950 shadow-sm font-black"
                              : "text-slate-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtask Progress Bar */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-bold uppercase">Subtasks Completion</span>
                      <span className="font-bold text-emerald-400">{doneSt}/{totalSt} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Actions Row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj);
                      }}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>DETAILS</span>
                    </button>

                    {/* Quick Share, Edit & Delete Actions */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onShareProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareProject(proj);
                          }}
                          className="px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Share Project via QR Code & Link"
                        >
                          <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                          <span>SHARE</span>
                        </button>
                      )}

                      {onEditProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditProject(proj);
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl transition-colors cursor-pointer"
                          title="Edit Project Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(proj.id);
                          }}
                          className="p-2 bg-slate-950 hover:bg-red-950 text-red-400 border border-slate-800 hover:border-red-800 rounded-xl transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / EXECUTIVE PIPELINE VIEW */
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Project ID</th>
                <th className="py-3.5 px-4">Title & Client</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Subtasks</th>
                <th className="py-3.5 px-4">Invoice & Payment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredProjects.map((proj) => {
                const totalSt = proj.subTasks.length;
                const doneSt = proj.subTasks.filter((st) => st.completed).length;

                return (
                  <tr
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      #{proj.id}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-white line-clamp-1">{proj.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span>{proj.clientName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {proj.clientPhone}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-sans">
                      {proj.location}
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {staffList.map((st) => (
                          <button
                            key={st}
                            onClick={(e) => handleSwapAssignee(e, proj, st)}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                              proj.assignee === st
                                ? "bg-cyan-500 text-slate-950 font-black"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${getStatusBadgeStyle(
                          proj.status
                        )}`}
                      >
                        {proj.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-bold">
                      {doneSt}/{totalSt}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {(() => {
                        const linkedInvoice = (invoices || []).find(
                          (inv) => inv.projectId === proj.id || (proj.invoiceId && inv.id === proj.invoiceId)
                        );

                        return linkedInvoice ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onRecordPaymentForInvoice) {
                                onRecordPaymentForInvoice(linkedInvoice);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                              linkedInvoice.paymentStatus === "PAID"
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900"
                                : "bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400 font-black shadow-md shadow-emerald-500/20"
                            }`}
                            title={`Record payment for Invoice #${linkedInvoice.invoiceNumber}`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>
                              {linkedInvoice.paymentStatus === "PAID"
                                ? `Paid #${linkedInvoice.invoiceNumber}`
                                : `Pay #${linkedInvoice.invoiceNumber} (₹${linkedInvoice.balanceDue.toLocaleString("en-IN")})`}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCreateInvoiceForProject) {
                                onCreateInvoiceForProject(proj);
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-cyan-400" />
                            <span>Add Invoice</span>
                          </button>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectProject(proj)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-emerald-400 rounded-lg border border-slate-800 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {onShareProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareProject(proj);
                            }}
                            className="p-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded-lg border border-cyan-800 cursor-pointer"
                            title="Share Project via QR Code & Link"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}

                        {onEditProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProject(proj);
                            }}
                            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-800 cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {onDeleteProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject(proj.id);
                            }}
                            className="p-1.5 bg-slate-950 hover:bg-red-950 text-red-400 rounded-lg border border-slate-800 cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
