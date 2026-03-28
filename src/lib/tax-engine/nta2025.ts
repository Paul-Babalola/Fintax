/**
 * NTA 2025 — Nigeria Tax Act Personal Income Tax Engine
 * Source: Nigeria Tax Act 2025 (signed June 26, 2025, effective Jan 1, 2026)
 *
 * Covers:
 *  - Progressive PIT brackets (Section 28, NTA 2025)
 *  - ₦800,000 annual exemption threshold (Section 58 + Fourth Schedule)
 *  - Rent relief: 20% of annual rent, max ₦500,000 (Section 30(vi))
 *  - Pension deduction: 8% of gross (PRA 2014, preserved by NTA 2025)
 *  - NHF deduction: 2.5% of monthly basic salary
 *  - Life assurance relief: actual premium paid, capped at 20% of gross
 *  - WHT offset: deduct WHT already withheld from final liability
 *
 * IMPORTANT: This engine produces estimates, not legal tax advice.
 * Always display the disclaimer below alongside any output.
 */

// ─── DISCLAIMER ────────────────────────────────────────────────────────────

export const TAX_DISCLAIMER =
  "This is an estimate based on NTA 2025 rates and the information you provided. " +
  "It is not legal or financial advice. Consult a certified tax professional or " +
  "visit lirs.gov.ng for official guidance before filing.";

// ─── TAX YEAR CONFIG ────────────────────────────────────────────────────────

export const TAX_YEAR = {
  year: 2026,
  effective_from: "2026-01-01",
  act: "Nigeria Tax Act 2025",
  version: "1.0.0",
} as const;

// ─── PIT BRACKETS — Fourth Schedule, NTA 2025 ───────────────────────────────
// Format: { up_to: annual income ceiling, rate: marginal rate }
// ₦800,000 and below → 0% (full exemption)
// Above ₦800,000 → progressive rates on the amount ABOVE the exemption

export interface TaxBracket {
  label: string;
  from: number;
  to: number; // Infinity for the top bracket
  rate: number; // decimal, e.g. 0.15 for 15%
}

export const PIT_BRACKETS: TaxBracket[] = [
  { label: "Exempt", from: 0, to: 800_000, rate: 0 },
  { label: "First band", from: 800_000, to: 2_200_000, rate: 0.15 },
  { label: "Second band", from: 2_200_000, to: 4_200_000, rate: 0.19 },
  { label: "Third band", from: 4_200_000, to: 8_200_000, rate: 0.21 },
  { label: "Fourth band", from: 8_200_000, to: 18_200_000, rate: 0.23 },
  { label: "Top band", from: 18_200_000, to: Infinity, rate: 0.25 },
];

// ─── RELIEF CAPS ────────────────────────────────────────────────────────────

export const RELIEF = {
  EXEMPTION_THRESHOLD: 800_000, // Full PIT exemption below this (Section 58)
  RENT_RELIEF_RATE: 0.2, // 20% of annual rent paid (Section 30(vi))
  RENT_RELIEF_CAP: 500_000, // Max ₦500,000 rent relief
  PENSION_RATE: 0.08, // 8% of gross (PRA 2014)
  NHF_RATE: 0.025, // 2.5% of monthly basic → annualised
  LIFE_ASSURANCE_RATE: 0.2, // Max 20% of gross income
  WHT_INVESTMENT_INCOME: 0.1, // 10% WHT on dividends / investment income
  WHT_RENTAL_INCOME: 0.1, // 10% WHT on rental income
} as const;

// ─── INPUT TYPES ────────────────────────────────────────────────────────────

export interface IncomeInput {
  /** Annual salary / employment income in Naira */
  salary?: number;
  /** Annual freelance / self-employment income */
  freelance?: number;
  /** Annual investment income (dividends, interest) — WHT applies */
  investment?: number;
  /** Annual rental income — WHT applies */
  rental?: number;
  /** Any other taxable income */
  other?: number;
}

export interface DeductionInput {
  /** Annual rent paid — engine applies 20% rate capped at ₦500k */
  annual_rent?: number;
  /** Annual pension contributions — if omitted, engine auto-calculates 8% of salary */
  pension_contributions?: number;
  /** Annual NHF contributions — if omitted, engine auto-calculates 2.5% of monthly basic */
  nhf_contributions?: number;
  /** Annual life assurance premiums paid */
  life_assurance_premium?: number;
  /** Any WHT already deducted at source and remitted (from certificates) */
  wht_already_paid?: number;
}

// ─── OUTPUT TYPES ────────────────────────────────────────────────────────────

export interface TaxBracketBreakdown {
  label: string;
  from: number;
  to: number;
  rate: number;
  taxable_in_band: number; // portion of income falling in this band
  tax_in_band: number; // tax owed for this band
}

export interface DeductionBreakdown {
  rent_relief: number;
  pension: number;
  nhf: number;
  life_assurance: number;
  total: number;
}

export interface IncomeBreakdown {
  salary: number;
  freelance: number;
  investment: number;
  rental: number;
  other: number;
  gross: number;
}

export interface TaxEstimate {
  /** Gross total income before any deductions */
  gross_income: number;
  income_breakdown: IncomeBreakdown;

  /** All statutory deductions applied */
  deductions: DeductionBreakdown;

  /** gross_income - deductions.total */
  taxable_income: number;

  /** True if taxable income is at or below ₦800,000 */
  is_exempt: boolean;

  /** PIT calculated from brackets before WHT offset */
  pit_before_wht: number;

  /** Total WHT credited (auto-calculated + manually provided) */
  wht_credit: number;

  /** Final net PIT liability (pit_before_wht - wht_credit). Min 0. */
  net_tax_liability: number;

  /** net_tax_liability / gross_income */
  effective_rate: number;

  /** Monthly equivalent of net_tax_liability */
  monthly_liability: number;

  /** Per-bracket breakdown of how PIT was computed */
  bracket_breakdown: TaxBracketBreakdown[];

  /** Estimated refund if wht_credit > pit_before_wht (claim via self-assessment) */
  potential_refund: number;

  /** Convenience: how much the user saved via deductions */
  tax_saved_by_deductions: number;

  /** Metadata */
  meta: {
    tax_year: number;
    act: string;
    calculated_at: string;
    disclaimer: string;
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundNaira(value: number): number {
  return Math.round(value);
}

// ─── BRACKET ENGINE ──────────────────────────────────────────────────────────

function calculatePIT(taxable_income: number): {
  total_pit: number;
  breakdown: TaxBracketBreakdown[];
} {
  if (taxable_income <= RELIEF.EXEMPTION_THRESHOLD) {
    return { total_pit: 0, breakdown: [] };
  }

  let remaining = taxable_income;
  let total_pit = 0;
  const breakdown: TaxBracketBreakdown[] = [];

  for (const bracket of PIT_BRACKETS) {
    if (remaining <= bracket.from) break;

    const band_ceiling = bracket.to === Infinity ? remaining : bracket.to;
    const taxable_in_band =
      clamp(remaining, bracket.from, band_ceiling) - bracket.from;

    if (taxable_in_band <= 0) continue;

    const tax_in_band = roundNaira(taxable_in_band * bracket.rate);
    total_pit += tax_in_band;

    breakdown.push({
      label: bracket.label,
      from: bracket.from,
      to: bracket.to,
      rate: bracket.rate,
      taxable_in_band,
      tax_in_band,
    });
  }

  return { total_pit, breakdown };
}

// ─── DEDUCTION ENGINE ────────────────────────────────────────────────────────

function calculateDeductions(
  income: IncomeBreakdown,
  input: DeductionInput,
): DeductionBreakdown {
  // Rent relief: 20% of annual rent, capped at ₦500k
  const rent_relief = input.annual_rent
    ? clamp(
        roundNaira(input.annual_rent * RELIEF.RENT_RELIEF_RATE),
        0,
        RELIEF.RENT_RELIEF_CAP,
      )
    : 0;

  // Pension: use provided value or auto-calculate 8% of salary
  const pension_base =
    input.pension_contributions !== undefined
      ? input.pension_contributions
      : roundNaira(income.salary * RELIEF.PENSION_RATE);
  const pension = clamp(pension_base, 0, income.salary); // can't exceed salary

  // NHF: use provided value or auto-calculate 2.5% of gross
  const nhf =
    input.nhf_contributions !== undefined
      ? input.nhf_contributions
      : roundNaira(income.gross * RELIEF.NHF_RATE);

  // Life assurance: actual premium, capped at 20% of gross
  const life_assurance_cap = roundNaira(
    income.gross * RELIEF.LIFE_ASSURANCE_RATE,
  );
  const life_assurance = input.life_assurance_premium
    ? clamp(input.life_assurance_premium, 0, life_assurance_cap)
    : 0;

  const total = rent_relief + pension + nhf + life_assurance;

  return { rent_relief, pension, nhf, life_assurance, total };
}

// ─── WHT CREDIT ENGINE ───────────────────────────────────────────────────────

function calculateWHTCredit(
  income: IncomeBreakdown,
  input: DeductionInput,
): number {
  // Auto-calculate WHT on investment income (10%) and rental income (10%)
  const auto_wht =
    roundNaira(income.investment * RELIEF.WHT_INVESTMENT_INCOME) +
    roundNaira(income.rental * RELIEF.WHT_RENTAL_INCOME);

  // Add any manually entered WHT from certificates
  const manual_wht = input.wht_already_paid ?? 0;

  // Avoid double-counting: if user entered manual WHT, trust it directly
  // (they may have already included investment WHT in their figure)
  return input.wht_already_paid !== undefined ? manual_wht : auto_wht;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * calculateTax
 *
 * Core Fintax tax engine. Pass annual income figures and deduction details.
 * Returns a full TaxEstimate with breakdown suitable for rendering directly in UI.
 *
 * @example
 * const estimate = calculateTax(
 *   { salary: 6_000_000, investment: 500_000 },
 *   { annual_rent: 1_200_000, wht_already_paid: 50_000 }
 * );
 * console.log(estimate.net_tax_liability); // ₦ figure after all deductions and WHT
 */
export function calculateTax(
  income_input: IncomeInput,
  deduction_input: DeductionInput = {},
): TaxEstimate {
  // 1. Normalise income
  const income: IncomeBreakdown = {
    salary: income_input.salary ?? 0,
    freelance: income_input.freelance ?? 0,
    investment: income_input.investment ?? 0,
    rental: income_input.rental ?? 0,
    other: income_input.other ?? 0,
    gross: 0,
  };
  income.gross =
    income.salary +
    income.freelance +
    income.investment +
    income.rental +
    income.other;

  // 2. Calculate deductions
  const deductions = calculateDeductions(income, deduction_input);

  // 3. Taxable income
  const taxable_income = Math.max(0, income.gross - deductions.total);

  // 4. Exemption check
  const is_exempt = taxable_income <= RELIEF.EXEMPTION_THRESHOLD;

  // 5. PIT from brackets
  const { total_pit, breakdown } = calculatePIT(taxable_income);

  // 6. What tax would be without deductions (for tax_saved calculation)
  const { total_pit: pit_no_deductions } = calculatePIT(income.gross);
  const tax_saved_by_deductions = Math.max(0, pit_no_deductions - total_pit);

  // 7. WHT credit
  const wht_credit = calculateWHTCredit(income, deduction_input);

  // 8. Net liability
  const raw_liability = total_pit - wht_credit;
  const net_tax_liability = Math.max(0, raw_liability);
  const potential_refund = raw_liability < 0 ? Math.abs(raw_liability) : 0;

  // 9. Effective rate (against gross, not taxable — more honest figure)
  const effective_rate =
    income.gross > 0 ? net_tax_liability / income.gross : 0;

  return {
    gross_income: income.gross,
    income_breakdown: income,
    deductions,
    taxable_income,
    is_exempt,
    pit_before_wht: total_pit,
    wht_credit,
    net_tax_liability,
    effective_rate,
    monthly_liability: roundNaira(net_tax_liability / 12),
    bracket_breakdown: breakdown,
    potential_refund,
    tax_saved_by_deductions,
    meta: {
      tax_year: TAX_YEAR.year,
      act: TAX_YEAR.act,
      calculated_at: new Date().toISOString(),
      disclaimer: TAX_DISCLAIMER,
    },
  };
}

// ─── CONVENIENCE HELPERS (use these in your React hooks) ─────────────────────

/**
 * annualiseMonthly
 * Convert monthly income/expense figures to annual before passing to calculateTax.
 */
export function annualiseMonthly(monthly: Partial<IncomeInput>): IncomeInput {
  return {
    salary: (monthly.salary ?? 0) * 12,
    freelance: (monthly.freelance ?? 0) * 12,
    investment: (monthly.investment ?? 0) * 12,
    rental: (monthly.rental ?? 0) * 12,
    other: (monthly.other ?? 0) * 12,
  };
}

/**
 * formatNaira
 * Format a number as ₦ with comma separators. Use in all UI display.
 */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * formatRate
 * Format a decimal rate as a percentage string.
 */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * getExemptionStatus
 * Returns a user-facing message about the user's tax status.
 */
export function getExemptionStatus(estimate: TaxEstimate): {
  status: "exempt" | "liable" | "refund";
  message: string;
} {
  if (estimate.is_exempt) {
    return {
      status: "exempt",
      message: `Your taxable income of ${formatNaira(estimate.taxable_income)} is below the ₦800,000 exemption threshold. You owe no personal income tax.`,
    };
  }
  if (estimate.potential_refund > 0) {
    return {
      status: "refund",
      message: `Your WHT credits exceed your PIT liability. You may be entitled to a refund of ${formatNaira(estimate.potential_refund)} via self-assessment filing with LIRS.`,
    };
  }
  return {
    status: "liable",
    message: `Your estimated net PIT liability is ${formatNaira(estimate.net_tax_liability)} (${formatRate(estimate.effective_rate)} effective rate).`,
  };
}
