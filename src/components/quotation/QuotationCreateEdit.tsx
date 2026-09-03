import React, { useState, useEffect, useMemo } from "react";
import { Quotation, QuotationLineItem, QuotationService, Contractor, TermsClause, QuotationStatus } from "../../types";
import { formatINR, generateNextQuotationNo } from "../../utils/quotationStorageManager";
import { numberToWordsIndian } from "../../utils/numberToWords";
import {
  Plus,
  Trash2,
  Save,
  Printer,
  ChevronDown,
  Sparkles,
  Users,
  CheckSquare,
  Square,
  ShieldCheck,
  FileText,
  Calculator,
  Percent,
  DollarSign,
  AlertCircle,
  HelpCircle,
  X,
  Layers,
  ArrowLeft
} from "lucide-react";

interface QuotationCreateEditProps {
  initialQuotation?: Quotation | null;
  services: QuotationService[];
  contractors: Contractor[];
  termsClauses: TermsClause[];
  allQuotations: Quotation[];
  onSave: (quotation: Quotation) => void;
  onCancel: () => void;
  onPreview: (quotation: Quotation) => void;
  onAddNewContractor: (contractor: Omit<Contractor, "id" | "created_at">) => Contractor;
}

export const QuotationCreateEdit: React.FC<QuotationCreateEditProps> = ({
  initialQuotation,
  services,
  contractors,
  termsClauses,
  allQuotations,
  onSave,
  onCancel,
  onPreview,
  onAddNewContractor
}) => {
  const isEditing = !!initialQuotation;

  // Auto-calculated defaults
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Form State
  const [quotationNo, setQuotationNo] = useState(
    initialQuotation?.quotation_no || generateNextQuotationNo(allQuotations)
  );
  const [status, setStatus] = useState<QuotationStatus>(initialQuotation?.status || "pending");
  const [clientName, setClientName] = useState(initialQuotation?.client_name || "");
  const [clientPhone, setClientPhone] = useState(initialQuotation?.client_phone || "");
  const [clientEmail, setClientEmail] = useState(initialQuotation?.client_email || "");
  const [siteAddress, setSiteAddress] = useState(initialQuotation?.site_address || "");
  const [plotArea, setPlotArea] = useState<string | number>(initialQuotation?.plot_area_sqft || "");
  const [dateIssued, setDateIssued] = useState(initialQuotation?.date_issued || todayStr);
  const [expiryDate, setExpiryDate] = useState(initialQuotation?.expiry_date || defaultExpiry);

  // Line items state
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(() => {
    if (initialQuotation?.line_items && initialQuotation.line_items.length > 0) {
      return initialQuotation.line_items;
    }
    // Default initial row
    return [
      {
        id: `li_${Date.now()}_1`,
        description: "Rubble Soling & Basement RR Masonry in CM 1:6",
        unit: "cum",
        quantity: 35,
        rate: 5200,
        include_material: true,
        include_labour: true,
        material_rate: 3400,
        labour_rate: 1800,
        amount: 182000
      }
    ];
  });

  // Discount and Tax
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    initialQuotation?.discount_type || "amount"
  );
  const [discountValue, setDiscountValue] = useState<number>(initialQuotation?.discount_value || 0);
  const [enableTax, setEnableTax] = useState<boolean>(initialQuotation?.enable_tax || false);
  const [taxRate, setTaxRate] = useState<number>(initialQuotation?.tax_rate || 18);

  // Notes
  const [notes, setNotes] = useState(
    initialQuotation?.notes ||
      "All rates quoted are inclusive of standard scaffolding, site supervision, and curing as per IS specification. Quality testing certificate for steel and cement will be provided upon request."
  );

  // Terms and conditions clause ids
  const [selectedTermsIds, setSelectedTermsIds] = useState<string[]>(() => {
    if (initialQuotation?.terms_clause_ids) {
      return initialQuotation.terms_clause_ids;
    }
    // Pre-tick default clauses
    return termsClauses.filter((t) => t.is_default).map((t) => t.id);
  });

  // Assigned contractors
  const [assignedContractorIds, setAssignedContractorIds] = useState<string[]>(
    initialQuotation?.contractor_ids || []
  );
  const [showContractorsOnPrint, setShowContractorsOnPrint] = useState<boolean>(
    initialQuotation?.show_contractors_on_print || false
  );

  // Modal / Dropdown states
  const [showServicePicker, setShowServicePicker] = useState<boolean>(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showNewContractorModal, setShowNewContractorModal] = useState(false);
  const [newContractorName, setNewContractorName] = useState("");
  const [newContractorTrade, setNewContractorTrade] = useState("Masonry / Structure");
  const [newContractorPhone, setNewContractorPhone] = useState("");
  const [newContractorCompany, setNewContractorCompany] = useState("");

  // Validation
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // LIVE TOTALS CALCULATION
  const { subtotal, materialSubtotal, labourSubtotal, discountAmount, taxAmount, grandTotal } =
    useMemo(() => {
      let sub = 0;
      let matSub = 0;
      let labSub = 0;

      lineItems.forEach((item) => {
        const itemAmt = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
        sub += itemAmt;

        if (item.include_material && item.material_rate) {
          matSub += (Number(item.quantity) || 0) * Number(item.material_rate);
        }
        if (item.include_labour && item.labour_rate) {
          labSub += (Number(item.quantity) || 0) * Number(item.labour_rate);
        }
      });

      let disc = 0;
      if (discountType === "percentage") {
        disc = (sub * (Number(discountValue) || 0)) / 100;
      } else {
        disc = Number(discountValue) || 0;
      }
      disc = Math.min(disc, sub);

      const afterDiscount = Math.max(sub - disc, 0);

      let tax = 0;
      if (enableTax) {
        tax = (afterDiscount * (Number(taxRate) || 0)) / 100;
      }

      const total = Math.round(afterDiscount + tax);

      return {
        subtotal: Math.round(sub),
        materialSubtotal: Math.round(matSub),
        labourSubtotal: Math.round(labSub),
        discountAmount: Math.round(disc),
        taxAmount: Math.round(tax),
        grandTotal: total
      };
    }, [lineItems, discountType, discountValue, enableTax, taxRate]);

  // Handle line item modifications
  const updateLineItem = (index: number, field: keyof QuotationLineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };

      // If user toggles Material or Labour, dynamically update rate
      if (field === "include_material" || field === "include_labour") {
        const hasMat = field === "include_material" ? Boolean(value) : target.include_material;
        const hasLab = field === "include_labour" ? Boolean(value) : target.include_labour;

        const mRate = target.material_rate || 0;
        const lRate = target.labour_rate || 0;

        if (hasMat && hasLab) {
          target.rate = mRate + lRate || target.rate;
        } else if (hasMat) {
          target.rate = mRate || target.rate;
        } else if (hasLab) {
          target.rate = lRate || target.rate;
        }
      }

      // Live amount calculation
      target.amount = Math.round((Number(target.quantity) || 0) * (Number(target.rate) || 0));
      updated[index] = target;
      return updated;
    });
  };

  const addCustomLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li_${Date.now()}_${prev.length + 1}`,
        description: "",
        unit: "sq.ft",
        quantity: 1,
        rate: 0,
        include_material: true,
        include_labour: true,
        material_rate: 0,
        labour_rate: 0,
        amount: 0
      }
    ]);
  };

  const addServiceFromMaster = (srv: QuotationService) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li_${Date.now()}_${srv.id}`,
        service_id: srv.id,
        description: srv.name,
        unit: srv.unit,
        quantity: 100,
        rate: srv.combined_rate,
        include_material: true,
        include_labour: true,
        material_rate: srv.material_rate,
        labour_rate: srv.labour_rate,
        amount: srv.combined_rate * 100
      }
    ]);
    setShowServicePicker(false);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Build the complete Quotation object
  const buildQuotationObject = (customStatus?: QuotationStatus): Quotation => {
    const now = new Date().toISOString();
    return {
      id: initialQuotation?.id || `qtn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quotation_no: quotationNo.trim(),
      status: customStatus || status,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      client_email: clientEmail.trim() || undefined,
      site_address: siteAddress.trim(),
      plot_area_sqft: plotArea || undefined,
      date_issued: dateIssued,
      expiry_date: expiryDate,
      line_items: lineItems,
      discount_type: discountType,
      discount_value: Number(discountValue) || 0,
      discount_amount: discountAmount,
      enable_tax: enableTax,
      tax_rate: enableTax ? Number(taxRate) || 0 : 0,
      tax_amount: taxAmount,
      subtotal,
      material_subtotal: materialSubtotal,
      labour_subtotal: labourSubtotal,
      total: grandTotal,
      notes: notes.trim(),
      terms_clause_ids: selectedTermsIds,
      contractor_ids: assignedContractorIds,
      show_contractors_on_print: showContractorsOnPrint,
      created_at: initialQuotation?.created_at || now,
      updated_at: now
    };
  };

  const handleSaveAction = (targetStatus: QuotationStatus) => {
    if (!clientName.trim()) {
      setErrorMessage("Please provide the Client Name.");
      return;
    }
    if (!quotationNo.trim()) {
      setErrorMessage("Please enter a valid Quotation Number.");
      return;
    }
    if (lineItems.length === 0) {
      setErrorMessage("Please add at least one line item to the quotation.");
      return;
    }

    setErrorMessage(null);
    const obj = buildQuotationObject(targetStatus);
    onSave(obj);
  };

  const handlePreviewAction = () => {
    if (!clientName.trim()) {
      setErrorMessage("Please provide the Client Name before previewing.");
      return;
    }
    const obj = buildQuotationObject(status);
    onPreview(obj);
  };

  // Filter services for modal
  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return services;
    const q = serviceSearch.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        s.unit.toLowerCase().includes(q)
    );
  }, [services, serviceSearch]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-black tracking-wide text-white">
                {isEditing ? `Edit Quotation: ${quotationNo}` : "Create New Quotation"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase">
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live calculation of material & labour breakdown • Printable letterhead layout
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn_preview_quotation"
            onClick={handlePreviewAction}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Preview & Print (A4)
          </button>

          <button
            id="btn_save_draft"
            onClick={() => handleSaveAction("draft")}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            Save Draft
          </button>

          <button
            id="btn_save_pending"
            onClick={() => handleSaveAction("pending")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save & Mark Pending
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Document Form Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
        {/* Section 1: Quotation Metadata & Client Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          {/* Left: Client Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> Client & Site Information
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Prints on Letterhead</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Client Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Harikrishnan Nambiar"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Client Phone / Mobile
                </label>
                <input
                  type="text"
                  placeholder="+91 98471 23456"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Client Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="client@gmail.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Plot / Built-up Area (Sq.Ft)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2450 sq.ft"
                  value={plotArea}
                  onChange={(e) => setPlotArea(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Site / Construction Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 14, Haritha Valley, Keralassery, Palakkad"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Quotation Settings & Validity */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-sm font-serif font-bold text-amber-400 uppercase tracking-wider">
              Quotation Metadata
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Quotation Number
                </label>
                <input
                  type="text"
                  value={quotationNo}
                  onChange={(e) => setQuotationNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Date Issued
                  </label>
                  <input
                    type="date"
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer uppercase font-semibold"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved & Confirmed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Service Line Items Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Work Items & Schedule of Quantities
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle Material / Labour checkboxes to pull rates from the master catalog
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowServicePicker(true)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                Select From Rate List
              </button>

              <button
                type="button"
                onClick={addCustomLineItem}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Custom Row
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[240px]">Work Description & Specifications</th>
                  <th className="py-3 px-2 w-24">Unit</th>
                  <th className="py-3 px-2 w-20 text-right">Qty</th>
                  <th className="py-3 px-2 w-16 text-center">Mat</th>
                  <th className="py-3 px-2 w-16 text-center">Lab</th>
                  <th className="py-3 px-2 w-28 text-right">Rate (₹)</th>
                  <th className="py-3 px-3 w-32 text-right">Amount (₹)</th>
                  <th className="py-3 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lineItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="Work description..."
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-amber-500 text-slate-200 text-xs px-1 py-1 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="text"
                        placeholder="unit"
                        value={item.unit}
                        onChange={(e) => updateLineItem(idx, "unit", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-right font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.include_material}
                        onChange={(e) => updateLineItem(idx, "include_material", e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer bg-slate-900 border-slate-700"
                        title="Include Material component"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.include_labour}
                        onChange={(e) => updateLineItem(idx, "include_labour", e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer bg-slate-900 border-slate-700"
                        title="Include Labour component"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(e) => updateLineItem(idx, "rate", parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-right font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {formatINR(item.amount)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-30 cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Summary, Discounts, Tax & Grand Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Left: Notes & Assigned Contractors */}
          <div className="space-y-5">
            {/* Contractors on this job */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Assigned Site Contractors
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewContractorModal(true)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  + Quick Add
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Tag specialists executing these works (Internal reference by default)
              </p>

              <div className="flex flex-wrap gap-1.5">
                {contractors.map((c) => {
                  const isSelected = assignedContractorIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setAssignedContractorIds((prev) => prev.filter((id) => id !== c.id));
                        } else {
                          setAssignedContractorIds((prev) => [...prev, c.id]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({c.trade})</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk_show_contractors"
                  checked={showContractorsOnPrint}
                  onChange={(e) => setShowContractorsOnPrint(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer bg-slate-900 border-slate-700"
                />
                <label htmlFor="chk_show_contractors" className="text-xs text-slate-400 cursor-pointer">
                  Show assigned contractors on client printed quotation
                </label>
              </div>
            </div>

            {/* Notes to Client */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Notes & Scope Clarifications (Printed on Quotation)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific architectural notes, exclusions, or curing schedules..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Right: Calculations & Totals */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Quotation Financial Summary
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-bold text-white">{formatINR(subtotal)}</span>
              </div>

              {/* Material vs Labour Subtotal preview */}
              {(materialSubtotal > 0 || labourSubtotal > 0) && (
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Material: {formatINR(materialSubtotal)}</span>
                  <span>Labour: {formatINR(labourSubtotal)}</span>
                </div>
              )}

              {/* Discount Selector */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Special Discount:</span>
                  <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDiscountType("amount")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        discountType === "amount"
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("percentage")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        discountType === "percentage"
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>

                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right font-mono text-xs text-rose-400 focus:outline-none focus:border-rose-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-400 text-[11px]">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-{formatINR(discountAmount)}</span>
                </div>
              )}

              {/* GST / Tax Toggle */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTax}
                    onChange={(e) => setEnableTax(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer bg-slate-900 border-slate-700"
                  />
                  <span className="text-slate-300">Apply GST</span>
                </label>

                {enableTax && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18% (Standard)</option>
                    </select>
                    <span className="font-mono text-slate-300">{formatINR(taxAmount)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t-2 border-amber-500/30 flex items-center justify-between text-base md:text-lg font-black text-white">
                <span className="font-serif">Grand Total (INR):</span>
                <span className="font-mono text-amber-400 text-xl md:text-2xl">
                  {formatINR(grandTotal)}
                </span>
              </div>

              {/* In Words */}
              <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                {numberToWordsIndian(grandTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Terms & Conditions Selection */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Terms & Conditions To Print
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select which clauses from the Master Terms Library apply to this quotation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTermsIds(termsClauses.map((t) => t.id))}
                className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setSelectedTermsIds([])}
                className="text-[11px] text-slate-400 hover:underline font-semibold cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {termsClauses.map((term, idx) => {
              const isChecked = selectedTermsIds.includes(term.id);
              return (
                <div
                  key={term.id}
                  onClick={() => {
                    if (isChecked) {
                      setSelectedTermsIds((prev) => prev.filter((id) => id !== term.id));
                    } else {
                      setSelectedTermsIds((prev) => [...prev, term.id]);
                    }
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                    isChecked
                      ? "bg-slate-900 border-amber-500/40 text-slate-200"
                      : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer bg-slate-900 border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="font-semibold text-white block">
                      {term.order}. {term.title}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{term.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel & Exit
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePreviewAction}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Preview Document
            </button>

            <button
              type="button"
              onClick={() => handleSaveAction("approved")}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer"
            >
              Save & Mark Approved
            </button>

            <button
              type="button"
              onClick={() => handleSaveAction("pending")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Quotation
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Select from Rate List */}
      {showServicePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-white">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Service & Rate Master Library
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any item to add it directly to this quotation
                </p>
              </div>
              <button
                onClick={() => setShowServicePicker(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800">
              <input
                type="text"
                placeholder="Search services by name, category, or unit (e.g., Rubble, Brick, RCC)..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto p-4 space-y-2 flex-1">
              {filteredServices.length > 0 ? (
                filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => addServiceFromMaster(srv)}
                    className="p-3 bg-slate-950/60 hover:bg-amber-500/10 border border-slate-800/80 hover:border-amber-500/40 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition text-xs group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-amber-300 block">
                        {srv.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {srv.category} • Unit: {srv.unit}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-amber-400 text-sm block">
                        {formatINR(srv.combined_rate)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Mat: {formatINR(srv.material_rate)} | Lab: {formatINR(srv.labour_rate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No services found matching "{serviceSearch}".
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowServicePicker(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Quick Add Contractor */}
      {showNewContractorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Add New Contractor
              </h3>
              <button
                onClick={() => setShowNewContractorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Contractor / Technician Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newContractorName}
                  onChange={(e) => setNewContractorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Trade / Specialty</label>
                <select
                  value={newContractorTrade}
                  onChange={(e) => setNewContractorTrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                  <option value="Masonry / Structure">Masonry / Structure</option>
                  <option value="Carpentry / Joinery">Carpentry / Joinery</option>
                  <option value="Flooring & Tile">Flooring & Tile</option>
                  <option value="Painting & Polish">Painting & Polish</option>
                  <option value="Fabrication / Metal">Fabrication / Metal</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company / Firm Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Electricals"
                  value={newContractorCompany}
                  onChange={(e) => setNewContractorCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 94471 00000"
                  value={newContractorPhone}
                  onChange={(e) => setNewContractorPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewContractorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!newContractorName.trim()) return;
                  const created = onAddNewContractor({
                    name: newContractorName.trim(),
                    company_name: newContractorCompany.trim() || undefined,
                    trade: newContractorTrade,
                    phone: newContractorPhone.trim() || "+91 00000 00000"
                  });
                  setAssignedContractorIds((prev) => [...prev, created.id]);
                  setShowNewContractorModal(false);
                  setNewContractorName("");
                  setNewContractorPhone("");
                  setNewContractorCompany("");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
              >
                Save & Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
