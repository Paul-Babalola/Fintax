"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RELIEF } from "@/lib/tax-engine/nta2025";

interface IncomeEntry {
  id: string;
  amount: number;
  source: string;
  notes: string | null;
  wht_rate: number | null;
}

export function LogAgainButton({
  entry,
  userId,
}: {
  entry: IncomeEntry;
  userId: string;
}) {
  const router   = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  async function handleLogAgain() {
    setLoading(true);

    const today   = new Date().toISOString().split("T")[0];
    const hasWHT  = ["investment", "rental"].includes(entry.source);

    const { error } = await supabase.from("income_entries").insert({
      user_id:      userId,
      amount:       entry.amount,
      source:       entry.source,
      date:         today,
      notes:        entry.notes,
      wht_rate:     hasWHT ? RELIEF.WHT_INVESTMENT_INCOME : null,
      wht_amount:   hasWHT ? Math.round(entry.amount * RELIEF.WHT_INVESTMENT_INCOME) : null,
      is_recurring: true,
    });

    setLoading(false);

    if (!error) {
      setDone(true);
      setTimeout(() => setDone(false), 3000);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleLogAgain}
      disabled={loading || done}
      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
        done
          ? "bg-[#1A6B4A]/10 text-[#1A6B4A]"
          : "bg-[#1A6B4A] text-white hover:bg-[#145a3d]"
      }`}
    >
      {loading ? "Logging…" : done ? "✓ Logged" : "Log again"}
    </button>
  );
}
