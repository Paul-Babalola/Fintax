import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/tax-engine/nta2025";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseEntryForm } from "@/components/forms/expense-entry-form";
import { EntryActions } from "@/components/ui/entry-actions";

const FIXED_LABELS: Record<string, string> = {
  rent: "Rent", food: "Food", transport: "Transport",
  utilities: "Utilities", health: "Health", education: "Education",
  entertainment: "Entertainment", other: "Other",
};

const DEDUCTION_LABELS: Record<string, string> = {
  rent_relief: "Rent relief", pension: "Pension",
  nhf: "NHF", life_assurance: "Life assurance",
};

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("expenses")
    .select("*, user_categories(name)")
    .eq("user_id", user!.id)
    .order("date", { ascending: false })
    .limit(50);

  const { data: userCategories } = await supabase
    .from("user_categories")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  const total = (entries ?? []).reduce((s, e) => s + e.amount, 0);
  const totalDeductible = (entries ?? [])
    .filter((e) => e.is_deductible)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track spending and tag deductible expenses for your tax estimate.
        </p>
      </div>

      <div id="entry-form">
        <ExpenseEntryForm userId={user!.id} userCategories={userCategories ?? []} />
      </div>

      {(entries ?? []).length > 0 && (
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total logged</p>
            <p className="text-lg font-semibold">{formatNaira(total)}</p>
          </div>
          {totalDeductible > 0 && (
            <div>
              <p className="text-muted-foreground">Deductible</p>
              <p className="text-lg font-semibold text-[#1A6B4A]">
                {formatNaira(totalDeductible)}
              </p>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent entries</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {(entries ?? []).length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No expenses logged yet"
              description="Log your first expense. Tag it as deductible and it'll automatically reduce your estimated tax liability."
              action={{ label: "Add expense" }}
              secondary={{ label: "Scan a receipt instead", href: "#entry-form" }}
            />
          ) : (
            (entries ?? []).map((entry) => {
              const categoryLabel =
                entry.user_categories?.name ??
                FIXED_LABELS[entry.category] ??
                entry.category;

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {categoryLabel}
                      </Badge>
                      {entry.is_deductible && entry.deduction_type && (
                        <Badge
                          variant="outline"
                          className="text-xs text-[#1A6B4A] border-[#1A6B4A]/30 shrink-0"
                        >
                          {DEDUCTION_LABELS[entry.deduction_type]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.date).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                      {entry.notes && <> &middot; {entry.notes}</>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-medium">{formatNaira(entry.amount)}</p>
                    <EntryActions
                      id={entry.id}
                      table="expenses"
                      editHref={`/expenses/${entry.id}/edit`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
