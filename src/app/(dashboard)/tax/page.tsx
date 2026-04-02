import { createClient } from "@/lib/supabase/server";
import {
  calculateTax,
  formatNaira,
  formatRate,
  getExemptionStatus,
  TAX_DISCLAIMER,
} from "@/lib/tax-engine/nta2025";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaxPdfButton } from "@/components/tax/tax-pdf-button";
import { TaxHistory } from "@/components/tax/tax-history";
import { TaxFormGenerator } from "@/components/efiling/form-generator";
import { Info, CheckCircle2, AlertCircle, TrendingDown } from "lucide-react";

export default async function TaxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

  // ── Fetch YTD data ──────────────────────────────────────────────────────
  const { data: incomeRows } = await supabase
    .from("income_entries")
    .select("amount, source, wht_amount")
    .eq("user_id", user!.id)
    .gte("date", yearStart);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("annual_rent, monthly_pension_contribution, nhf_monthly_contribution")
    .eq("id", user!.id)
    .single();

  // ── Aggregate income by source ──────────────────────────────────────────
  const incomeBySource = (incomeRows ?? []).reduce<Record<string, number>>(
    (acc, r) => { acc[r.source] = (acc[r.source] ?? 0) + r.amount; return acc; },
    {}
  );

  const totalWHTPaid = (incomeRows ?? []).reduce(
    (s, r) => s + (r.wht_amount ?? 0), 0
  );

  // ── Project YTD to annual ───────────────────────────────────────────────
  // We annualise based on months elapsed so the estimate is always
  // "on track for the full year" rather than just YTD total.
  const monthsElapsed = now.getMonth() + 1;
  const scale = 12 / monthsElapsed;

  const annualIncome = {
    salary:     Math.round((incomeBySource["salary"]     ?? 0) * scale),
    freelance:  Math.round((incomeBySource["freelance"]  ?? 0) * scale),
    investment: Math.round((incomeBySource["investment"] ?? 0) * scale),
    rental:     Math.round((incomeBySource["rental"]     ?? 0) * scale),
    other:      Math.round((incomeBySource["other"]      ?? 0) * scale),
  };

  const annualWHT = Math.round(totalWHTPaid * scale);

  // ── Run the tax engine ──────────────────────────────────────────────────
  const estimate = calculateTax(annualIncome, {
    annual_rent:              profile?.annual_rent ?? undefined,
    pension_contributions:    profile?.monthly_pension_contribution
                                ? profile.monthly_pension_contribution * 12
                                : undefined,
    nhf_contributions:        profile?.nhf_monthly_contribution
                                ? profile.nhf_monthly_contribution * 12
                                : undefined,
    wht_already_paid:         annualWHT > 0 ? annualWHT : undefined,
  });

  const exemptionStatus = getExemptionStatus(estimate);
  const hasIncome = estimate.gross_income > 0;

  const SOURCE_LABELS: Record<string, string> = {
    salary: "Salary", freelance: "Freelance", investment: "Investment",
    rental: "Rental", other: "Other",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tax estimate</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {now.getFullYear()} · NTA 2025 · Based on {monthsElapsed}{" "}
            {monthsElapsed === 1 ? "month" : "months"} of data
          </p>
        </div>
        {hasIncome && (
          <TaxPdfButton estimate={estimate} year={now.getFullYear()} />
        )}
      </div>

      {/* ── No data state ── */}
      {!hasIncome && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">No income logged yet</p>
            <p>
              Add income entries and your tax estimate will appear here automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {hasIncome && (
        <>
          {/* ── Status banner ── */}
          <Card className={
            exemptionStatus.status === "exempt"
              ? "border-green-200 bg-green-50/50"
              : exemptionStatus.status === "refund"
              ? "border-blue-200 bg-blue-50/50"
              : "border-amber-200 bg-amber-50/50"
          }>
            <CardContent className="py-4 flex items-start gap-3">
              {exemptionStatus.status === "exempt" || exemptionStatus.status === "refund" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{exemptionStatus.message}</p>
                {!estimate.is_exempt && estimate.monthly_liability > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly equivalent:{" "}
                    <span className="font-medium text-foreground">
                      {formatNaira(estimate.monthly_liability)}
                    </span>
                  </p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">NTA 2025</Badge>
            </CardContent>
          </Card>

          {/* ── Summary numbers ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Gross income"    value={formatNaira(estimate.gross_income)}        />
            <SummaryCard label="Taxable income"  value={formatNaira(estimate.taxable_income)}      />
            <SummaryCard label="Estimated PIT"   value={formatNaira(estimate.pit_before_wht)}      />
            <SummaryCard
              label="Net liability"
              value={formatNaira(estimate.net_tax_liability)}
              highlight
            />
          </div>

          {/* ── Income breakdown ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Income breakdown</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {Object.entries(estimate.income_breakdown)
                .filter(([key, val]) => key !== "gross" && val > 0)
                .map(([source, amount]) => (
                  <div key={source} className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">{SOURCE_LABELS[source] ?? source}</span>
                    <span className="font-medium">{formatNaira(amount)}</span>
                  </div>
                ))}
              <div className="flex justify-between py-2.5 text-sm font-semibold">
                <span>Total (annualised)</span>
                <span>{formatNaira(estimate.gross_income)}</span>
              </div>
              {monthsElapsed < 12 && (
                <p className="text-xs text-muted-foreground pt-2">
                  Based on {monthsElapsed} months of data, projected to full year.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Deductions ── */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Deductions applied</CardTitle>
              {estimate.tax_saved_by_deductions > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[#1A6B4A] font-medium">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Saving {formatNaira(estimate.tax_saved_by_deductions)}
                </div>
              )}
            </CardHeader>
            <CardContent className="divide-y">
              {estimate.deductions.rent_relief > 0 && (
                <DeductionRow
                  label="Rent relief"
                  amount={estimate.deductions.rent_relief}
                  note="20% of annual rent, max ₦500k (s.30 NTA 2025)"
                />
              )}
              {estimate.deductions.pension > 0 && (
                <DeductionRow
                  label="Pension contribution"
                  amount={estimate.deductions.pension}
                  note="8% of gross salary (PRA 2014)"
                />
              )}
              {estimate.deductions.nhf > 0 && (
                <DeductionRow
                  label="NHF contribution"
                  amount={estimate.deductions.nhf}
                  note="2.5% of basic salary"
                />
              )}
              {estimate.deductions.life_assurance > 0 && (
                <DeductionRow
                  label="Life assurance"
                  amount={estimate.deductions.life_assurance}
                  note="Up to 20% of gross income"
                />
              )}
              {estimate.deductions.total === 0 && (
                <p className="text-sm text-muted-foreground py-3">
                  No deductions on file. Update your profile with rent and pension
                  details to reduce your estimated liability.
                </p>
              )}
              {estimate.deductions.total > 0 && (
                <div className="flex justify-between py-2.5 text-sm font-semibold">
                  <span>Total deductions</span>
                  <span className="text-[#1A6B4A]">{formatNaira(estimate.deductions.total)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── PIT bracket breakdown ── */}
          {estimate.bracket_breakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tax bracket breakdown</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {/* Exempt band always shown first */}
                <div className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-medium">Exempt band</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      ₦0 – ₦800,000 · 0%
                    </span>
                  </div>
                  <span className="text-muted-foreground">₦0</span>
                </div>
                {estimate.bracket_breakdown.map((b) => (
                  <div key={b.label} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <span className="font-medium">{b.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {formatRate(b.rate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNaira(b.tax_in_band)}</p>
                      <p className="text-xs text-muted-foreground">
                        on {formatNaira(b.taxable_in_band)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between py-2.5 text-sm font-semibold">
                  <span>Total PIT (before WHT)</span>
                  <span>{formatNaira(estimate.pit_before_wht)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── WHT credit ── */}
          {estimate.wht_credit > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">WHT credit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Withholding tax already deducted at source
                  </span>
                  <span className="font-medium text-[#1A6B4A]">
                    − {formatNaira(estimate.wht_credit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                  <span>Net PIT liability</span>
                  <span>{formatNaira(estimate.net_tax_liability)}</span>
                </div>
                {estimate.potential_refund > 0 && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                    Your WHT credits exceed your PIT — you may be entitled to a refund
                    of <strong>{formatNaira(estimate.potential_refund)}</strong> via
                    self-assessment filing with LIRS.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Effective rate ── */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Effective tax rate</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Net liability ÷ gross income
                  </p>
                </div>
                <p className="text-2xl font-semibold">
                  {formatRate(estimate.effective_rate)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Disclaimer ── */}
          <div className="flex gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{TAX_DISCLAIMER}</p>
          </div>
        </>
      )}

      {/* ── Tax History ── */}
      <TaxHistory />

      {/* ── Tax Form Generation ── */}
      {hasIncome && (
        <TaxFormGenerator 
          taxData={{
            taxpayer_name: 'User Name', // In real app, get from user profile
            tin: 'TIN123456789',
            gross_income: estimate.gross_income,
            taxable_income: estimate.taxable_income,
            tax_liability: estimate.pit_before_wht,
            wht_credit: estimate.wht_credit,
            net_tax_due: estimate.net_tax_liability,
            year: now.getFullYear()
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-[#1A6B4A]/30 bg-[#1A6B4A]/5" : ""}>
      <CardContent className="py-3 px-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-semibold mt-0.5 ${highlight ? "text-[#1A6B4A]" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function DeductionRow({
  label, amount, note,
}: {
  label: string;
  amount: number;
  note: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      <span className="text-sm font-medium text-[#1A6B4A] shrink-0 ml-4">
        − {formatNaira(amount)}
      </span>
    </div>
  );
}
