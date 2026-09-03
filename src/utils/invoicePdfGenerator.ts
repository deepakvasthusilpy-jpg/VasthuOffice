import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Invoice, PaymentRecord } from "../types";

export const generateUpiPaymentUri = (invoice: Invoice): string => {
  const upiId = (invoice.upiId || "7012383137@naviaxis").trim();
  const payeeName = "Vasthusilpy Architectural Consultants";
  const requiredAmount = typeof invoice.balanceDue === "number" && invoice.balanceDue > 0 
    ? invoice.balanceDue 
    : (invoice.grandTotal || 0);
  
  const cleanNote = `Invoice ${invoice.invoiceNumber || "Bill"}`;
  
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${requiredAmount}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
};

export const generateInvoicePdfBlob = async (invoice: Invoice): Promise<{ blob: Blob; base64: string; dataUri: string }> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Background header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, "F");

  // Accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 32, pageWidth, 2, "F");

  // Company Name & Header
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("VASTHUSILPY ARCHITECTURAL & ENGINEERING CONSULTANTS", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Near Panchayath Office, Keralassery, Palakkad - 678641, Kerala", margin, 18);
  doc.text("Ph: +91 9747995961, +91 7012383137 | Email: deepak.vasthusilpy@gmail.com", margin, 23);
  doc.text("Architectural Plans • Structural 3D • KPBR & K-SMART Approvals • Valuation • PWD Estimates", margin, 28);

  y = 42;

  // TAX INVOICE Header & Badge
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAX INVOICE", margin, y);

  // Status Badge
  const isPaid = invoice.paymentStatus === "PAID" || (invoice.grandTotal > 0 && (invoice.balanceDue || 0) <= 0);
  const isPartial = invoice.paymentStatus === "PARTIALLY PAID" || ((invoice.totalPaid || 0) > 0 && (invoice.balanceDue || 0) > 0);
  const statusText = isPaid ? "PAID & CLOSED" : isPartial ? "PARTIALLY PAID" : "PAYMENT DUE";

  doc.setFontSize(9);
  if (isPaid) {
    doc.setFillColor(209, 250, 229);
    doc.setTextColor(6, 95, 70);
  } else if (isPartial) {
    doc.setFillColor(254, 243, 199);
    doc.setTextColor(146, 64, 14);
  } else {
    doc.setFillColor(254, 226, 226);
    doc.setTextColor(153, 27, 27);
  }
  doc.roundedRect(pageWidth - margin - 42, y - 6, 42, 8, 2, 2, "F");
  doc.text(statusText, pageWidth - margin - 42 + 21, y - 1, { align: "center" });

  y += 7;

  // Metadata Grid (Invoice details & Client details)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth / 2 - 2, 34, 2, 2, "FD");
  doc.roundedRect(margin + contentWidth / 2 + 2, y, contentWidth / 2 - 2, 34, 2, 2, "FD");

  // Left Box: Bill To
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BILLED TO / CLIENT DETAILS:", margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(invoice.applicantName || "Client", margin + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Mobile: +91 ${invoice.applicantMobile || "-"}`, margin + 4, y + 17);
  if (invoice.applicantEmail) {
    doc.text(`Email: ${invoice.applicantEmail}`, margin + 4, y + 22);
  }
  if (invoice.applicantAddress) {
    const splitAddr = doc.splitTextToSize(`Address: ${invoice.applicantAddress}`, contentWidth / 2 - 10);
    doc.text(splitAddr, margin + 4, y + (invoice.applicantEmail ? 27 : 22));
  }

  // Right Box: Invoice Reference Info
  const rightX = margin + contentWidth / 2 + 6;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INVOICE PARTICULARS:", rightX, y + 6);

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Invoice Number:", rightX, y + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`#${invoice.invoiceNumber}`, rightX + 32, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("Invoice Date:", rightX, y + 17);
  doc.text(invoice.invoiceDate || "-", rightX + 32, y + 17);

  doc.text("Due Date:", rightX, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isPaid ? 6 : 185, isPaid ? 95 : 28, isPaid ? 70 : 28);
  doc.text(invoice.dueDate || "-", rightX + 32, y + 22);

  if (invoice.projectTitle) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text("Project Title:", rightX, y + 27);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.projectTitle.slice(0, 26), rightX + 32, y + 27);
  }

  y += 40;

  // Work Items Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SL", margin + 3, y + 5.5);
  doc.text("DESCRIPTION OF WORK / SERVICE", margin + 14, y + 5.5);
  doc.text("QTY", margin + contentWidth - 65, y + 5.5, { align: "right" });
  doc.text("UNIT", margin + contentWidth - 45, y + 5.5, { align: "center" });
  doc.text("RATE (₹)", margin + contentWidth - 25, y + 5.5, { align: "right" });
  doc.text("AMOUNT (₹)", margin + contentWidth - 3, y + 5.5, { align: "right" });

  y += 8;

  // Table Rows
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setTextColor(71, 85, 105);
    doc.text(String(idx + 1), margin + 3, y + 4.8);

    doc.setTextColor(15, 23, 42);
    const desc = item.description || `Item #${idx + 1}`;
    doc.text(desc.length > 55 ? desc.slice(0, 52) + "..." : desc, margin + 14, y + 4.8);

    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity || 1), margin + contentWidth - 65, y + 4.8, { align: "right" });
    doc.text(item.unit || "unit", margin + contentWidth - 45, y + 4.8, { align: "center" });
    doc.text(Number(item.rate || 0).toLocaleString("en-IN"), margin + contentWidth - 25, y + 4.8, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(Number(item.amount || 0).toLocaleString("en-IN"), margin + contentWidth - 3, y + 4.8, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += 7;
  });

  // Table Border Bottom
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);

  y += 5;

  // Totals Breakdown (Right Aligned Box)
  const totalsBoxWidth = 85;
  const totalsX = margin + contentWidth - totalsBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(totalsX, y, totalsBoxWidth, 36, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", totalsX + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${Number(invoice.subTotal || invoice.grandTotal || 0).toLocaleString("en-IN")}`, totalsX + totalsBoxWidth - 4, y + 6, { align: "right" });

  if (invoice.discount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(185, 28, 28);
    doc.text("Discount:", totalsX + 4, y + 12);
    doc.setFont("helvetica", "bold");
    doc.text(`- ₹${Number(invoice.discount).toLocaleString("en-IN")}`, totalsX + totalsBoxWidth - 4, y + 12, { align: "right" });
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Grand Total:", totalsX + 4, y + 18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${Number(invoice.grandTotal || 0).toLocaleString("en-IN")}`, totalsX + totalsBoxWidth - 4, y + 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(6, 95, 70);
  doc.text("Total Paid:", totalsX + 4, y + 24);
  doc.setFont("helvetica", "bold");
  doc.text(`₹${Number(invoice.totalPaid || 0).toLocaleString("en-IN")}`, totalsX + totalsBoxWidth - 4, y + 24, { align: "right" });

  // Highlight Balance Due
  if (isPaid) {
    doc.setFillColor(209, 250, 229);
    doc.rect(totalsX + 2, y + 27, totalsBoxWidth - 4, 7, "F");
    doc.setTextColor(6, 95, 70);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("BALANCE DUE:", totalsX + 4, y + 32);
    doc.text("₹0 (PAID IN FULL)", totalsX + totalsBoxWidth - 4, y + 32, { align: "right" });
  } else {
    doc.setFillColor(254, 226, 226);
    doc.rect(totalsX + 2, y + 27, totalsBoxWidth - 4, 7, "F");
    doc.setTextColor(153, 27, 27);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("BALANCE DUE:", totalsX + 4, y + 32);
    doc.text(`₹${Number(invoice.balanceDue || 0).toLocaleString("en-IN")}`, totalsX + totalsBoxWidth - 4, y + 32, { align: "right" });
  }

  // Left side: If Paid, show Official Settlement & Receipt Badge. If Unpaid, show QR Code.
  const qrBoxWidth = contentWidth - totalsBoxWidth - 6;
  if (isPaid) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, qrBoxWidth, 36, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(6, 95, 70);
    doc.text("PAYMENT RECEIVED IN FULL - INVOICE CLOSED", margin + 5, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text(`Total Amount Received: ₹${Number(invoice.totalPaid || invoice.grandTotal).toLocaleString("en-IN")}`, margin + 5, y + 14);
    doc.text(`Settlement Status: Closed & Discharged`, margin + 5, y + 19);

    const lastPayment = (invoice.payments && invoice.payments.length > 0) ? invoice.payments[invoice.payments.length - 1] : null;
    if (lastPayment) {
      doc.text(`Latest Transaction: ₹${lastPayment.amount.toLocaleString("en-IN")} via ${lastPayment.paymentMode || "UPI"} on ${lastPayment.date}`, margin + 5, y + 24);
      if (lastPayment.referenceNo) {
        doc.text(`Reference / UTR: ${lastPayment.referenceNo}`, margin + 5, y + 29);
      }
    } else {
      doc.text("All outstanding dues against this tax invoice have been fully cleared.", margin + 5, y + 25);
    }
  } else {
    // QR Code & Payment Instructions on Left
    const upiUri = generateUpiPaymentUri(invoice);
    try {
      const qrDataUrl = await QRCode.toDataURL(upiUri, {
        width: 250,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, qrBoxWidth, 36, 2, 2, "FD");

      // Embed QR Image
      doc.addImage(qrDataUrl, "PNG", margin + 3, y + 3, 30, 30);

      // QR & Bank details text
      const payTextX = margin + 36;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("SCAN QR TO PAY REQUIRED AMOUNT", payTextX, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Amount: ₹${Number(invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal).toLocaleString("en-IN")}`, payTextX, y + 12);
      doc.text(`UPI ID: ${invoice.upiId || "7012383137@naviaxis"}`, payTextX, y + 16);
      doc.text("Bank: SBI Keralassery | A/C: 1062 5047 526", payTextX, y + 20);
      doc.text("IFSC: SBIN0007624", payTextX, y + 24);
      doc.text("GPay / PhonePe / Paytm / BHIM supported", payTextX, y + 28);
    } catch (e) {
      console.error("Failed to render QR Code into PDF:", e);
    }
  }

  y += 42;

  // Notes & Terms
  if (invoice.notes || invoice.terms) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("NOTES & PAYMENT INSTRUCTIONS:", margin + 4, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    const combinedNotes = `${invoice.notes || ""}${invoice.terms ? ` | Terms: ${invoice.terms}` : ""}`;
    const splitNotes = doc.splitTextToSize(combinedNotes, contentWidth - 8);
    doc.text(splitNotes, margin + 4, y + 10);
    y += 24;
  }

  // Signatory & Stamp
  const footerY = Math.max(y + 6, 260);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for choosing Vasthusilpy Architectural & Engineering Consultants.", margin, footerY + 5);
  doc.text("This is a computer-generated tax invoice verified with digital payment records.", margin, footerY + 9);

  // Authorized Signatory
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("For VASTHUSILPY CONSULTANTS", pageWidth - margin - 50, footerY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory", pageWidth - margin - 50, footerY + 12);

  const dataUri = doc.output("datauristring");
  const base64 = dataUri.split(",")[1];
  const blob = doc.output("blob");

  return { blob, base64, dataUri };
};

export const generateReceiptPdfBlob = async (
  invoice: Invoice,
  payment?: PaymentRecord
): Promise<{ blob: Blob; base64: string; dataUri: string }> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Background header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, "F");

  // Emerald accent line
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 32, pageWidth, 2, "F");

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("VASTHUSILPY ARCHITECTURAL & ENGINEERING CONSULTANTS", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Near Panchayath Office, Keralassery, Palakkad - 678641, Kerala", margin, 18);
  doc.text("Ph: +91 9747995961, +91 7012383137 | Email: deepak.vasthusilpy@gmail.com", margin, 23);
  doc.text("Architectural Plans • Structural 3D • KPBR & K-SMART Approvals • Valuation • PWD Estimates", margin, 28);

  y = 42;

  // Title & Receipt Badge
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("OFFICIAL PAYMENT RECEIPT & SETTLEMENT", margin, y);

  const isClosed = (invoice.balanceDue || 0) <= 0;
  doc.setFontSize(9);
  doc.setFillColor(209, 250, 229);
  doc.setTextColor(6, 95, 70);
  doc.roundedRect(pageWidth - margin - 46, y - 6, 46, 8, 2, 2, "F");
  doc.text(isClosed ? "INVOICE CLOSED • PAID" : "PARTIAL RECEIPT", pageWidth - margin - 46 + 23, y - 1, { align: "center" });

  y += 8;

  // Receipt Number & Date Strip
  const receiptNo = `REC-${invoice.invoiceNumber}-${payment?.id ? payment.id.slice(-4) : "TX"}`;
  const receiptDate = payment?.date || new Date().toISOString().split("T")[0];

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("RECEIPT NUMBER:", margin + 4, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.text(receiptNo, margin + 36, y + 6);

  doc.setTextColor(100, 116, 139);
  doc.text("RECEIPT DATE:", margin + contentWidth / 2 + 4, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.text(receiptDate, margin + contentWidth / 2 + 30, y + 6);

  doc.setTextColor(100, 116, 139);
  doc.text("INVOICE REF:", margin + 4, y + 11);
  doc.setTextColor(15, 23, 42);
  doc.text(`#${invoice.invoiceNumber} (${invoice.projectTitle || "Consultancy Services"})`, margin + 36, y + 11);

  y += 18;

  // Received From & Payment Mode
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Received with thanks from:", margin + 6, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.applicantName, margin + 6, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile: +91 ${invoice.applicantMobile || "-"} | Address: ${invoice.applicantAddress || "Keralassery, Palakkad"}`, margin + 6, y + 21);

  // Large Amount Box
  const paymentAmount = payment ? payment.amount : invoice.totalPaid;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin + 4, y + 26, contentWidth - 8, 22, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text("AMOUNT RECEIVED:", margin + 8, y + 33);

  doc.setFontSize(16);
  doc.setTextColor(6, 95, 70);
  doc.text(`INR ₹${Number(paymentAmount).toLocaleString("en-IN")}`, margin + 8, y + 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const modeText = payment?.paymentMode || "Bank payment / UPI";
  const refText = payment?.referenceNo ? ` | Ref / UTR: ${payment.referenceNo}` : "";
  const accText = payment?.account ? ` | Credited To: ${payment.account}` : "";
  doc.text(`Payment Mode: ${modeText}${refText}${accText}`, margin + 80, y + 42);

  y += 60;

  // Account Statement / Invoice Settlement Summary Table
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INVOICE PARTICULARS & ACCOUNT RECONCILIATION", margin + 4, y + 5.5);

  y += 8;

  // Table row
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 38, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 38, "D");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text("Invoice Total Amount:", margin + 6, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${Number(invoice.grandTotal).toLocaleString("en-IN")}`, margin + contentWidth - 6, y + 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Total Paid to Date (including this receipt):", margin + 6, y + 16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(6, 95, 70);
  doc.text(`₹${Number(invoice.totalPaid).toLocaleString("en-IN")}`, margin + contentWidth - 6, y + 16, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 4, y + 20, margin + contentWidth - 4, y + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  if (isClosed) {
    doc.setTextColor(6, 95, 70);
    doc.text("REMAINING BALANCE DUE:", margin + 6, y + 28);
    doc.text("₹0.00 (FULLY SETTLED & CLOSED)", margin + contentWidth - 6, y + 28, { align: "right" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 101, 52);
    doc.text("✓ This invoice is officially closed and archived in Vasthusilpy digital records.", margin + 6, y + 34);
  } else {
    doc.setTextColor(185, 28, 28);
    doc.text("REMAINING BALANCE DUE:", margin + 6, y + 28);
    doc.text(`₹${Number(invoice.balanceDue).toLocaleString("en-IN")}`, margin + contentWidth - 6, y + 28, { align: "right" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Due Date for remaining balance: ${invoice.dueDate}`, margin + 6, y + 34);
  }

  y += 44;

  // Memo / Notes
  if (payment?.memo || payment?.notes || invoice.notes) {
    const noteContent = payment?.memo || payment?.notes || invoice.notes || "";
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("MEMO / TRANSACTION REMARKS:", margin + 4, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(noteContent, margin + 4, y + 10);
    y += 20;
  }

  // Footer Signatory
  const footerY = Math.max(y + 6, 255);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("This is an official computer-generated receipt from Vasthusilpy Consultants.", margin, footerY + 5);
  doc.text("Verified with digital banking ledger records.", margin, footerY + 9);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("For VASTHUSILPY CONSULTANTS", pageWidth - margin - 50, footerY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory / Accounts Desk", pageWidth - margin - 50, footerY + 12);

  const dataUri = doc.output("datauristring");
  const base64 = dataUri.split(",")[1];
  const blob = doc.output("blob");

  return { blob, base64, dataUri };
};

