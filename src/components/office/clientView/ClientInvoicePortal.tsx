import React, { useState, useEffect } from "react";
import { Invoice } from "../../../types";
import { INITIAL_INVOICES } from "../../../data/crmData";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { InvoiceQrCode } from "../invoices/InvoiceQrCode";
import {
  Printer,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Download,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Clock,
  FileText
} from "lucide-react";
import { triggerPrint } from "../../../utils/printHelper";
import { generateInvoicePdfBlob } from "../../../utils/invoicePdfGenerator";

interface ClientInvoicePortalProps {
  invoiceId?: string;
  invoiceNumber?: string;
  onGoToLogin?: () => void;
}

export const ClientInvoicePortal: React.FC<ClientInvoicePortalProps> = ({
  invoiceId,
  invoiceNumber,
  onGoToLogin
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(() => {
    // 1. Check localStorage first
    try {
      const saved = localStorage.getItem("vasthusilpy_invoices");
      if (saved) {
        const parsed: Invoice[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const match = parsed.find(
            (inv) =>
              inv.id === invoiceId ||
              inv.invoiceNumber === invoiceId ||
              inv.id === invoiceNumber ||
              inv.invoiceNumber === invoiceNumber
          );
          if (match) return match;
        }
      }
    } catch (e) {
      console.error("Error reading invoices from localStorage", e);
    }

    // 2. Check initial invoices
    const initialMatch = INITIAL_INVOICES.find(
      (inv) =>
        inv.id === invoiceId ||
        inv.invoiceNumber === invoiceId ||
        inv.id === invoiceNumber ||
        inv.invoiceNumber === invoiceNumber
    );
    if (initialMatch) return initialMatch;

    return null;
  });

  const [loading, setLoading] = useState<boolean>(!invoice);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch latest from Firestore if not resolved or to ensure up-to-date payment status
  useEffect(() => {
    let isMounted = true;

    const fetchRemoteInvoice = async () => {
      const searchKey = invoiceId || invoiceNumber;
      if (!searchKey) return;

      try {
        // Try direct doc lookup
        const docRef = doc(db, "invoices", searchKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          setInvoice(docSnap.data() as Invoice);
          setLoading(false);
          return;
        }

        // Try searching all invoices in collection
        const colSnap = await getDocs(collection(db, "invoices"));
        if (!colSnap.empty && isMounted) {
          let found: Invoice | null = null;
          colSnap.forEach((d) => {
            const data = d.data() as Invoice;
            if (
              data.id === searchKey ||
              data.invoiceNumber === searchKey ||
              data.projectId === searchKey
            ) {
              found = data;
            }
          });

          if (found) {
            setInvoice(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Error fetching invoice from Firestore:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRemoteInvoice();

    return () => {
      isMounted = false;
    };
  }, [invoiceId, invoiceNumber]);

  const handlePrint = () => {
    if (!invoice) return;
    triggerPrint(`Invoice_${invoice.invoiceNumber}_Vasthusilpy_A4`, "printable-invoice-document", { isInvoice: true, pageMargin: "15mm" });
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      const { blob } = await generateInvoicePdfBlob(invoice);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${invoice.invoiceNumber}_Vasthusilpy_A4.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn("Direct PDF generation fallback to print:", e);
      handlePrint();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Hello Vasthusilpy Team, I am inquiring regarding Invoice #${invoice?.invoiceNumber || ""} (${invoice?.applicantName || ""}).`
    );
    window.open(`https://api.whatsapp.com/send?phone=917012383137&text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Loading authentic invoice portal...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-sans">Invoice Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md font-sans">
          The invoice link you accessed is invalid or may have expired. Please contact the office helpline for assistance.
        </p>
        <button
          onClick={handleWhatsAppContact}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Contact Vasthusilpy Helpline</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-lg print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black font-mono">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-sans text-white tracking-wide uppercase">
                  VASTHUSILPY CLIENT INVOICE & PAYMENT PORTAL
                </span>
                <span className="text-[10px] font-mono font-black bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  NO SIGN-IN REQUIRED • DIRECT CLIENT VIEW
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Official Digital Invoice & Receipt • Keralassery, Palakkad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy shareable invoice link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{copiedLink ? "Link Copied" : "Copy Link"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsAppContact}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-mono font-black shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Office Helpline</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Status Bar Alert */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl print:hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400">Invoice:</span>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-800">
                #{invoice.invoiceNumber}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-sans text-slate-300 font-bold">
                {invoice.applicantName}
              </span>
              <span className="text-slate-600">•</span>
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  invoice.paymentStatus === "PAID"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : invoice.paymentStatus === "PARTIALLY PAID"
                    ? "bg-amber-950 text-amber-300 border-amber-800"
                    : "bg-rose-950 text-rose-300 border-rose-800"
                }`}
              >
                ● {invoice.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {invoice.paymentStatus === "PAID"
                ? "This invoice has been fully settled and an official payment receipt has been issued."
                : `Remaining balance due: ₹${invoice.balanceDue.toLocaleString("en-IN")}. Scan the UPI QR code below to pay instantly.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Grand Total</div>
              <div className="text-xl font-black text-emerald-400">
                ₹{invoice.grandTotal.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL A4 PAPER INVOICE DOCUMENT (STANDARD A4 WITH DEFAULT 15MM MARGIN) */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col items-center justify-center py-2 px-1 sm:px-2 bg-slate-950/40 rounded-3xl border border-slate-800/80 overflow-x-auto print:bg-transparent print:p-0 print:border-none print:overflow-visible">
          {/* A4 Paper Specs Indicator Strip (Screen Only) */}
          <div className="w-full max-w-[210mm] flex flex-wrap items-center justify-between px-2 pb-2.5 text-xs text-slate-400 font-mono print:hidden gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>A4 Paper (210mm × 297mm) • Default Page Margin (15mm)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded-full">
                Strict A4 Layout
              </span>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-full border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Download A4 PDF"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Download A4 PDF</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-full border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Print A4"
              >
                <Printer className="w-3 h-3" />
                <span>Print A4</span>
              </button>
            </div>
          </div>

          <div
            id="printable-invoice-document"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black rounded-none shadow-2xl p-[15mm] space-y-4 font-sans border border-slate-300 print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full print:min-h-0 print:m-0 mx-auto box-border"
          >
          {/* Document Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-black pb-5">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black tracking-wide font-sans uppercase">
                VASTHUSILPY
              </div>
              <div className="text-xs font-black text-black uppercase tracking-widest font-mono">
                Architectural • Engineering • Survey • Valuation
              </div>
              <div className="text-xs text-black font-semibold mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>Keralassery, Palakkad District, Kerala - 678641</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-black shrink-0" />
                  <span className="font-mono">Mob: +91 70123 83137 / +91 97479 95961</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>deepak.vasthusilpy@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-black uppercase font-mono tracking-widest">
                INVOICE & RECEIPT
              </div>
              <div className="text-sm font-black font-mono text-black mt-1">
                #{invoice.invoiceNumber}
              </div>
              <div className="text-xs text-black font-semibold font-mono mt-1 space-y-0.5">
                <div>Date of Issue: <strong className="font-black text-black">{invoice.invoiceDate}</strong></div>
                <div>Due Date: <strong className="font-black text-black">{invoice.dueDate}</strong></div>
              </div>
              <div className="mt-2.5">
                <span className="inline-block text-xs font-mono font-black px-3 py-1 rounded uppercase border-2 border-black bg-white text-black tracking-wider">
                  [ {invoice.paymentStatus} ]
                </span>
              </div>
            </div>
          </div>

          {/* Billed To Client & Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-2 border-black rounded-xl p-4 text-xs text-black">
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-black text-black uppercase tracking-wider border-b border-black pb-1 mb-1.5">
                Billed To (Client / Applicant)
              </div>
              <div className="text-base font-black text-black">{invoice.applicantName}</div>
              <div className="text-black font-bold font-mono">Mobile: +91 {invoice.applicantMobile}</div>
              {invoice.applicantEmail && (
                <div className="text-black font-bold font-mono">Email: {invoice.applicantEmail}</div>
              )}
              {invoice.applicantAddress && (
                <div className="text-black font-semibold mt-1 font-sans leading-relaxed">
                  {invoice.applicantAddress}
                </div>
              )}
            </div>

            <div className="space-y-1 md:border-l-2 md:border-black md:pl-4">
              <div className="text-[11px] font-mono font-black text-black uppercase tracking-wider border-b border-black pb-1 mb-1.5">
                Project & Reference
              </div>
              {invoice.projectTitle ? (
                <>
                  <div className="text-xs font-black text-black">{invoice.projectTitle}</div>
                  <div className="text-black font-bold font-mono text-[11px] mt-0.5">
                    Ref Project ID: #{invoice.projectId}
                  </div>
                </>
              ) : (
                <div className="text-black font-semibold">Professional Engineering Consultation & Valuation</div>
              )}
              <div className="mt-2 text-[11px] text-black font-bold font-mono">
                Jurisdiction: Local Self Government Department (LSGD / KSMART Kerala)
              </div>
            </div>
          </div>

          {/* Itemized Services / Products Breakdown Table */}
          <div className="overflow-x-auto border-2 border-black rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 text-black border-b-2 border-black font-mono uppercase text-xs font-black">
                  <th className="p-3 text-center w-12 border-r-2 border-black">Sl</th>
                  <th className="p-3 border-r-2 border-black">Item & Service Description</th>
                  <th className="p-3 text-center border-r-2 border-black">Qty</th>
                  <th className="p-3 text-center border-r-2 border-black">Unit</th>
                  <th className="p-3 text-right border-r-2 border-black">Rate (₹)</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-sans text-black">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="bg-white">
                    <td className="p-3 font-mono font-black text-black text-center border-r border-black">{index + 1}</td>
                    <td className="p-3 font-bold text-black border-r border-black">{item.description}</td>
                    <td className="p-3 text-center font-mono font-bold text-black border-r border-black">{item.quantity}</td>
                    <td className="p-3 text-center font-mono font-bold text-black border-r border-black">{item.unit}</td>
                    <td className="p-3 text-right font-mono font-bold text-black border-r border-black">₹{item.rate.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono font-black text-black">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes Summary */}
          <div className="flex flex-wrap items-start justify-between gap-6 pt-2">
            <div className="space-y-3 max-w-sm">
              {invoice.notes && (
                <div className="bg-white border-2 border-black p-3.5 rounded-xl">
                  <div className="text-[11px] font-mono font-black text-black uppercase border-b border-black pb-1 mb-1.5">Notes</div>
                  <div className="text-xs text-black font-semibold leading-relaxed">
                    {invoice.notes}
                  </div>
                </div>
              )}

              {invoice.terms && (
                <div className="bg-white border-2 border-black p-3.5 rounded-xl">
                  <div className="text-[11px] font-mono font-black text-black uppercase border-b border-black pb-1 mb-1.5">
                    Terms & Conditions
                  </div>
                  <div className="text-xs text-black font-semibold leading-relaxed">{invoice.terms}</div>
                </div>
              )}
            </div>

            <div className="w-full sm:w-80 space-y-2.5 font-mono text-xs bg-white p-4 rounded-xl border-2 border-black text-black">
              <div className="flex justify-between text-black font-bold">
                <span>Subtotal:</span>
                <span>₹{invoice.subTotal.toLocaleString("en-IN")}</span>
              </div>

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-black font-bold">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>+₹{invoice.taxAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {invoice.discount > 0 && (
                <div className="flex justify-between text-black font-bold">
                  <span>Discount:</span>
                  <span>-₹{invoice.discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-black font-black text-base pt-2 border-t-2 border-black">
                <span>Grand Total:</span>
                <span>₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-black font-bold pt-1">
                <span>Total Amount Paid:</span>
                <span>₹{invoice.totalPaid.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-black font-black pt-2 border-t-2 border-black text-base">
                <span>Balance Due:</span>
                <span>
                  ₹{invoice.balanceDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Attached Instant UPI Payment QR Code Card (Black and White) */}
          <div className="bg-white text-black p-5 rounded-xl border-2 border-black flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>OFFICIAL UPI QR PAYMENT • VASTHUSILPY</span>
              </div>
              <p className="text-xs text-black font-semibold leading-relaxed">
                Scan this QR code using GPay, PhonePe, Paytm, BHIM, or any UPI banking app on your mobile to pay instantly.
              </p>
              <div className="bg-white border-2 border-black p-3 rounded-lg font-mono text-xs space-y-1 text-black">
                <div className="text-[10px] font-bold uppercase">Official UPI ID:</div>
                <div className="text-black font-black text-sm">
                  {invoice.upiId || "7012383137@okbizaxis"}
                </div>
                <div className="text-[10px] font-semibold text-black">Payee: Vasthusilpy Keralassery</div>
              </div>
            </div>

            <div className="mx-auto md:mx-0">
              <InvoiceQrCode
                upiId={invoice.upiId || "7012383137@okbizaxis"}
                payeeName="Vasthusilpy"
                amount={invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal}
                invoiceNumber={invoice.invoiceNumber}
                size={140}
                blackAndWhite={true}
              />
            </div>
          </div>

          {/* Payment Receipts History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="border-t-2 border-black pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-black" />
                <span className="text-xs font-mono font-black text-black uppercase tracking-wider">
                  Official Payment Transactions History ({invoice.payments.length})
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border-2 border-black p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-black"
                  >
                    <div>
                      <span className="font-black text-black text-sm">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-black font-bold text-xs"> • {p.paymentMode}</span>
                      <span className="text-black font-semibold text-[11px]"> (Date: {p.date})</span>
                    </div>

                    {p.referenceNo && (
                      <div className="text-[11px] text-black font-black bg-white px-2.5 py-1 rounded-md border border-black">
                        Ref/UTR: #{p.referenceNo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Signatory & Seal Verification */}
          <div className="border-t-2 border-black pt-6 flex flex-wrap justify-between items-end gap-4 text-xs font-mono text-black">
            <div className="space-y-1">
              <div className="font-black text-black font-sans text-sm uppercase">
                VASTHUSILPY TECHNICAL & VALUATION SERVICES
              </div>
              <div className="text-xs text-black font-semibold">
                Digital Verification ID: #{invoice.id} • Verified Record
              </div>
              <div className="text-xs text-black font-bold">
                Er. Deepak & Technical Engineering Team
              </div>
            </div>

            <div className="text-right">
              <div className="w-36 h-12 border-b-2 border-dashed border-black flex items-end justify-center pb-1 text-[11px] text-black font-bold">
                Authorized Signatory
              </div>
              <div className="text-[11px] text-black font-bold mt-1">Vasthusilpy Keralassery</div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};
