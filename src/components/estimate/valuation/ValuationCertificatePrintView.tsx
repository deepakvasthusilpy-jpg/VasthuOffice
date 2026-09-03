import React from "react";
import { ValuationCertificate } from "../../../types";
import { numberToIndianWords } from "../../../data/estimateData";
import { ShieldCheck, Stamp } from "lucide-react";

interface ValuationCertificatePrintViewProps {
  certificate: ValuationCertificate;
  fontScale?: "normal" | "compact" | "large";
  isCleanPrint?: boolean;
}

export const ValuationCertificatePrintView: React.FC<ValuationCertificatePrintViewProps> = ({
  certificate,
  fontScale = "normal",
  isCleanPrint = false
}) => {
  const formatDate = (dStr?: string) => {
    if (!dStr) return "";
    try {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  const scaleClasses = {
    compact: "text-[12px] leading-relaxed",
    normal: "text-[13.5px] leading-relaxed",
    large: "text-[15px] leading-loose"
  }[fontScale];

  const sectionLabel =
    certificate.sectionType === "28C"
      ? "[under section 28C of the Kerala Stamp Act,1959]"
      : certificate.sectionType === "General"
      ? "[for Property Fair Value & Stamp Duty Assessment]"
      : "[under section 28B of the Kerala Stamp Act,1959]";

  return (
    <div
      id="valuation-cert-printable"
      className={`bg-white text-black font-serif w-full max-w-[210mm] mx-auto p-8 sm:p-12 md:p-14 shadow-2xl rounded-sm border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full ${scaleClasses}`}
      style={{ minHeight: "297mm", boxSizing: "border-box", backgroundColor: "#ffffff" }}
    >
      {/* =========================================================================
          HEADER SECTION (AS PER OFFICIAL KERALA SUB REGISTRAR FORMAT)
         ========================================================================= */}
      <div className="text-center space-y-1 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide underline underline-offset-4 decoration-1 text-black">
          Appendix
        </h1>
        <h2 className="text-base sm:text-lg font-bold mt-2 text-black">
          Valuation Certificate Submitted before the Sub Registrar
        </h2>
        <div className="text-xs sm:text-sm font-semibold italic text-black">
          {sectionLabel}
        </div>
        {certificate.certificateNo && (
          <div className="text-[11px] font-sans font-medium text-black mt-1">
            Certificate Ref No: <span className="font-bold text-black">{certificate.certificateNo}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          VALUER & APARTMENT / BUILDING PARTICULARS
         ========================================================================= */}
      <div className="space-y-4 mb-6 font-serif">
        {/* Name and address of Valuer */}
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 sm:col-span-4 font-bold text-black">
            Name and address of the Valuer:
          </div>
          <div className="col-span-8 sm:col-span-8 font-medium leading-snug">
            <span className="font-bold text-black">{certificate.valuerName}</span>
            {certificate.valuerAddress && (
              <span className="block text-slate-900">{certificate.valuerAddress}</span>
            )}
            {certificate.engineerPhone && (
              <span className="block text-xs font-sans text-slate-700">
                Ph: {certificate.engineerPhone}
              </span>
            )}
          </div>
        </div>

        {/* Designation */}
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 sm:col-span-4 font-bold text-black">
            Designation:
          </div>
          <div className="col-span-8 sm:col-span-8 font-medium">
            {certificate.designation}
          </div>
        </div>

        {/* Registration Number */}
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 sm:col-span-4 font-bold text-black">
            Registration Number:
          </div>
          <div className="col-span-8 sm:col-span-8 font-semibold tracking-wide">
            {certificate.regNo}
          </div>
        </div>

        {/* Sub Registry Office */}
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 sm:col-span-4 font-bold text-black">
            Sub Registry Office:
          </div>
          <div className="col-span-8 sm:col-span-8 font-semibold">
            {certificate.subRegistryOffice}
          </div>
        </div>

        {/* Date of Inspection */}
        <div className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4 sm:col-span-4 font-bold text-black">
            Date of Inspection:
          </div>
          <div className="col-span-8 sm:col-span-8 font-medium">
            {formatDate(certificate.inspectionDate)}
          </div>
        </div>

        {/* Name and Address of Apartment / Building */}
        <div className="grid grid-cols-12 gap-2 items-start pt-1">
          <div className="col-span-4 sm:col-span-4 font-bold text-black">
            Name and Address of the Apartment / Building:
          </div>
          <div className="col-span-8 sm:col-span-8 space-y-1">
            <div className="font-bold text-black">
              {certificate.propertyAddress || certificate.ownerAddress || "Property / Flat Details"}
            </div>
            {certificate.ownerName && (
              <div className="text-xs sm:text-sm text-slate-900">
                <span className="font-bold">Owner(s):</span> {certificate.ownerName}
              </div>
            )}
            <div className="text-xs sm:text-sm text-slate-800 flex flex-wrap gap-x-4 gap-y-0.5">
              {certificate.doorNo && <span><strong className="text-black">Door No:</strong> {certificate.doorNo}</span>}
              {certificate.syNo && <span><strong className="text-black">Re-Sy No:</strong> {certificate.syNo}</span>}
              {certificate.blockNo && <span><strong className="text-black">Block No:</strong> {certificate.blockNo}</span>}
              {certificate.wardNo && <span><strong className="text-black">Ward No:</strong> {certificate.wardNo}</span>}
              {certificate.villagePanchayat && <span><strong className="text-black">Village / LB:</strong> {certificate.villagePanchayat}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL 6-COLUMN VALUATION TABLE (EXACT APPENDIX FORMAT)
          Pure B&W table with white background and bold black headers
         ========================================================================= */}
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse border-2 border-black text-center text-xs sm:text-[12.5px] font-serif valuation-table-print bg-white">
          <thead>
            <tr className="bg-white text-black font-bold border-b-2 border-black">
              <th className="border border-black p-2.5 w-[16%] align-middle bg-white text-black font-bold">
                Rate per Sq. m. as per CPWD rates
              </th>
              <th className="border border-black p-2.5 w-[13%] align-middle bg-white text-black font-bold">
                Rate per Sq. ft.
              </th>
              <th className="border border-black p-2.5 w-[20%] align-middle bg-white text-black font-bold">
                Name of relevant Cost Index applied (Name/Cost Index)
              </th>
              <th className="border border-black p-2.5 w-[17%] align-middle bg-white text-black font-bold">
                Rate per sq.ft. after applying Cost Index
              </th>
              <th className="border border-black p-2.5 w-[17%] align-middle bg-white text-black font-bold">
                Area of the Apartment/ Flats (in sq. ft)
              </th>
              <th className="border border-black p-2.5 w-[17%] align-middle bg-white text-black font-bold">
                Total Value (in Rupees)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black font-medium bg-white text-black">
              <td className="border border-black p-3.5 align-middle">
                ₹ {Number(certificate.cpwdRatePerSqM || 0).toLocaleString("en-IN")}
              </td>
              <td className="border border-black p-3.5 align-middle">
                ₹ {Number(certificate.ratePerSqFtBase || 0).toFixed(2)}
              </td>
              <td className="border border-black p-3.5 align-middle">
                <div className="font-semibold text-black">{certificate.costIndexName}</div>
                <div className="text-[11px] font-sans text-black mt-0.5">
                  Cost Index: <strong>{certificate.costIndex}</strong>
                </div>
              </td>
              <td className="border border-black p-3.5 align-middle font-bold text-black">
                ₹ {Number(certificate.effectiveRatePerSqFt || 0).toFixed(2)}
                {certificate.ratePerSqFtAdjusted && certificate.ratePerSqFtAdjusted > 0 && (
                  <span className="block text-[10px] font-sans text-black font-normal">
                    (Adjusted)
                  </span>
                )}
              </td>
              <td className="border border-black p-3.5 align-middle">
                <div className="font-bold text-black">
                  {Number(certificate.areaSqFt || 0).toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                  })}{" "}
                  sq.ft
                </div>
                <div className="text-[10.5px] font-sans text-black mt-0.5">
                  ({certificate.areaSqM} m²)
                </div>
              </td>
              <td className="border border-black p-3.5 align-middle font-bold text-black text-sm">
                ₹ {Number(certificate.grossStructureValue || 0).toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          AGE & DEPRECIATION STATEMENT (IF APPLICABLE)
         ========================================================================= */}
      {(certificate.ageOfBuilding > 0 || certificate.totalLandValue) && (
        <div className="border border-black bg-white p-3.5 rounded-none my-4 text-xs sm:text-sm font-serif space-y-1.5 text-black">
          <div className="flex justify-between items-center border-b border-black pb-1">
            <span className="font-bold text-black">
              Year of Construction: {certificate.yearOfConstruction}
            </span>
            <span className="font-semibold text-black">
              Age of Building: <strong>{certificate.ageOfBuilding} Years</strong>
            </span>
          </div>

          {certificate.ageOfBuilding > 0 && (
            <div className="grid grid-cols-12 gap-2 text-xs">
              <div className="col-span-8 text-black">
                Depreciation applied @ {certificate.depreciationRatePerYear}% per year (Total:{" "}
                <strong>{certificate.totalDepreciationPct}%</strong> on Gross Structure Value)
              </div>
              <div className="col-span-4 text-right font-medium text-black">
                - ₹ {Number(certificate.depreciationAmount || 0).toLocaleString("en-IN")}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-black font-bold text-xs sm:text-sm">
            <span>Net Depreciated Structure Value:</span>
            <span>₹ {Number(certificate.netStructureValue || 0).toLocaleString("en-IN")}</span>
          </div>

          {certificate.totalLandValue && certificate.totalLandValue > 0 && (
            <div className="flex justify-between items-center text-xs text-black pt-1 border-t border-black">
              <span>
                Land / Undivided Share (UDS): {certificate.landAreaCents} Cents @ ₹{" "}
                {Number(certificate.landFairValuePerCent || 0).toLocaleString("en-IN")}/Cent
              </span>
              <span className="font-bold">
                + ₹ {Number(certificate.totalLandValue || 0).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1.5 border-t-2 border-black font-bold text-sm sm:text-base text-black">
            <span>TOTAL VALUATION CERTIFIED:</span>
            <span>₹ {Number(certificate.grandTotalValuation || 0).toLocaleString("en-IN")}</span>
          </div>

          <div className="text-[11px] font-sans font-semibold text-black italic pt-0.5">
            Amount in words: {certificate.grandTotalWords || numberToIndianWords(certificate.grandTotalValuation)}
          </div>
        </div>
      )}

      {/* =========================================================================
          BUILDING DESCRIPTION / SPECIFICATIONS
         ========================================================================= */}
      {certificate.buildingDescription && (
        <div className="my-5 text-xs sm:text-[13px] leading-relaxed">
          <div className="font-bold text-black mb-1">
            Brief Technical Description & Specifications:
          </div>
          <p className="text-black text-justify">
            {certificate.buildingDescription}
          </p>
        </div>
      )}

      {/* =========================================================================
          STATUTORY CERTIFICATION DECLARATION
         ========================================================================= */}
      <div className="my-8 text-xs sm:text-sm font-medium">
        <p className="indent-8 text-justify font-serif text-black leading-relaxed">
          I hereby certify that the information furnished above is true to the best of my knowledge and belief. The valuation has been computed strictly in accordance with Section 28B/28C of the Kerala Stamp Act, 1959 and applicable CPWD plinth area guidelines.
        </p>
      </div>

      {/* =========================================================================
          PLACE, DATE & OFFICIAL SIGNATURE (CLEAN B&W OFFICIAL FORMAT)
         ========================================================================= */}
      <div className="grid grid-cols-2 gap-4 items-end mt-16 pt-8 font-serif">
        {/* Left: Place and Date */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div>
            <span className="font-bold">Place : </span>
            <span className="font-medium">{certificate.place || ""}</span>
          </div>
          <div>
            <span className="font-bold">Date : </span>
            <span className="font-medium">{formatDate(certificate.certificateDate)}</span>
          </div>
        </div>

        {/* Right: Official Valuer Signature space (No digital stamp seal) */}
        <div className="text-center space-y-2 flex flex-col items-end">
          <div className="h-16" />
          <div className="border-t border-black pt-1.5 w-56 text-center">
            <div className="font-bold text-xs sm:text-sm font-serif text-black">
              Signature with seal
            </div>
            {certificate.valuerName && (
              <div className="text-[11px] font-sans font-medium text-slate-800 mt-0.5">
                ({certificate.valuerName})
              </div>
            )}
            {certificate.designation && (
              <div className="text-[10px] font-sans text-slate-700">
                {certificate.designation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
