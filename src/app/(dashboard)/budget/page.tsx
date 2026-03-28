import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/tax-engine/nta2025";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BudgetSetupForm } from "@/components/forms/budget-setup-form";
import { AlertTriangle } from "lucide-react";

const FIXED_CATEGORY_LABELS: Record<string, string> = {
  rent:          "Rent",
  food:          "Food",
  transport:     "Transport",
  utilities:     "Utilities",
  health:        "Health",
  education:     "Education",
  entertainment: "Entertainment",
};

const CATEGORY_ICONS: Record<string, string> = {
  rent:          "🏠",
  food:          "🍽️",
  transport:     "🚗",
  utilities:     "💡",
  health:        "🏥",
  education:     "📚",
  entertainment: "🎬",
};

type BudgetWithCategory = {
  id: string;
  category: string;
  monthly_limit: number;
  custom_label: string | null;
  custom_category_id: string | null;
  user_categories?: { name: string } | null;
};

function getBudgetLabel(b: BudgetWithCategory): string {
  if (b.custom_category_id && b.user_categories?.name) return b.user_categories.name;
  return FIXED_CATEGORY_LABELS[b.category] ?? b.category;
}

function getBudgetIcon(b: BudgetWithCategory): string {
  if (b.custom_category_id) return "📦";
  return CATEGORY_ICONS[b.category] ?? "📦";
}

export default async function BudgetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0];

  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, user_categories(name)")
    .eq("user_id", user!.id)
    .order("created_at");

  const { data: userCategories } = await supabase
    .from("user_categories")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, category, custom_category_id")
    .eq("user_id", user!.id)
    .gte("date", monthStart);

  const spentByFixed = (expenses ?? [])
    .filter((e) => !e.custom_category_id)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});

  const spentByCustom = (expenses ?? [])
    .filter((e) => e.custom_category_id)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.custom_category_id!] = (acc[e.custom_category_id!] ?? 0) + e.amount;
      return acc;
    }, {});

  const budgetRows = (budgets ?? []).map((b) => {
    const spent = b.custom_category_id
      ? (spentByCustom[b.custom_category_id] ?? 0)
      : (spentByFixed[b.category] ?? 0);
    const pct = b.monthly_limit > 0
      ? Math.min(100, Math.round((spent / b.monthly_limit) * 100))
      : 0;
    return { ...b, spent, pct };
  });

  const totalBudgeted = budgetRows.reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent    = budgetRows.reduce((s, b) => s + b.spent, 0);
  const overBudget    = budgetRows.filter((b) => b.pct >= 100);
  const nearLimit     = budgetRows.filter((b) => b.pct >= 80 && b.pct < 100);

  const budgetedFixed = new Set(
    (budgets ?? []).filter((b) => !b.custom_category_id).map((b) => b.category)
  );
  const unbudgetedFixed = Object.keys(FIXED_CATEGORY_LABELS).filter(
    (c) => !budgetedFixed.has(c)
  );

  const monthLabel = now.toLocaleString("en-NG", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Budget</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>
      </div>

      {overBudget.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-destructive text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Over budget in {overBudget.length}{" "}
            {overBudget.length === 1 ? "category" : "categories"}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {overBudget.map(getBudgetLabel).join(", ")}
          </p>
        </div>
      )}

      {nearLimit.length > 0 && overBudget.length === 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50/50 p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Approaching limit in {nearLimit.length}{" "}
            {nearLimit.length === 1 ? "category" : "categories"}
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            {nearLimit.map(getBudgetLabel).join(", ")}
          </p>
        </div>
      )}

      {budgetRows.length > 0 && (
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total budgeted</p>
            <p className="text-lg font-semibold">{formatNaira(totalBudgeted)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total spent</p>
            <p className={`text-lg font-semibold ${totalSpent > totalBudgeted ? "text-destructive" : ""}`}>
              {formatNaira(totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className={`text-lg font-semibold ${totalBudgeted - totalSpent < 0 ? "text-destructive" : "text-[#1A6B4A]"}`}>
              {formatNaira(Math.abs(totalBudgeted - totalSpent))}
              {totalBudgeted - totalSpent < 0 && (
                <span className="text-xs font-normal ml-1">over</span>
              )}
            </p>
          </div>
        </div>
      )}

      {budgetRows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {budgetRows.map((b) => {
              const barColor =
                b.pct >= 100 ? "bg-destructive" :
                b.pct >= 80  ? "bg-amber-500"   : "bg-[#1A6B4A]";

              return (
                <div key={b.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base" aria-hidden>{getBudgetIcon(b)}</span>
                      <span className="text-sm font-medium">{getBudgetLabel(b)}</span>
                      {b.pct >= 100 && (
                        <Badge variant="destructive" className="text-xs py-0">Over</Badge>
                      )}
                      {b.pct >= 80 && b.pct < 100 && (
                        <Badge variant="outline" className="text-xs py-0 text-amber-700 border-amber-400">
                          {b.pct}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatNaira(b.spent)}</span>
                      <span className="text-sm text-muted-foreground"> / {formatNaira(b.monthly_limit)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${b.pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.pct >= 100
                      ? <span className="text-destructive">{formatNaira(b.spent - b.monthly_limit)} over budget</span>
                      : <>{formatNaira(b.monthly_limit - b.spent)} remaining</>
                    }
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <BudgetSetupForm
        userId={user!.id}
        existingBudgets={budgets ?? []}
        userCategories={userCategories ?? []}
        unbudgetedFixedCategories={unbudgetedFixed}
      />

      {budgetRows.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">No budget set yet</p>
            <p>Set spending limits below — expenses will track against them automatically.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
