import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/tax-engine/nta2025";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IncomeEntryForm } from "@/components/forms/income-entry-form";
import { EntryActions } from "@/components/ui/entry-actions";
import { LogAgainButton } from "@/components/ui/log-again-button";
import { RefreshCw } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  salary:     "Salary",
  freelance:  "Freelance",
  investment: "Investment",
  rental:     "Rental",
  other:      "Other",
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
  const recurring = (entries ?? []).filter((e) => e.is_recurring);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Income</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Log your salary, freelance, investment, and rental income.
        </p>
      </div>

      {/* Recurring quick-log */}
      {recurring.length > 0 && (
        <Card className="border-[#1A6B4A]/20 bg-[#1A6B4A]/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-[#1A6B4A]" />
              <p className="text-sm font-medium text-[#1A6B4A]">Recurring income</p>
            </div>
            <div className="space-y-2">
              {recurring.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {SOURCE_LABELS[entry.source] ?? entry.source}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatNaira(entry.amount)}
                    </span>
                    {entry.notes && (
                      <span className="text-xs text-muted-foreground">· {entry.notes}</span>
                    )}
                  </div>
                  <LogAgainButton entry={entry} userId={user!.id} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entry form */}
      <div id="entry-form">
        <IncomeEntryForm userId={user!.id} />
      </div>

      {/* Summary */}
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

      {/* Entry list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent entries</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {(entries ?? []).length === 0 ? (
            <EmptyState
              icon="💰"
              title="No income logged yet"
              description="Add your first income entry — salary, freelance, investment, or rental. Your tax estimate will update automatically."
              action={{ label: "Add income entry" }}
            />
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
                      <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 shrink-0">
                        10% WHT
                      </Badge>
                    )}
                    {entry.is_recurring && (
                      <RefreshCw className="h-3 w-3 text-[#1A6B4A] shrink-0" />
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
