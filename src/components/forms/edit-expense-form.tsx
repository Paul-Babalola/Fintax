"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { ExpenseCategory, DeductionType } from "@/types/database.types";

const FIXED_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "rent",          label: "Rent"          },
  { value: "food",          label: "Food"          },
  { value: "transport",     label: "Transport"     },
  { value: "utilities",     label: "Utilities"     },
  { value: "health",        label: "Health"        },
  { value: "education",     label: "Education"     },
  { value: "entertainment", label: "Entertainment" },
];

const DEDUCTION_OPTIONS: { value: DeductionType; label: string }[] = [
  { value: "rent_relief",    label: "Rent relief"            },
  { value: "pension",        label: "Pension contribution"   },
  { value: "nhf",            label: "NHF contribution"       },
  { value: "life_assurance", label: "Life assurance premium" },
];

const CATEGORY_DEDUCTION: Partial<Record<ExpenseCategory, DeductionType>> = {
  rent: "rent_relief",
};

interface ExpenseEntry {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  is_deductible: boolean;
  deduction_type: string | null;
  custom_category_id: string | null;
}

interface UserCategory {
  id: string;
  name: string;
}

export function EditExpenseForm({
  entry,
  userCategories,
}: {
  entry: ExpenseEntry;
  userCategories: UserCategory[];
}) {
  const router   = useRouter();
  const supabase = createClient();

  const [amount, setAmount]           = useState(entry.amount.toString());
  const [date, setDate]               = useState(entry.date);
  const [notes, setNotes]             = useState(entry.notes ?? "");
  const [isDeductible, setIsDeductible] = useState(entry.is_deductible);
  const [deductionType, setDeductionType] = useState<DeductionType | "">(
    (entry.deduction_type as DeductionType) ?? ""
  );

  // Category state — fixed or custom
  const [selectedFixed, setSelectedFixed] = useState<ExpenseCategory | null>(
    entry.custom_category_id ? null : (entry.category as ExpenseCategory)
  );
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(
    entry.custom_category_id
  );

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const amountNum      = parseFloat(amount.replace(/,/g, "")) || 0;
  const isCustomSelected = selectedCustomId !== null;

  function selectFixed(cat: ExpenseCategory) {
    setSelectedFixed(cat);
    setSelectedCustomId(null);
    const suggested = CATEGORY_DEDUCTION[cat];
    setIsDeductible(!!suggested);
    setDeductionType(suggested ?? "");
  }

  function selectCustom(id: string) {
    setSelectedCustomId(id);
    setSelectedFixed(null);
    setIsDeductible(false);
    setDeductionType("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (amountNum <= 0) { setError("Please enter a valid amount."); return; }
    if (!selectedFixed && !selectedCustomId) { setError("Please select a category."); return; }
    if (isDeductible && !deductionType) { setError("Please select a deduction type."); return; }

    setLoading(true);

    const { error: dbError } = await supabase
      .from("expenses")
      .update({
        amount:             amountNum,
        category:           selectedFixed ?? "other",
        date,
        notes:              notes.trim() || null,
        is_deductible:      isDeductible,
        deduction_type:     isDeductible && deductionType ? deductionType : null,
        custom_category_id: selectedCustomId,
      })
      .eq("id", entry.id);

    setLoading(false);

    if (dbError) { setError(dbError.message); return; }

    router.push("/expenses");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Category — fixed */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {FIXED_CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectFixed(value)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selectedFixed === value && !isCustomSelected
                      ? "bg-[#1A6B4A] text-white border-[#1A6B4A]"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom categories */}
            {userCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {userCategories.map((uc) => (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => selectCustom(uc.id)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      selectedCustomId === uc.id
                        ? "bg-[#1A6B4A] text-white border-[#1A6B4A]"
                        : "bg-background text-foreground border-border hover:border-foreground"
                    }`}
                  >
                    📦 {uc.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-amount">Amount (₦)</Label>
              <Input
                id="edit-amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">
              Notes{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="edit-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Deductible — only for fixed categories */}
          {!isCustomSelected && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDeductible}
                  onClick={() => { setIsDeductible(!isDeductible); if (isDeductible) setDeductionType(""); }}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                    isDeductible ? "bg-[#1A6B4A]" : "bg-muted"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    isDeductible ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
                <Label className="cursor-pointer" onClick={() => setIsDeductible(!isDeductible)}>
                  Tax-deductible
                </Label>
              </div>

              {isDeductible && (
                <div className="flex flex-wrap gap-2 pl-1">
                  {DEDUCTION_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDeductionType(value)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        deductionType === value
                          ? "bg-[#1A6B4A] text-white border-[#1A6B4A]"
                          : "bg-background text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
