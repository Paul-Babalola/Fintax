import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/tax-engine/nta2025";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IncomeEntryForm } from "@/components/forms/income-entry-form";
import { EntryActions } from "@/components/ui/entry-actions";

const SOURCE_LABELS: Record<string, string> = {
  salary: "Salary", freelance: "Freelance", investment: "Investment",
  rental: "Rental", other: "Other",
};

const WHT_SOURCES = new Set(["investment", "rental"]);

export default async function IncomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("date", { ascending: false })
    .limit(50);

  const total    = (entries ?? []).reduce((s, e) => s + e.amount, 0);
  const totalWHT = (entries ?? []).reduce((s, e) => s + (e.wht_amount ?? 0), 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Income</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Log your salary, freelance, investment, and rental income.
        </p>
      </div>

      <IncomeEntryForm userId={user!.id} />

      {(entries ?? []).length > 0 && (
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total logged</p>
            <p className="text-lg font-semibold">{formatNaira(total)}</p>
          </div>
          {totalWHT > 0 && (
            <div>
              <p className="text-muted-foreground">WHT withheld</p>
              <p className="text-lg font-semibold text-amber-600">
                {formatNaira(totalWHT)}
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
            <p className="text-sm text-muted-foreground py-4 text-center">
              No income logged yet. Add your first entry above.
            </p>
          ) : (
            (entries ?? []).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize shrink-0">
                      {SOURCE_LABELS[entry.source] ?? entry.source}
                    </Badge>
                    {WHT_SOURCES.has(entry.source) && (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-700 border-amber-300 shrink-0"
                      >
                        10% WHT
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
                  <div className="text-right">
                    <p className="font-medium">{formatNaira(entry.amount)}</p>
                    {entry.wht_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        WHT: {formatNaira(entry.wht_amount)}
                      </p>
                    )}
                  </div>
                  <EntryActions
                    id={entry.id}
                    table="income_entries"
                    editHref={`/income/${entry.id}/edit`}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
