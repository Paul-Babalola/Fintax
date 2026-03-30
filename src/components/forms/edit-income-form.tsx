"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RELIEF } from "@/lib/tax-engine/nta2025";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const SOURCES = [
  { value: "salary",     label: "Salary"     },
  { value: "freelance",  label: "Freelance"  },
  { value: "investment", label: "Investment" },
  { value: "rental",     label: "Rental"     },
  { value: "other",      label: "Other"      },
] as const;

type Source = typeof SOURCES[number]["value"];
const WHT_SOURCES = new Set<Source>(["investment", "rental"]);

interface IncomeEntry {
  id: string;
  amount: number;
  source: string;
  date: string;
  notes: string | null;
  wht_rate: number | null;
  wht_amount: number | null;
}

export function EditIncomeForm({ entry }: { entry: IncomeEntry }) {
  const router  = useRouter();
  const supabase = createClient();

  const [amount, setAmount]   = useState(entry.amount.toString());
  const [source, setSource]   = useState<Source>(entry.source as Source);
  const [date, setDate]       = useState(entry.date);
  const [notes, setNotes]     = useState(entry.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const hasWHT    = WHT_SOURCES.has(source);
  const whtAmount = hasWHT ? Math.round(amountNum * RELIEF.WHT_INVESTMENT_INCOME) : 0;

  function handleSourceChange(s: Source) {
    setSource(s);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const { error: dbError } = await supabase
      .from("income_entries")
      .update({
        amount:     amountNum,
        source,
        date,
        notes:      notes.trim() || null,
        wht_rate:   hasWHT ? RELIEF.WHT_INVESTMENT_INCOME : null,
        wht_amount: hasWHT ? whtAmount : null,
      })
      .eq("id", entry.id);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/income");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source */}
          <div className="space-y-1.5">
            <Label>Source</Label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSourceChange(value)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    source === value
                      ? "bg-[#1A6B4A] text-white border-[#1A6B4A]"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {hasWHT && amountNum > 0 && (
                <p className="text-xs text-amber-700">
                  WHT: ₦{whtAmount.toLocaleString("en-NG")}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notes{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-[#1A6B4A] hover:bg-[#145a3d]"
              disabled={loading}
            >
              {loading ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
