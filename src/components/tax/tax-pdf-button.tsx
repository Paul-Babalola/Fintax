"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { TaxEstimate } from "@/lib/tax-engine/nta2025";
import { formatNaira, formatRate, TAX_DISCLAIMER } from "@/lib/tax-engine/nta2025";

interface Props {
  estimate: TaxEstimate;
  year: number;
}

export function TaxPdfButton({ estimate, year }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    try {
      // Build HTML content for the PDF
      const html = buildTaxSummaryHtml(estimate, year);

      // Open in a new tab — user can print to PDF from there
      const blob = new Blob([html], { type: "text/html" });
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, "_blank");

      // Give the browser time to render before revoking the blob URL
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      if (!win) {
        // Fallback: trigger a download of the HTML file
        const a = document.createElement("a");
        a.href = url;
        a.download = `fintax-tax-summary-${year}.html`;
        a.click();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="shrink-0"
    >
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Preparing…" : "Export summary"}
    </Button>
  );
}

// ── HTML template ─────────────────────────────────────────────────────────────

function buildTaxSummaryHtml(estimate: TaxEstimate, year: number): string {
  const generatedAt = new Date().toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });

  const SOURCE_LABELS: Record<string, string> = {
    salary: "Salary", freelance: "Freelance", investment: "Investment",
    rental: "Rental", other: "Other",
  };

  const incomeRows = Object.entries(estimate.income_breakdown)
    .filter(([key, val]) => key !== "gross" && val > 0)
    .map(([source, amount]) => `
      <tr>
        <td>${SOURCE_LABELS[source] ?? source}</td>
        <td class="amount">${formatNaira(amount)}</td>
      </tr>`)
    .join("");

  const bracketRows = [
    `<tr><td>Exempt band (₦0 – ₦800,000)</td><td class="amount right">0%</td><td class="amount">₦0</td></tr>`,
    ...estimate.bracket_breakdown.map((b) => `
      <tr>
        <td>${b.label} (on ${formatNaira(b.taxable_in_band)})</td>
        <td class="amount right">${formatRate(b.rate)}</td>
        <td class="amount">${formatNaira(b.tax_in_band)}</td>
      </tr>`),
  ].join("");

  const deductionRows = [
    estimate.deductions.rent_relief > 0
      ? `<tr><td>Rent relief (20% of annual rent, max ₦500k)</td><td class="amount green">− ${formatNaira(estimate.deductions.rent_relief)}</td></tr>` : "",
    estimate.deductions.pension > 0
      ? `<tr><td>Pension contribution (8% of gross)</td><td class="amount green">− ${formatNaira(estimate.deductions.pension)}</td></tr>` : "",
    estimate.deductions.nhf > 0
      ? `<tr><td>NHF contribution</td><td class="amount green">− ${formatNaira(estimate.deductions.nhf)}</td></tr>` : "",
    estimate.deductions.life_assurance > 0
      ? `<tr><td>Life assurance premium</td><td class="amount green">− ${formatNaira(estimate.deductions.life_assurance)}</td></tr>` : "",
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fintax Tax Summary — ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 40px; max-width: 680px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 600; color: #1A6B4A; }
    h2 { font-size: 14px; font-weight: 600; margin: 24px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .meta { color: #6b7280; font-size: 12px; margin-top: 4px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    td { padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    td.amount { text-align: right; font-variant-numeric: tabular-nums; }
    td.right { text-align: right; }
    td.green { color: #1A6B4A; font-weight: 500; }
    .total td { font-weight: 600; border-top: 2px solid #e5e7eb; border-bottom: none; padding-top: 10px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .summary-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .summary-box .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-box .value { font-size: 18px; font-weight: 600; margin-top: 2px; }
    .summary-box.highlight { border-color: #1A6B4A; background: #f0faf4; }
    .summary-box.highlight .value { color: #1A6B4A; }
    .badge { display: inline-block; background: #f0faf4; color: #1A6B4A; border: 1px solid #1A6B4A; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 500; }
    .disclaimer { margin-top: 32px; padding: 12px; background: #f9fafb; border-radius: 6px; font-size: 11px; color: #6b7280; line-height: 1.6; }
    .status-banner { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
    .status-banner.liable { background: #fffbeb; border: 1px solid #fcd34d; }
    .status-banner.exempt { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
    @media print {
      body { padding: 20px; }
      @page { margin: 20mm; }
    }
  </style>
</head>
<body>
  <h1>Fintax</h1>
  <p class="meta">
    Personal Income Tax Summary &nbsp;·&nbsp; Tax Year ${year} &nbsp;·&nbsp;
    Generated ${generatedAt} &nbsp;·&nbsp;
    <span class="badge">NTA 2025</span>
  </p>

  <div class="status-banner ${estimate.is_exempt ? "exempt" : "liable"}">
    ${estimate.is_exempt
      ? `✓ Your taxable income of ${formatNaira(estimate.taxable_income)} is below the ₦800,000 exemption threshold. You owe no personal income tax.`
      : `Estimated net PIT liability: <strong>${formatNaira(estimate.net_tax_liability)}</strong> (${formatRate(estimate.effective_rate)} effective rate) &nbsp;·&nbsp; Monthly: <strong>${formatNaira(estimate.monthly_liability)}</strong>`
    }
  </div>

  <div class="summary-grid">
    <div class="summary-box">
      <div class="label">Gross income</div>
      <div class="value">${formatNaira(estimate.gross_income)}</div>
    </div>
    <div class="summary-box">
      <div class="label">Taxable income</div>
      <div class="value">${formatNaira(estimate.taxable_income)}</div>
    </div>
    <div class="summary-box">
      <div class="label">Total deductions</div>
      <div class="value">${formatNaira(estimate.deductions.total)}</div>
    </div>
    <div class="summary-box highlight">
      <div class="label">Net PIT liability</div>
      <div class="value">${formatNaira(estimate.net_tax_liability)}</div>
    </div>
  </div>

  <h2>Income sources</h2>
  <table>
    ${incomeRows}
    <tr class="total"><td>Total gross income</td><td class="amount">${formatNaira(estimate.gross_income)}</td></tr>
  </table>

  <h2>Deductions (NTA 2025)</h2>
  <table>
    ${deductionRows || `<tr><td colspan="2" style="color:#6b7280">No deductions on file.</td></tr>`}
    <tr class="total">
      <td>Total deductions</td>
      <td class="amount green">− ${formatNaira(estimate.deductions.total)}</td>
    </tr>
  </table>

  <h2>PIT calculation — bracket breakdown</h2>
  <table>
    <thead>
      <tr>
        <td style="color:#6b7280;font-size:11px;padding-bottom:4px">Band</td>
        <td class="amount right" style="color:#6b7280;font-size:11px;padding-bottom:4px">Rate</td>
        <td class="amount" style="color:#6b7280;font-size:11px;padding-bottom:4px">Tax</td>
      </tr>
    </thead>
    <tbody>
      ${bracketRows}
    </tbody>
    <tfoot>
      <tr class="total">
        <td colspan="2">Total PIT (before WHT)</td>
        <td class="amount">${formatNaira(estimate.pit_before_wht)}</td>
      </tr>
    </tfoot>
  </table>

  ${estimate.wht_credit > 0 ? `
  <h2>WHT credit</h2>
  <table>
    <tr><td>WHT deducted at source</td><td class="amount green">− ${formatNaira(estimate.wht_credit)}</td></tr>
    <tr class="total"><td>Net PIT liability</td><td class="amount">${formatNaira(estimate.net_tax_liability)}</td></tr>
  </table>` : ""}

  ${estimate.potential_refund > 0 ? `
  <div class="status-banner exempt" style="margin-top:16px">
    ₦ Potential refund: <strong>${formatNaira(estimate.potential_refund)}</strong> — your WHT credits exceed your PIT. File a self-assessment with LIRS to claim this refund.
  </div>` : ""}

  <div class="disclaimer">
    <strong>Disclaimer:</strong> ${TAX_DISCLAIMER}
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}
