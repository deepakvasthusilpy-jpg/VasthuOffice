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
  Clock
} from "lucide-react";

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
    window.print();
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
        <h2 className="text-xl font-bold font-sans">ഇൻവോയ്സ് കണ്ടെത്താൻ സാധിച്ചില്ല</h2>
        <p className="text-xs text-slate-400 max-w-md font-sans">
          നിങ്ങൾ നൽകിയ ഇൻവോയ്സ് ലിങ്ക് അസാധുവാണ് അല്ലെങ്കിൽ മാറ്റം വരുത്തിയിട്ടുണ്ട്. ദയവായി ഓഫീസുമായി ബന്ധപ്പെടുക.
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
                ? "ഈ ഇൻവോയ്സിന്റെ തുക പൂർണ്ണമായി അടച്ചു രസീത് ജനറേറ്റ് ചെയ്തിട്ടുണ്ട്."
                : `ബാക്കി അടയ്ക്കാനുള്ള തുക: ₹${invoice.balanceDue.toLocaleString("en-IN")}. താഴെ കാണുന്ന UPI QR കോഡ് സ്കാൻ ചെയ്ത് ഉടൻ അടയ്ക്കാം.`}
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

        {/* Printable Official Invoice Document */}
        <div id="printable-invoice-document" className="bg-white text-slate-900 rounded-3xl p-6 md:p-10 space-y-6 shadow-2xl font-sans print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-300 pb-6">
            <div>
              <div className="text-2xl md:text-3xl font-black text-slate-950 tracking-wide font-sans">
                VASTHUSILPY
              </div>
              <div className="text-xs font-bold text-teal-800 uppercase tracking-widest font-mono">
                Architectural • Engineering • Survey • Valuation
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Keralassery, Palakkad District, Kerala - 678641</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Mob: +91 70123 83137 / +91 97479 95961</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>deepak.vasthusilpy@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 uppercase font-mono tracking-widest">
                INVOICE & RECEIPT
              </div>
              <div className="text-sm font-bold font-mono text-teal-700 mt-1">
                #{invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-600 font-mono mt-1 space-y-0.5">
                <div>Date of Issue: <strong>{invoice.invoiceDate}</strong></div>
                <div>Due Date: <strong>{invoice.dueDate}</strong></div>
              </div>
              <div className="mt-2.5">
                <span
                  className={`inline-block text-xs font-mono font-black px-3 py-1 rounded-md uppercase border ${
                    invoice.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : invoice.paymentStatus === "PARTIALLY PAID"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  ● {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To Client & Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs">
            <div>
              <div className="text-[10px] font-mono font-bold text-teal-800 uppercase tracking-wider mb-1">
                Billed To (Client / Applicant)
              </div>
              <div className="text-sm font-black text-slate-900">{invoice.applicantName}</div>
              <div className="text-slate-700 font-mono mt-0.5">Mobile: {invoice.applicantMobile}</div>
              {invoice.applicantEmail && (
                <div className="text-slate-600 font-mono">Email: {invoice.applicantEmail}</div>
              )}
              {invoice.applicantAddress && (
                <div className="text-slate-600 mt-1 font-sans leading-relaxed">
                  {invoice.applicantAddress}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold text-teal-800 uppercase tracking-wider mb-1">
                Project & Reference
              </div>
              {invoice.projectTitle ? (
                <>
                  <div className="text-xs font-bold text-slate-900">{invoice.projectTitle}</div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Ref Project ID: #{invoice.projectId}
                  </div>
                </>
              ) : (
                <div className="text-slate-600">Professional Engineering Consultation & Valuation</div>
              )}
              <div className="mt-2 text-[11px] text-slate-500 font-mono">
                Jurisdiction: Local Self Government Department (LSGD / KSMART Kerala)
              </div>
            </div>
          </div>

          {/* Itemized Services / Products Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[11px]">
                  <th className="p-3.5 rounded-l-xl">Sl</th>
                  <th className="p-3.5">Item & Service Description</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-center">Unit</th>
                  <th className="p-3.5 text-right">Rate (₹)</th>
                  <th className="p-3.5 text-right rounded-r-xl">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 font-sans">
                    <td className="p-3.5 font-mono font-bold text-slate-500">{index + 1}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{item.description}</td>
                    <td className="p-3.5 text-center font-mono">{item.quantity}</td>
                    <td className="p-3.5 text-center font-mono text-slate-600">{item.unit}</td>
                    <td className="p-3.5 text-right font-mono">₹{item.rate.toLocaleString("en-IN")}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes Summary */}
          <div className="flex flex-wrap items-start justify-between gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-3 max-w-sm">
              {invoice.notes && (
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Notes</div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                    {invoice.notes}
                  </div>
                </div>
              )}

              {invoice.terms && (
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Terms & Conditions
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">{invoice.terms}</div>
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-2 font-mono text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{invoice.subTotal.toLocaleString("en-IN")}</span>
              </div>

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>+₹{invoice.taxAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{invoice.discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-950 font-black text-sm pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="text-teal-800">₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-emerald-800 font-bold pt-1">
                <span>Total Amount Paid:</span>
                <span>₹{invoice.totalPaid.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-900 font-black pt-2 border-t-2 border-slate-300 text-sm">
                <span>Balance Due:</span>
                <span className={invoice.balanceDue > 0 ? "text-rose-700" : "text-emerald-700"}>
                  ₹{invoice.balanceDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Attached Instant UPI Payment QR Code Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6 print:border print:border-slate-800">
            <div className="space-y-3 max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>OFFICIAL UPI QR PAYMENT • VASTHUSILPY</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Scan this QR code using GPay, PhonePe, Paytm, BHIM, or any UPI banking app on your mobile to pay instantly.
              </p>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs space-y-1">
                <div className="text-[10px] text-slate-400">Official UPI ID:</div>
                <div className="text-emerald-400 font-bold text-sm">
                  {invoice.upiId || "7012383137@okbizaxis"}
                </div>
                <div className="text-[10px] text-slate-500">Payee: Vasthusilpy Keralassery</div>
              </div>
            </div>

            <div className="mx-auto md:mx-0">
              <InvoiceQrCode
                upiId={invoice.upiId || "7012383137@okbizaxis"}
                payeeName="Vasthusilpy"
                amount={invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal}
                invoiceNumber={invoice.invoiceNumber}
                size={160}
              />
            </div>
          </div>

          {/* Payment Receipts History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                  Official Payment Transactions History ({invoice.payments.length})
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-emerald-900 text-sm">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-emerald-800 text-[11px]"> • {p.paymentMode}</span>
                      <span className="text-slate-500 text-[10px]"> (Date: {p.date})</span>
                    </div>

                    {p.referenceNo && (
                      <div className="text-[11px] text-emerald-900 font-bold bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                        Ref/UTR: #{p.referenceNo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Signatory & Seal Verification */}
          <div className="border-t-2 border-slate-300 pt-6 flex flex-wrap justify-between items-end gap-4 text-xs font-mono text-slate-600">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 font-sans">
                VASTHUSILPY TECHNICAL & VALUATION SERVICES
              </div>
              <div className="text-[11px] text-slate-500">
                Digital Verification ID: #{invoice.id} • SHA-256 Verified
              </div>
              <div className="text-[11px] text-teal-800 font-bold">
                Er. Deepak & Technical Engineering Team
              </div>
            </div>

            <div className="text-right">
              <div className="w-32 h-12 border-b border-dashed border-slate-400 flex items-end justify-center pb-1 text-[10px] text-slate-400">
                Authorized Signatory
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Vasthusilpy Keralassery</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
