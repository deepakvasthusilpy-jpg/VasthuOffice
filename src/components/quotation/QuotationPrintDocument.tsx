import React from "react";
import { Quotation, QuotationService, Contractor, TermsClause } from "../../types";
import { formatINR, getComputedStatus } from "../../utils/quotationStorageManager";
import { numberToWordsIndian } from "../../utils/numberToWords";
import { triggerPrint } from "../../utils/printHelper";
import { Printer, X, Download, ShieldCheck, Building2, Phone, Mail, MapPin, Calendar, CheckCircle } from "lucide-react";

interface QuotationPrintDocumentProps {
  quotation: Quotation;
  services: QuotationService[];
  contractors: Contractor[];
  termsClauses: TermsClause[];
  onClose: () => void;
  onEdit?: (quotation: Quotation) => void;
}

export const QuotationPrintDocument: React.FC<QuotationPrintDocumentProps> = ({
  quotation,
  contractors,
  termsClauses,
  onClose,
  onEdit
}) => {
  const computedStatus = getComputedStatus(quotation);

  // Selected terms
  const selectedTerms = termsClauses
    .filter((t) => quotation.terms_clause_ids.includes(t.id))
    .sort((a, b) => a.order - b.order);

  // Assigned contractors
  const assignedContractors = contractors.filter((c) =>
    quotation.contractor_ids?.includes(c.id)
  );

  const handlePrint = () => {
    triggerPrint(
      `Quotation_${quotation.quotation_no}_${quotation.client_name.replace(/\s+/g, "_")}`,
      "printable-quotation-sheet",
      { pageMargin: "10mm", paperSize: "A4 portrait" }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex flex-col items-center p-3 md:p-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3 text-white shadow-2xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-black">
            VS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">
                {quotation.quotation_no}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  computedStatus === "approved"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : computedStatus === "pending"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : computedStatus === "expiring_soon"
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    : computedStatus === "expired"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {computedStatus.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-300">{quotation.client_name} • {quotation.site_address}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(quotation);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition cursor-pointer"
            >
              Edit Quotation
            </button>
          )}

          <button
            id="btn_print_quotation_modal"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF (A4)
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 Letterhead Format) */}
      <div
        id="printable-quotation-sheet"
        className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-xl p-8 md:p-12 relative border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-6 print:rounded-none print:w-full print:max-w-none"
        style={{ minHeight: "297mm" }}
      >
        {/* Architectural Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-[#C9A66B] flex items-center justify-center font-serif text-2xl font-black border border-[#C9A66B]">
                  VS
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-slate-950 uppercase">
                    VASTHUSILPY
                  </h1>
                  <p className="text-xs font-serif tracking-widest text-[#9e7d3b] uppercase font-bold">
                    Architectural & Construction Consultancy • Keralassery
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C9A66B]" /> Keralassery, Palakkad, Kerala - 678641
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#C9A66B]" /> +91 94471 23456
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#C9A66B]" /> dibin.vasthusilpy@gmail.com
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <div className="inline-block bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-right mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Sheet No</span>
                <span className="text-sm font-mono font-black text-slate-900 tracking-wider">
                  {quotation.quotation_no}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Date:</span> {quotation.date_issued}
              </p>
              <p className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Valid Until:</span> {quotation.expiry_date}
              </p>
            </div>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center mb-6">
          <h2 className="text-sm md:text-base font-serif font-black tracking-widest uppercase text-slate-900">
            CONSTRUCTION QUOTATION & SCHEDULE OF WORK ITEMS
          </h2>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Detailed itemized estimation with material and workmanship specifications
          </p>
        </div>

        {/* Client & Project Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded-lg p-4 mb-6 text-xs bg-white">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Client Details
            </span>
            <p className="text-sm font-serif font-black text-slate-950">{quotation.client_name}</p>
            <p className="text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400" /> {quotation.client_phone}
            </p>
            {quotation.client_email && (
              <p className="text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" /> {quotation.client_email}
              </p>
            )}
          </div>

          <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Project / Site Location
            </span>
            <p className="font-medium text-slate-800 leading-relaxed">{quotation.site_address}</p>
            {quotation.plot_area_sqft && (
              <p className="text-slate-600 mt-1">
                <span className="font-semibold text-slate-800">Plot / Built-up Area:</span> {quotation.plot_area_sqft} sq.ft
              </p>
            )}
            <p className="text-slate-600">
              <span className="font-semibold text-slate-800">Status:</span>{" "}
              <span className="uppercase font-bold text-slate-800">{computedStatus}</span>
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-serif">
                <th className="p-2.5 text-center border-r border-slate-300 w-10 font-bold">#</th>
                <th className="p-2.5 border-r border-slate-300 font-bold">Work Description & Scope</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-16 font-bold">Unit</th>
                <th className="p-2.5 text-right border-r border-slate-300 w-16 font-bold">Qty</th>
                <th className="p-2.5 text-right border-r border-slate-300 w-24 font-bold">Rate (₹)</th>
                <th className="p-2.5 text-right w-28 font-bold">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.line_items.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="p-2.5 text-center border-r border-slate-300 font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="p-2.5 border-r border-slate-300 text-slate-900 font-medium">
                    <div>{item.description}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      {item.include_material && (
                        <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                          Mat: {formatINR(item.material_rate || 0)}
                        </span>
                      )}
                      {item.include_labour && (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                          Lab: {formatINR(item.labour_rate || 0)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5 text-center border-r border-slate-300 font-mono text-slate-700 uppercase">
                    {item.unit}
                  </td>
                  <td className="p-2.5 text-right border-r border-slate-300 font-mono text-slate-900 font-semibold">
                    {item.quantity}
                  </td>
                  <td className="p-2.5 text-right border-r border-slate-300 font-mono text-slate-800">
                    {formatINR(item.rate)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-950">
                    {formatINR(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals and Indian Words */}
        <div className="border border-slate-300 rounded-lg p-4 mb-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Amount in Words (INR)
              </span>
              <p className="text-xs font-serif font-black text-slate-900 italic leading-snug">
                {numberToWordsIndian(quotation.total)}
              </p>

              {/* Material vs Labour Subtotal Summary */}
              {(quotation.material_subtotal > 0 || quotation.labour_subtotal > 0) && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-4 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Material Subtotal</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatINR(quotation.material_subtotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Labour Subtotal</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatINR(quotation.labour_subtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(quotation.subtotal)}</span>
              </div>

              {quotation.discount_amount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
                  <span>
                    Special Discount {quotation.discount_type === "percentage" ? `(${quotation.discount_value}%)` : ""}:
                  </span>
                  <span className="font-mono font-bold">-{formatINR(quotation.discount_amount)}</span>
                </div>
              )}

              {quotation.enable_tax && quotation.tax_amount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Applicable GST ({quotation.tax_rate}%):</span>
                  <span className="font-mono font-bold text-slate-900">{formatINR(quotation.tax_amount)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm md:text-base font-black text-slate-950">
                <span className="font-serif">Net Quotation Total:</span>
                <span className="font-mono text-[#9e7d3b]">{formatINR(quotation.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Execution Guidelines */}
        {quotation.notes && (
          <div className="mb-6 p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-slate-800">
            <span className="font-bold uppercase tracking-wider text-amber-900 block text-[10px] mb-0.5">
              Architectural & Execution Notes
            </span>
            <p className="whitespace-pre-line leading-relaxed">{quotation.notes}</p>
          </div>
        )}

        {/* Assigned Contractors (If explicitly configured to show) */}
        {quotation.show_contractors_on_print && assignedContractors.length > 0 && (
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700 block text-[10px] mb-1">
              Designated Site Execution Teams
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {assignedContractors.map((c) => (
                <div key={c.id} className="p-2 bg-white rounded border border-slate-200">
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="text-[10px] text-slate-500">{c.trade} • {c.company_name || "Specialist"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms & Conditions Section */}
        {selectedTerms.length > 0 && (
          <div className="mb-8 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-slate-900 mb-2">
              General Terms & Conditions of Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[10px] text-slate-600 leading-relaxed">
              {selectedTerms.map((t, idx) => (
                <div key={t.id} className="flex items-start gap-1.5">
                  <span className="font-mono font-bold text-slate-900 shrink-0">{idx + 1}.</span>
                  <div>
                    <span className="font-semibold text-slate-800">{t.title}: </span>
                    <span>{t.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures & Seal Block */}
        <div className="pt-8 border-t-2 border-slate-900 mt-8">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-16 flex items-end justify-center mb-1">
                <div className="w-32 border-b border-dashed border-slate-400"></div>
              </div>
              <p className="font-serif font-bold text-slate-900 text-sm">Client Signature & Seal</p>
              <p className="text-[10px] text-slate-500">I accept the rates, terms, and scope of work specified above</p>
            </div>

            <div>
              <div className="h-16 flex items-end justify-center mb-1">
                <div className="text-center font-serif text-xs text-[#9e7d3b] font-bold">
                  Dibin — Vasthusilpy Consultancy
                </div>
              </div>
              <p className="font-serif font-bold text-slate-900 text-sm">Authorized Signatory</p>
              <p className="text-[10px] text-slate-500">Vasthusilpy Architectural & Construction Consultancy</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-[9px] text-slate-400 font-mono">
          Page 1 of 1 • System-Generated Architectural Quotation Sheet • Vasthusilpy Keralassery
        </div>
      </div>
    </div>
  );
};
