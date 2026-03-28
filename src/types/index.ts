// src/types/index.ts

export type IncomeSource =
  | "salary"
  | "freelance"
  | "investment"
  | "rental"
  | "other";

export interface IncomeEntry {
  id: string;
  user_id: string;
  amount: number; // in Naira
  source: IncomeSource;
  date: string; // ISO date string
  notes?: string;
  wht_rate?: number; // e.g. 0.10 for 10%
  wht_amount?: number; // calculated: amount * wht_rate
  created_at: string;
}

export interface ExpenseEntry {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  is_deductible: boolean;
  deduction_type?: DeductionType;
  created_at: string;
}

export type ExpenseCategory =
  | "rent"
  | "food"
  | "transport"
  | "utilities"
  | "health"
  | "education"
  | "entertainment"
  | "other";

export type DeductionType =
  | "rent_relief" // 20% of annual rent, max ₦500k (NTA 2025)
  | "pension" // 8% of gross salary
  | "nhf" // National Housing Fund
  | "life_assurance";

export interface BudgetCategory {
  category: ExpenseCategory;
  limit: number; // monthly limit in Naira
  spent: number; // actual spent this month
}

export interface TaxEstimate {
  gross_income: number;
  taxable_income: number;
  total_deductions: number;
  pit_estimate: number; // Personal Income Tax
  wht_paid: number; // Already withheld
  net_liability: number; // pit_estimate - wht_paid
  is_exempt: boolean; // true if income <= ₦800k
  effective_rate: number; // net_liability / gross_income
  breakdown: TaxBracketBreakdown[];
}

export interface TaxBracketBreakdown {
  bracket_label: string;
  rate: number;
  taxable_amount: number;
  tax_amount: number;
}

export interface UserProfile {
  id: string;
  employment_type: "employed" | "self_employed" | "both";
  state_of_residence: string; // e.g. 'lagos', 'abuja'
  annual_rent?: number;
  monthly_pension_contribution?: number;
  tax_year_start: string; // ISO date, default Jan 1
}
