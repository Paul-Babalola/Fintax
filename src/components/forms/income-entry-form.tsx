"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RELIEF } from "@/lib/tax-engine/nta2025";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SOURCES = [
  { value: "salary",     label: "Salary"     },
  { value: "freelance",  label: "Freelance"  },
  { value: "investment", label: "Investment" },
  { value: "rental",     label: "Rental"     },
  { value: "other",      label: "Other"      },
] as const;

type Source = typeof SOURCES[number]["value"];

const WHT_SOURCES: Set<Source> = new Set(["investment", "rental"]);

export function IncomeEntryForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<Source>("salary");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const hasWHT = WHT_SOURCES.has(source);
  const whtAmount = hasWHT ? Math.round(amountNum * RELIEF.WHT_INVESTMENT_INCOME) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (amountNum <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const { error: dbError } = await supabase.from("income_entries").insert({
      user_id:    userId,
      amount:     amountNum,
      source,
      date,
      notes:      notes.trim() || null,
      wht_rate:   hasWHT ? RELIEF.WHT_INVESTMENT_INCOME : null,
      wht_amount: hasWHT ? whtAmount : null,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // Reset form
    setAmount("");
    setNotes("");
    setLoading(false);

    // Re-fetch server data
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add income entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source selector */}
          <div className="space-y-1.5">
            <Label>Source</Label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSource(value)}
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
                placeholder="e.g. 500,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {/* WHT auto-tag */}
              {hasWHT && amountNum > 0 && (
                <p className="text-xs text-amber-700">
                  10% WHT auto-applied: ₦{whtAmount.toLocaleString("en-NG")}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Date received</Label>
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
              placeholder="e.g. January salary, Upwork payment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#1A6B4A] hover:bg-[#145a3d]"
            disabled={loading}
          >
            {loading ? "Saving…" : "Add entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
