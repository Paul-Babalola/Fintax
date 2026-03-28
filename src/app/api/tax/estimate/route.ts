import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  calculateTax,
  getExemptionStatus,
  type IncomeInput,
  type DeductionInput,
} from "@/lib/tax-engine/nta2025";

// ── POST /api/tax/estimate ────────────────────────────────────────────────────
// Computes a PIT estimate from the provided income and deduction inputs.
// Does not persist anything — pure calculation endpoint.
//
// Body (all optional, engine handles missing fields gracefully):
// {
//   income: {
//     salary?: number,
//     freelance?: number,
//     investment?: number,
//     rental?: number,
//     other?: number,
//   },
//   deductions: {
//     annual_rent?: number,
//     pension_contributions?: number,
//     nhf_contributions?: number,
//     life_assurance_premium?: number,
//     wht_already_paid?: number,
//   },
//   use_profile?: boolean   // if true, merges user profile data into deductions
// }

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is fine — will compute estimate from profile data only
  }

  const income: IncomeInput        = (body.income as IncomeInput) ?? {};
  const deductions: DeductionInput = (body.deductions as DeductionInput) ?? {};
  const useProfile = body.use_profile !== false; // default true

  // If use_profile is true, pull the user's stored profile and merge it
  // into deductions (body values take precedence over profile values)
  if (useProfile) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("annual_rent, monthly_pension_contribution, nhf_monthly_contribution")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (!deductions.annual_rent && profile.annual_rent) {
        deductions.annual_rent = profile.annual_rent;
      }
      if (!deductions.pension_contributions && profile.monthly_pension_contribution) {
        deductions.pension_contributions = profile.monthly_pension_contribution * 12;
      }
      if (!deductions.nhf_contributions && profile.nhf_monthly_contribution) {
        deductions.nhf_contributions = profile.nhf_monthly_contribution * 12;
      }
    }
  }

  // Validate that income values are numbers if provided
  for (const [key, val] of Object.entries(income)) {
    if (val !== undefined && (typeof val !== "number" || val < 0)) {
      return NextResponse.json(
        { error: `income.${key} must be a non-negative number` },
        { status: 400 }
      );
    }
  }

  const estimate = calculateTax(income, deductions);
  const status   = getExemptionStatus(estimate);

  return NextResponse.json({
    estimate,
    status,
  });
}

// ── GET /api/tax/estimate ─────────────────────────────────────────────────────
// Computes an estimate from the user's actual YTD income entries + profile.
// Annualises based on months elapsed so far this year.

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now       = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  const monthsElapsed = now.getMonth() + 1;

  const [{ data: incomeRows }, { data: profile }] = await Promise.all([
    supabase
      .from("income_entries")
      .select("amount, source, wht_amount")
      .eq("user_id", user.id)
      .gte("date", yearStart),
    supabase
      .from("user_profiles")
      .select("annual_rent, monthly_pension_contribution, nhf_monthly_contribution")
      .eq("id", user.id)
      .single(),
  ]);

  // Aggregate YTD income by source
  const ytdBySource = (incomeRows ?? []).reduce<Record<string, number>>(
    (acc, r) => { acc[r.source] = (acc[r.source] ?? 0) + r.amount; return acc; },
    {}
  );
  const ytdWHT = (incomeRows ?? []).reduce((s, r) => s + (r.wht_amount ?? 0), 0);

  // Annualise
  const scale = 12 / monthsElapsed;
  const annualIncome: IncomeInput = {
    salary:     Math.round((ytdBySource["salary"]     ?? 0) * scale),
    freelance:  Math.round((ytdBySource["freelance"]  ?? 0) * scale),
    investment: Math.round((ytdBySource["investment"] ?? 0) * scale),
    rental:     Math.round((ytdBySource["rental"]     ?? 0) * scale),
    other:      Math.round((ytdBySource["other"]      ?? 0) * scale),
  };

  const deductions: DeductionInput = {
    annual_rent:           profile?.annual_rent           ?? undefined,
    pension_contributions: profile?.monthly_pension_contribution
                             ? profile.monthly_pension_contribution * 12
                             : undefined,
    nhf_contributions:     profile?.nhf_monthly_contribution
                             ? profile.nhf_monthly_contribution * 12
                             : undefined,
    wht_already_paid:      ytdWHT > 0 ? Math.round(ytdWHT * scale) : undefined,
  };

  const estimate = calculateTax(annualIncome, deductions);
  const status   = getExemptionStatus(estimate);

  return NextResponse.json({
    estimate,
    status,
    meta: {
      months_elapsed:   monthsElapsed,
      annualised:       monthsElapsed < 12,
      ytd_income_total: Object.values(ytdBySource).reduce((s, v) => s + v, 0),
      ytd_wht_total:    ytdWHT,
    },
  });
}
