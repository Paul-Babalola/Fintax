import { createClient } from "@/lib/supabase/server";
import {
  calculateTax, formatNaira, formatRate,
  getExemptionStatus,
} from "@/lib/tax-engine/nta2025";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Wallet, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const FIXED_LABELS: Record<string, string> = {
  rent: "Rent", food: "Food", transport: "Transport",
  utilities: "Utilities", health: "Health", education: "Education",
  entertainment: "Entertainment", other: "Other",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0];

  // ── Fetch data ───────────────────────────────────────────────────────────

  const { data: incomeRows } = await supabase
    .from("income_entries")
    .select("amount, source, wht_amount")
    .eq("user_id", user!.id)
    .gte("date", monthStart);

  // Include custom_category_id so we can separate fixed vs custom expenses
  const { data: expenseRows } = await supabase
    .from("expenses")
    .select("amount, category, custom_category_id")
    .eq("user_id", user!.id)
    .gte("date", monthStart);

  // Include custom_category_id and joined name for display
  const { data: budgetRows } = await supabase
    .from("budgets")
    .select("id, category, monthly_limit, custom_category_id, user_categories(name)")
    .eq("user_id", user!.id);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("annual_rent, monthly_pension_contribution")
    .eq("id", user!.id)
    .single();

  // ── Income summary ───────────────────────────────────────────────────────

  const totalMonthlyIncome    = (incomeRows ?? []).reduce((s, r) => s + r.amount, 0);
  const totalMonthlyExpenses  = (expenseRows ?? []).reduce((s, r) => s + r.amount, 0);
  const totalWHTThisMonth     = (incomeRows ?? []).reduce((s, r) => s + (r.wht_amount ?? 0), 0);
  const netPosition           = totalMonthlyIncome - totalMonthlyExpenses;

  // ── Tax estimate (annualised) ────────────────────────────────────────────

  const monthsElapsed = now.getMonth() + 1;
  const annualSalary  = (totalMonthlyIncome / monthsElapsed) * 12;

  const estimate = calculateTax(
    { salary: annualSalary },
    {
      annual_rent:           profile?.annual_rent ?? undefined,
      pension_contributions: (profile?.monthly_pension_contribution ?? 0) * 12,
      wht_already_paid:      totalWHTThisMonth * (12 / monthsElapsed),
    }
  );

  const exemptionStatus = getExemptionStatus(estimate);

  // ── Budget progress ──────────────────────────────────────────────────────
  // Key fixed expenses by category string.
  // Key custom expenses by custom_category_id string.
  // Match each budget row using the same key so they never cross-contaminate.

  const spentByFixed = (expenseRows ?? [])
    .filter((e) => !e.custom_category_id)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});

  const spentByCustom = (expenseRows ?? [])
    .filter((e) => e.custom_category_id)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.custom_category_id!] = (acc[e.custom_category_id!] ?? 0) + e.amount;
      return acc;
    }, {});

  const budgetsWithProgress = (budgetRows ?? []).map((b) => {
    // Determine which bucket this budget draws from
    const spent = b.custom_category_id
      ? (spentByCustom[b.custom_category_id] ?? 0)
      : (spentByFixed[b.category] ?? 0);

    const limit = b.monthly_limit;
    const pct   = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

    // Display label — prefer custom category name over fixed label
    const label = b.custom_category_id
      ? ((b.user_categories as { name: string } | null)?.name ?? "Custom")
      : (FIXED_LABELS[b.category] ?? b.category);

    return { id: b.id, label, limit, spent, pct };
  });

  const monthLabel = now.toLocaleString("en-NG", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Income this month"
          value={formatNaira(totalMonthlyIncome)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          sub={totalMonthlyIncome === 0 ? "No entries yet" : `${incomeRows?.length} entries`}
          href="/income"
        />
        <StatCard
          title="Expenses this month"
          value={formatNaira(totalMonthlyExpenses)}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          sub={netPosition >= 0
            ? `${formatNaira(netPosition)} surplus`
            : `${formatNaira(Math.abs(netPosition))} over income`}
          href="/expenses"
          subColor={netPosition >= 0 ? "text-green-600" : "text-destructive"}
        />
        <StatCard
          title="Est. annual tax"
          value={formatNaira(estimate.net_tax_liability)}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          sub={`${formatRate(estimate.effective_rate)} effective rate`}
          href="/tax"
        />
      </div>

      {/* ── Tax status banner ── */}
      <TaxStatusBanner
        status={exemptionStatus}
        estimate={estimate}
      />

      {/* ── Budget progress ── */}
      {budgetsWithProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Budget this month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetsWithProgress.map(({ id, label, limit, spent, pct }) => (
              <BudgetRow
                key={id}
                label={label}
                spent={spent}
                limit={limit}
                pct={pct}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Empty state ── */}
      {totalMonthlyIncome === 0 && budgetsWithProgress.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Nothing tracked yet</p>
            <p>
              Start by{" "}
              <Link href="/income" className="underline underline-offset-4 text-foreground">
                logging your income
              </Link>{" "}
              — your tax estimate will appear here automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title, value, icon, sub, href, subColor = "text-muted-foreground",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  href: string;
  subColor?: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-sm transition-shadow cursor-pointer">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{value}</p>
          <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TaxStatusBanner({
  status, estimate,
}: {
  status: ReturnType<typeof getExemptionStatus>;
  estimate: ReturnType<typeof calculateTax>;
}) {
  const isPositive = status.status === "exempt" || status.status === "refund";

  return (
    <Card className={isPositive
      ? "border-green-200 bg-green-50/50"
      : "border-amber-200 bg-amber-50/50"
    }>
      <CardContent className="py-4 flex items-start gap-3">
        {isPositive
          ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          : <AlertCircle  className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{status.message}</p>
          {!estimate.is_exempt && (
            <p className="text-xs text-muted-foreground mt-1">
              Monthly equivalent:{" "}
              <span className="font-medium text-foreground">
                {formatNaira(estimate.monthly_liability)}
              </span>
              {estimate.tax_saved_by_deductions > 0 && (
                <> &middot; Deductions saving you{" "}
                  <span className="font-medium text-green-700">
                    {formatNaira(estimate.tax_saved_by_deductions)}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">NTA 2025</Badge>
      </CardContent>
    </Card>
  );
}

function BudgetRow({
  label, spent, limit, pct,
}: {
  label: string;
  spent: number;
  limit: number;
  pct: number;
}) {
  const color =
    pct >= 100 ? "bg-destructive" :
    pct >= 80  ? "bg-amber-500"   : "bg-[#1A6B4A]";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatNaira(spent)} / {formatNaira(limit)}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
