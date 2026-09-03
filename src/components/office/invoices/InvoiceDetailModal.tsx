import React, { useState } from "react";
import { Invoice, PaymentRecord } from "../../../types";
import { InvoiceQrCode } from "./InvoiceQrCode";
import { PaymentReceiptDispatchModal } from "./PaymentReceiptDispatchModal";
import { triggerPrint } from "../../../utils/printHelper";
import { triggerAppNotification } from "../../../context/NotificationContext";
import {
  sendInvoiceViaWhatsApp,
  sendInvoiceViaEmail,
  sendInvoiceViaEmailAutomatically,
  sendInvoiceOrReceiptViaWhatsApp,
  getInvoiceSharePortalUrl,
  formatInvoiceWhatsAppMessage
} from "../../../utils/invoiceShareHelper";
import {
  X,
  Printer,
  Download,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  ChevronDown,
  Copy,
  Send,
  Bell,
  Clock,
  ArrowLeft,
  FileText,
  Building2,
  Check,
  Share2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Loader2,
  QrCode,
  Receipt,
  HardDrive
} from "lucide-react";
import { uploadInvoicePdfToGoogleDrive } from "../../../utils/googleDriveStorage";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onOpenRecordPayment?: (invoice: Invoice, paymentToEdit?: PaymentRecord | null) => void;
  onOpenPaymentModal?: (invoice: Invoice) => void;
  onDeletePayment?: (invoiceId: string, paymentId: string) => void;
  onDuplicateInvoice?: (invoice: Invoice) => void;
  onMarkAsSent?: (invoiceId: string) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string) => void;
  onUpdateInvoice?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onOpenRecordPayment,
  onOpenPaymentModal,
  onDeletePayment,
  onDuplicateInvoice,
  onMarkAsSent,
  onEditInvoice,
  onDeleteInvoice,
  onUpdateInvoice
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState<boolean>(false);
  const [isActivityOpen, setIsActivityOpen] = useState<boolean>(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);
  const [sendRecipientEmail, setSendRecipientEmail] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [driveStatusMsg, setDriveStatusMsg] = useState<string | null>(null);
  
  // Payment Receipt Dispatch Modal State
  const [isReceiptDispatchOpen, setIsReceiptDispatchOpen] = useState<boolean>(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | undefined>(undefined);

  if (!isOpen || !invoice) return null;

  const handleRecordPaymentTrigger = (paymentToEdit?: PaymentRecord | null) => {
    if (onOpenRecordPayment) {
      onOpenRecordPayment(invoice, paymentToEdit);
    } else if (onOpenPaymentModal) {
      onOpenPaymentModal(invoice);
    }
  };

  const isPaid = invoice.paymentStatus === "PAID";
  const isPartial = invoice.paymentStatus === "PARTIALLY PAID";
  const isSent = !!invoice.lastSentDate || isPaid || isPartial;

  const requiredAmount = typeof invoice.balanceDue === "number" && invoice.balanceDue > 0
    ? invoice.balanceDue
    : (invoice.grandTotal || 0);

  const handleDownloadPdf = () => {
    triggerPrint(`Invoice_${invoice.invoiceNumber}_Vasthusilpy`, "printable-invoice-document");
    triggerAppNotification(
      "INVOICE_GENERATED",
      "PDF Generated",
      `Invoice #${invoice.invoiceNumber} prepared for PDF download / print.`,
      { invoiceId: invoice.id }
    );
  };

  const handlePrint = () => {
    triggerPrint(`Invoice_${invoice.invoiceNumber}_Vasthusilpy`, "printable-invoice-document");
  };

  const handleSendAutomaticEmail = async () => {
    const targetEmail = (sendRecipientEmail || invoice.applicantEmail || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setEmailStatusMessage({ type: "error", text: "Please provide a valid client email address." });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusMessage(null);

    try {
      const res = await sendInvoiceViaEmailAutomatically(invoice, targetEmail);
      if (res.success) {
        setEmailStatusMessage({
          type: "success",
          text: `Invoice #${invoice.invoiceNumber} successfully dispatched to ${targetEmail} from deepak.vasthusilpy@gmail.com with PDF invoice attachment and Payment QR Code!`
        });
        if (onMarkAsSent) onMarkAsSent(invoice.id);
        triggerAppNotification(
          "INVOICE_GENERATED",
          "Email Sent Successfully",
          `Invoice #${invoice.invoiceNumber} sent from Gmail to ${targetEmail} with PDF & QR code`,
          { invoiceId: invoice.id }
        );
      } else {
        throw new Error(res.error || "Failed to send invoice email.");
      }
    } catch (err: any) {
      console.error("Automatic invoice send error:", err);
      setEmailStatusMessage({
        type: "error",
        text: err.message || "Failed to send email. You can also use client-side mailto fallback below."
      });
      triggerAppNotification(
        "SYSTEM",
        "Email Send Failed",
        err.message || "Could not send email automatically",
        { invoiceId: invoice.id }
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendReminder = () => {
    triggerAppNotification(
      "INVOICE_GENERATED",
      "Payment Reminder Sent",
      `Payment reminder sent to ${invoice.applicantName} (${invoice.applicantMobile})`,
      { invoiceId: invoice.id }
    );
  };

  const handleCopyUpiText = () => {
    navigator.clipboard.writeText(invoice.upiId || "7012383137@naviaxis");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSyncToGoogleDrive = async () => {
    setIsSyncingDrive(true);
    setDriveStatusMsg("Syncing invoice PDF to Google Drive...");
    try {
      const res = await uploadInvoicePdfToGoogleDrive(invoice);
      if (res.success && res.webViewLink) {
        setDriveStatusMsg("Successfully archived in Google Drive!");
        const updatedInvoice: Invoice = {
          ...invoice,
          googleDriveFileId: res.fileId,
          googleDriveUrl: res.webViewLink,
          googleDriveFolderId: res.folderId,
          googleDriveSyncedAt: new Date().toISOString()
        };
        if (onUpdateInvoice) {
          onUpdateInvoice(updatedInvoice);
        }
        triggerAppNotification(
          "INVOICE_GENERATED",
          "Google Drive Synced",
          `Invoice #${invoice.invoiceNumber} uploaded to Google Drive.`,
          { invoiceId: invoice.id }
        );
      } else {
        setDriveStatusMsg(res.error || "Failed to sync to Google Drive.");
      }
    } catch (err: any) {
      setDriveStatusMsg(err.message || "Google Drive sync error.");
    } finally {
      setIsSyncingDrive(false);
      setTimeout(() => setDriveStatusMsg(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-50 text-slate-900 rounded-3xl max-w-5xl w-full p-4 md:p-8 shadow-2xl my-6 space-y-6 border border-slate-200 print:border-none print:shadow-none print:p-0 print:my-0 print:max-w-none print:bg-white">
        
        {/* Top Header & Breadcrumbs (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Back to Invoices"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Invoices</span>
                <span className="text-xs text-slate-300">/</span>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Invoice #{invoice.invoiceNumber}
                </h1>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : isPartial
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : isSent
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-slate-200 text-slate-700 border border-slate-300"
                  }`}
                >
                  {isPaid ? "Paid" : isPartial ? "Partially paid" : isSent ? "Sent" : "Draft"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Client: {invoice.applicantName} • Due: {invoice.dueDate}
              </p>
            </div>
          </div>

          {/* Action Buttons Hub: Record Payment + Send Invoice + Download PDF + Print + Edit */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Record Payment */}
            <button
              type="button"
              onClick={() => handleRecordPaymentTrigger()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Record a payment for this invoice"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>

            {/* Send Receipt */}
            {(isPaid || (invoice.payments && invoice.payments.length > 0)) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentForReceipt(
                    invoice.payments && invoice.payments.length > 0
                      ? invoice.payments[invoice.payments.length - 1]
                      : undefined
                  );
                  setIsReceiptDispatchOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Send Payment Receipt & Closed Invoice to Client"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Send Receipt</span>
              </button>
            )}

            {/* 2. Send Invoice */}
            <button
              type="button"
              onClick={() => {
                setSendRecipientEmail(invoice.applicantEmail || "");
                setIsSendModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Send invoice via WhatsApp or Email"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invoice</span>
            </button>

            {/* 3. Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Download Invoice as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Google Drive Cloud Storage Button */}
            {invoice.googleDriveUrl ? (
              <a
                href={invoice.googleDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Open Stored PDF in Google Drive"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Drive</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleSyncToGoogleDrive}
                disabled={isSyncingDrive}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Save & sync this invoice to Google Drive"
              >
                {isSyncingDrive ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className="hidden sm:inline">Sync Drive</span>
              </button>
            )}

            {/* 4. Print Invoice */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* 5. WhatsApp Quick Trigger */}
            <button
              type="button"
              onClick={() => {
                sendInvoiceViaWhatsApp(invoice);
                if (onMarkAsSent) onMarkAsSent(invoice.id);
                triggerAppNotification(
                  "INVOICE_GENERATED",
                  "WhatsApp Opened",
                  `Invoice #${invoice.invoiceNumber} prepared for ${invoice.applicantName}`,
                  { invoiceId: invoice.id }
                );
              }}
              className="p-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Send via WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </button>

            {/* 6. Edit Invoice */}
            {onEditInvoice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditInvoice(invoice);
                }}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Edit Invoice"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreActionsOpen(!moreActionsOpen)}
                className="p-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="More Actions"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {moreActionsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 text-xs divide-y divide-slate-100 font-sans">
                  <div className="py-1">
                    {onEditInvoice && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreActionsOpen(false);
                          onClose();
                          onEditInvoice(invoice);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit invoice</span>
                      </button>
                    )}
                    {(isPaid || (invoice.payments && invoice.payments.length > 0)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreActionsOpen(false);
                          setSelectedPaymentForReceipt(
                            invoice.payments && invoice.payments.length > 0
                              ? invoice.payments[invoice.payments.length - 1]
                              : undefined
                          );
                          setIsReceiptDispatchOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-semibold"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send payment receipt</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreActionsOpen(false);
                        sendInvoiceViaWhatsApp(invoice);
                        if (onMarkAsSent) onMarkAsSent(invoice.id);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send via WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreActionsOpen(false);
                        setSendRecipientEmail(invoice.applicantEmail || "");
                        setIsSendModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2 font-medium"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send via Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreActionsOpen(false);
                        handleSendReminder();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span>Send payment reminder</span>
                    </button>
                  </div>

                  <div className="py-1">
                    {onDuplicateInvoice && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreActionsOpen(false);
                          onDuplicateInvoice(invoice);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Duplicate Invoice</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreActionsOpen(false);
                        handleDownloadPdf();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {onDeleteInvoice && (
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMoreActionsOpen(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Delete invoice</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Banner (High Visibility) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Invoice Ready & Verified
              </div>
              <div className="text-sm font-bold text-white">
                Grand Total: <span className="text-cyan-300 font-mono">₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
                {invoice.balanceDue > 0 ? (
                  <span className="text-rose-400 font-mono ml-2">(₹{invoice.balanceDue.toLocaleString("en-IN")} Due)</span>
                ) : (
                  <span className="text-emerald-400 font-mono ml-2">(Fully Paid)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleRecordPaymentTrigger()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sendInvoiceViaWhatsApp(invoice);
                if (onMarkAsSent) onMarkAsSent(invoice.id);
              }}
              className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Send WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Timeline Steps Card (Hidden on Print) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm print:hidden">
          <div className="grid grid-cols-3 gap-4 text-xs font-sans">
            {/* Step 1: Created */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Created</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {invoice.invoiceDate || invoice.createdAt}
                </div>
              </div>
            </div>

            {/* Step 2: Sent */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isSent
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500 font-bold"
                }`}
              >
                {isSent ? <Check className="w-4 h-4" /> : <span>2</span>}
              </div>
              <div>
                <div className="font-bold text-slate-900">Sent to Client</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {invoice.lastSentDate || (isSent ? invoice.invoiceDate : "Pending delivery")}
                </div>
              </div>
            </div>

            {/* Step 3: Paid */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isPaid
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500 font-bold"
                }`}
              >
                {isPaid ? <Check className="w-4 h-4" /> : <span>3</span>}
              </div>
              <div>
                <div className="font-bold text-slate-900">Payment Status</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {isPaid
                    ? "Fully Settled"
                    : isPartial
                    ? `₹${invoice.balanceDue.toLocaleString("en-IN")} Remaining`
                    : `Due: ${invoice.dueDate}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Drive Cloud Storage Archival Strip (Hidden on Print) */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-4 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">Google Drive Cloud Storage:</span>
                {invoice.googleDriveUrl ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold border border-emerald-500/30">
                    BACKED UP & SYNCED
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    AUTO-BACKUP ON SAVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {driveStatusMsg ||
                  (invoice.googleDriveUrl
                    ? `Folder: 'Vasthusilpy Invoices & Receipts' • PDF Stored in Drive`
                    : "Archived automatically in your Google Drive cloud account")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {invoice.googleDriveUrl ? (
              <a
                href={invoice.googleDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Google Drive</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleSyncToGoogleDrive}
                disabled={isSyncingDrive}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSyncingDrive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                <span>Sync to Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Recorded Payments List Section if payments exist (Hidden on Print) */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 print:hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Recorded Payment History ({invoice.payments.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => handleRecordPaymentTrigger()}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                + Record another payment
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
              {invoice.payments.map((p) => (
                <div key={p.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 font-mono flex items-center gap-2">
                      <span className="text-emerald-700">₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      <span className="text-slate-400 font-normal">•</span>
                      <span className="font-sans text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">{p.paymentMode}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      Date: {p.date} {p.account ? `• Account: ${p.account}` : ""}{" "}
                      {p.memo ? `• Memo: ${p.memo}` : ""}{" "}
                      {p.referenceNo ? `• Ref/UTR: ${p.referenceNo}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentForReceipt(p);
                        setIsReceiptDispatchOpen(true);
                      }}
                      className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                      title="Send payment receipt & closed invoice"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordPaymentTrigger(p)}
                      className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                    >
                      Edit
                    </button>
                    {onDeletePayment && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Remove this recorded payment?")) {
                            onDeletePayment(invoice.id, p.id);
                          }
                        }}
                        className="px-2 py-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OFFICIAL PRINTABLE INVOICE DOCUMENT (PREMIUM PROFESSIONAL THEME)         */}
        {/* ========================================================================= */}
        <div
          id="printable-invoice-document"
          className="bg-white text-slate-900 rounded-3xl p-6 md:p-10 space-y-6 shadow-xl font-sans border border-slate-200 print:border-none print:shadow-none print:p-0 print:rounded-none"
        >
          {/* Top Document Corporate Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-950 tracking-tight font-sans uppercase">
                  VASTHUSILPY
                </h2>
              </div>
              <div className="text-xs font-bold text-teal-800 uppercase tracking-widest font-mono">
                Architectural • Engineering • Survey • Valuation • 3D Design
              </div>
              <div className="text-xs text-slate-600 leading-relaxed font-sans pt-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Near Panchayath Office, Keralassery, Palakkad, Kerala - 678641</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">Mob: +91 97479 95961 / +91 70123 83137</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>deepak.vasthusilpy@gmail.com</span>
                </div>
              </div>
              <div className="inline-block text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 mt-1">
                KPBR & KMBR Registered Engineer • Valuation Consultant
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-3xl font-black text-slate-950 uppercase font-mono tracking-wider">
                TAX INVOICE
              </div>
              <div className="text-sm font-bold font-mono text-teal-700">
                #{invoice.invoiceNumber}
              </div>
              {invoice.poNumber && (
                <div className="text-xs text-slate-500 font-mono">P.O. #{invoice.poNumber}</div>
              )}
              <div className="pt-2 text-xs text-slate-600 space-y-0.5 font-mono">
                <div>Invoice Date: <strong className="text-slate-900">{invoice.invoiceDate}</strong></div>
                <div>Payment Due: <strong className="text-slate-900">{invoice.dueDate}</strong></div>
              </div>
              <div className="pt-2">
                <span
                  className={`inline-block text-xs font-mono font-black px-3 py-1 rounded-md uppercase border ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : isPartial
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {isPaid ? "PAID IN FULL" : isPartial ? "PARTIALLY PAID" : "PAYMENT DUE"}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To Customer Card (Professional Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-xs">
            <div className="md:col-span-7 space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                BILLED TO (CLIENT)
              </div>
              <div className="text-base font-black text-slate-950 font-sans">{invoice.applicantName}</div>
              {invoice.applicantContactPerson && (
                <div className="text-slate-700 font-medium font-sans">Attn: {invoice.applicantContactPerson}</div>
              )}
              {invoice.applicantAddress && (
                <div className="text-slate-600 leading-relaxed font-sans">{invoice.applicantAddress}</div>
              )}
              <div className="flex flex-wrap items-center gap-3 text-slate-700 font-mono pt-1">
                {invoice.applicantMobile && <span>Mob: +91 {invoice.applicantMobile}</span>}
                {invoice.applicantEmail && <span>• Email: {invoice.applicantEmail}</span>}
              </div>
            </div>

            <div className="md:col-span-5 md:border-l md:border-slate-200 md:pl-4 space-y-1 font-mono">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                PROJECT & WORK REFERENCE
              </div>
              <div className="text-xs font-bold text-slate-900 font-sans">
                {invoice.projectTitle || "Architectural & Engineering Consulting"}
              </div>
              <div className="text-slate-500 text-[11px] pt-1 space-y-0.5">
                <div>Currency: <strong>INR (₹)</strong></div>
                <div>Payment Terms: <strong>Due on Receipt / Net Terms</strong></div>
              </div>
            </div>
          </div>

          {/* Professional Line Items Table */}
          <div className="overflow-x-auto border-2 border-slate-900 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white font-mono font-bold">
                  <th className="p-3.5 text-center w-12 border-r border-slate-800">#</th>
                  <th className="p-3.5">Scope of Work / Service Description</th>
                  <th className="p-3.5 text-center w-28 border-l border-slate-800">Unit / Qty</th>
                  <th className="p-3.5 text-right w-32 border-l border-slate-800">Rate (₹)</th>
                  <th className="p-3.5 text-right w-36 border-l border-slate-800">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {(invoice.items || []).map((item, index) => (
                  <tr key={item.id} className={index % 2 === 1 ? "bg-slate-50/70" : "bg-white"}>
                    <td className="p-3 text-center font-mono text-slate-500 border-r border-slate-200">{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-950 font-sans">{item.description}</td>
                    <td className="p-3 text-center font-mono text-slate-700 border-l border-slate-200">{item.unit || "1"}</td>
                    <td className="p-3 text-right font-mono text-slate-800 border-l border-slate-200">
                      ₹{item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-950 border-l border-slate-200">
                      ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals & Payment Settlement Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            {/* Left Column: Bank Account Details & Official QR Code */}
            <div className="md:col-span-7 space-y-4">
              {/* Bank Transfer Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>Bank & Online Payment Details</span>
                  </span>
                  <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Official Account
                  </span>
                </div>
                
                {invoice.notes ? (
                  <div className="whitespace-pre-line leading-relaxed text-slate-700 pt-1">
                    {invoice.notes}
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-700 leading-relaxed pt-1">
                    <div>Bank Name: <strong>Axis Bank Ltd</strong></div>
                    <div>Account Name: <strong>VASTHUSILPY</strong></div>
                    <div>Account Number: <strong>923020007012383</strong></div>
                    <div>IFSC Code: <strong>UTIB0002144</strong> (Keralassery Branch)</div>
                    <div>UPI ID: <strong>7012383137@naviaxis</strong></div>
                  </div>
                )}
              </div>

              {/* Instant UPI Payment QR Code */}
              <div className="w-full">
                <InvoiceQrCode
                  upiId={invoice.upiId || "7012383137@naviaxis"}
                  payeeName="VASTHUSILPY"
                  amount={invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal}
                  invoiceNumber={invoice.invoiceNumber}
                  size={100}
                  compact={true}
                />
              </div>
            </div>

            {/* Right Column: Total Calculation Breakdown */}
            <div className="md:col-span-5 space-y-2.5 text-xs font-sans">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{invoice.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {invoice.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="font-semibold">Discount:</span>
                    <span className="font-mono font-bold">
                      -₹{invoice.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 text-slate-950">
                  <span className="font-black uppercase text-sm">Grand Total:</span>
                  <span className="font-mono font-black text-xl text-slate-950">
                    ₹{invoice.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-emerald-800 pt-1">
                  <span className="font-semibold">Amount Paid:</span>
                  <span className="font-mono font-bold">
                    ₹{invoice.totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-300 text-base font-black">
                  <span className="text-slate-900 uppercase">Balance Due:</span>
                  <span className={`font-mono ${invoice.balanceDue > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    ₹{invoice.balanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Authorized Signatory Block */}
              <div className="border border-slate-200 rounded-2xl p-4 text-center space-y-4 bg-white">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  For VASTHUSILPY
                </div>
                <div className="h-10 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                  <span className="text-[10px] text-slate-400 font-mono italic">Authorized Signature / Seal</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Registered Consulting Engineer & Valuer
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms & Conditions */}
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 space-y-1 font-sans">
            <div className="font-bold text-slate-700 text-[11px]">TERMS & CONDITIONS:</div>
            <div className="leading-relaxed">
              {invoice.terms ||
                "1. Payment should be made by UPI, Bank Transfer (NEFT/RTGS), or Cheque in favor of VASTHUSILPY. 2. Please quote invoice number during electronic transfer. 3. This is a computer-generated tax invoice."}
            </div>
            <div className="text-center font-bold text-slate-700 pt-2 text-[11px]">
              Thank you for your business!
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar on Modal (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 print:hidden">
          <div className="text-xs text-slate-500 font-mono">
            Document ID: #{invoice.id} • Vasthusilpy Certified System
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={() => handleRecordPaymentTrigger()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Delete invoice #{invoice.invoiceNumber}?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete this invoice for <strong>{invoice.applicantName}</strong>? All recorded payment records for this invoice will be removed.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteInvoice) {
                      onDeleteInvoice(invoice.id);
                    }
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-xs shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Delete invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Invoice Modal (WhatsApp, Email & Copy) */}
        {isSendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-sans">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Send Invoice #{invoice.invoiceNumber}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <strong className="text-slate-900">{invoice.applicantName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile:</span>
                  <strong className="text-slate-900">+91 {invoice.applicantMobile}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grand Total:</span>
                  <strong className="text-slate-900 font-mono">₹{invoice.grandTotal.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Balance Due:</span>
                  <strong className="text-rose-600 font-mono">₹{invoice.balanceDue.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* Status Alert Message */}
              {emailStatusMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs font-sans border flex items-start gap-2 ${
                    emailStatusMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-red-50 border-red-300 text-red-900"
                  }`}
                >
                  {emailStatusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">{emailStatusMessage.text}</div>
                </div>
              )}

              {/* Fast Send Channels */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Select Delivery Channel
                </label>

                {/* 1. WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => {
                    sendInvoiceViaWhatsApp(invoice);
                    if (onMarkAsSent) onMarkAsSent(invoice.id);
                    triggerAppNotification(
                      "INVOICE_GENERATED",
                      "WhatsApp Opened",
                      `Invoice #${invoice.invoiceNumber} prepared for ${invoice.applicantName} with payment link and QR`,
                      { invoiceId: invoice.id }
                    );
                  }}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send via WhatsApp (+91 {invoice.applicantMobile})</span>
                  </div>
                  <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full font-mono">
                    Includes UPI & QR Link
                  </span>
                </button>

                {/* 2. Automated Gmail Sending Box */}
                <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Automated Email via Gmail</span>
                    </div>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                      deepak.vasthusilpy@gmail.com
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">
                    Directly dispatches email to client with:
                    <br />
                    • 💳 <strong>Instant Payment Link</strong> (GPay/PhonePe/Paytm)
                    <br />
                    • 📲 <strong>Dynamic QR Code</strong> for required amount (<strong>₹{Number(requiredAmount).toLocaleString("en-IN")}</strong>)
                    <br />
                    • 📎 <strong>Attached Official Tax Invoice PDF</strong>
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">
                      Recipient Email Address:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={sendRecipientEmail}
                        onChange={(e) => setSendRecipientEmail(e.target.value)}
                        placeholder="client@example.com"
                        className="flex-1 bg-white border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={isSendingEmail}
                        onClick={handleSendAutomaticEmail}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send via Gmail</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Copy Summary Text */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(formatInvoiceWhatsAppMessage(invoice));
                    triggerAppNotification(
                      "INVOICE_GENERATED",
                      "Copied to Clipboard",
                      `Invoice #${invoice.invoiceNumber} summary text with Payment Link & QR copied!`
                    );
                  }}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Invoice Summary with Payment Link & QR</span>
                </button>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Receipt & Closed Invoice Dispatch Modal */}
        {isReceiptDispatchOpen && invoice && (
          <PaymentReceiptDispatchModal
            isOpen={isReceiptDispatchOpen}
            onClose={() => {
              setIsReceiptDispatchOpen(false);
              setSelectedPaymentForReceipt(undefined);
            }}
            invoice={invoice}
            paymentRecord={selectedPaymentForReceipt}
            onUpdateInvoice={onEditInvoice}
          />
        )}
      </div>
    </div>
  );
};
