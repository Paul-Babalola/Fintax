"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { ExpenseCategory } from "@/types/database.types";

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

interface ExistingBudget {
  id: string;
  category: string;
  monthly_limit: number;
  custom_label: string | null;
  custom_category_id: string | null;
  user_categories?: { name: string } | null;
}

interface UserCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface Props {
  userId: string;
  existingBudgets: ExistingBudget[];
  userCategories: UserCategory[];
  unbudgetedFixedCategories: string[];
}

export function BudgetSetupForm({
  userId,
  existingBudgets,
  userCategories,
  unbudgetedFixedCategories,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    existingBudgets.forEach((b) => { init[b.id] = b.monthly_limit.toString(); });
    return init;
  });

  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function clearSaved(key: string) {
    setSavedIds((prev) => { const n = new Set(prev); n.delete(key); return n; });
  }

  // ── Save a fixed category budget ─────────────────────────────────────────
  // Uses manual check-then-insert-or-update instead of upsert
  // because partial unique indexes don't support ON CONFLICT in Supabase.

  async function handleSaveFixed(category: string, existingId?: string) {
    setError(null);
    const key = existingId ?? category;
    const amount = parseFloat((limits[key] ?? "").replace(/,/g, ""));

    if (!amount || amount <= 0) {
      setError(`Enter a valid amount for ${FIXED_CATEGORY_LABELS[category]}.`);
      return;
    }

    setSaving(true);

    if (existingId) {
      // Update existing row
      const { error: dbError } = await supabase
        .from("budgets")
        .update({ monthly_limit: amount })
        .eq("id", existingId);

      setSaving(false);
      if (dbError) { setError(dbError.message); return; }
    } else {
      // Insert new row — no conflict possible since we only show unbudgeted categories
      const { error: dbError } = await supabase.from("budgets").insert({
        user_id:            userId,
        category:           category as ExpenseCategory,
        monthly_limit:      amount,
        custom_category_id: null,
        custom_label:       null,
      });

      setSaving(false);
      if (dbError) { setError(dbError.message); return; }
    }

    setSavedIds((prev) => new Set(prev).add(key));
    router.refresh();
  }

  // ── Save a custom category budget (existing) ──────────────────────────────

  async function handleSaveCustom(budgetId: string) {
    setError(null);
    const amount = parseFloat((limits[budgetId] ?? "").replace(/,/g, ""));

    if (!amount || amount <= 0) { setError("Enter a valid amount."); return; }

    setSaving(true);
    const { error: dbError } = await supabase
      .from("budgets")
      .update({ monthly_limit: amount })
      .eq("id", budgetId);

    setSaving(false);
    if (dbError) { setError(dbError.message); return; }
    setSavedIds((prev) => new Set(prev).add(budgetId));
    router.refresh();
  }

  // ── Add new custom category + budget ─────────────────────────────────────

  async function handleAddCustomCategory() {
    setError(null);
    const name = newCatName.trim();
    const amount = parseFloat(newCatLimit.replace(/,/g, ""));

    if (!name) { setError("Give this category a name."); return; }
    if (!amount || amount <= 0) { setError("Enter a valid monthly limit."); return; }

    setSaving(true);

    const { data: newCat, error: catError } = await supabase
      .from("user_categories")
      .insert({ user_id: userId, name })
      .select("id")
      .single();

    if (catError || !newCat) {
      setError(catError?.message ?? "Failed to create category.");
      setSaving(false);
      return;
    }

    const { error: budgetError } = await supabase.from("budgets").insert({
      user_id:            userId,
      category:           "other" as ExpenseCategory,
      monthly_limit:      amount,
      custom_category_id: newCat.id,
      custom_label:       null,
    });

    setSaving(false);

    if (budgetError) {
      await supabase.from("user_categories").delete().eq("id", newCat.id);
      setError(budgetError.message);
      return;
    }

    setNewCatName("");
    setNewCatLimit("");
    setAddingCustom(false);
    router.refresh();
  }

  // ── Delete budget ─────────────────────────────────────────────────────────

  async function handleDelete(budgetId: string, customCategoryId: string | null) {
    setSaving(true);
    const { error: dbError } = await supabase
      .from("budgets").delete().eq("id", budgetId);

    if (!dbError && customCategoryId) {
      await supabase.from("user_categories").delete().eq("id", customCategoryId);
    }

    setSaving(false);
    if (dbError) { setError(dbError.message); return; }
    router.refresh();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const fixedBudgets  = existingBudgets.filter((b) => !b.custom_category_id);
  const customBudgets = existingBudgets.filter((b) =>  b.custom_category_id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Set monthly limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Existing fixed budgets */}
        {fixedBudgets.map((b) => (
          <BudgetRow
            key={b.id}
            icon={CATEGORY_ICONS[b.category] ?? "📦"}
            label={FIXED_CATEGORY_LABELS[b.category] ?? b.category}
            value={limits[b.id] ?? ""}
            isSaved={savedIds.has(b.id)}
            saving={saving}
            onLimitChange={(v) => { setLimits((p) => ({ ...p, [b.id]: v })); clearSaved(b.id); }}
            onSave={() => handleSaveFixed(b.category, b.id)}
            onDelete={() => handleDelete(b.id, null)}
            isExisting
          />
        ))}

        {/* Unbudgeted fixed categories */}
        {unbudgetedFixedCategories.map((cat) => (
          <BudgetRow
            key={cat}
            icon={CATEGORY_ICONS[cat] ?? "📦"}
            label={FIXED_CATEGORY_LABELS[cat] ?? cat}
            value={limits[cat] ?? ""}
            isSaved={savedIds.has(cat)}
            saving={saving}
            onLimitChange={(v) => { setLimits((p) => ({ ...p, [cat]: v })); clearSaved(cat); }}
            onSave={() => handleSaveFixed(cat)}
            isExisting={false}
          />
        ))}

        {/* Custom category budgets */}
        {customBudgets.length > 0 && (
          <div className="pt-2 border-t space-y-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Custom categories
            </p>
            {customBudgets.map((b) => (
              <BudgetRow
                key={b.id}
                icon="📦"
                label={b.user_categories?.name ?? "Custom"}
                value={limits[b.id] ?? ""}
                isSaved={savedIds.has(b.id)}
                saving={saving}
                onLimitChange={(v) => { setLimits((p) => ({ ...p, [b.id]: v })); clearSaved(b.id); }}
                onSave={() => handleSaveCustom(b.id)}
                onDelete={() => handleDelete(b.id, b.custom_category_id)}
                isExisting
              />
            ))}
          </div>
        )}

        {/* Add custom category */}
        <div className="pt-2 border-t">
          {!addingCustom ? (
            <button
              type="button"
              onClick={() => setAddingCustom(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add custom category
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">New category</p>
              <Input
                type="text"
                placeholder="Category name (e.g. Clothing)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                maxLength={30}
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₦</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Monthly limit"
                    value={newCatLimit}
                    onChange={(e) => setNewCatLimit(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomCategory}
                  disabled={saving || !newCatName.trim() || !newCatLimit}
                  className="bg-[#1A6B4A] hover:bg-[#145a3d] shrink-0"
                >
                  Add
                </Button>
                <button
                  type="button"
                  onClick={() => { setAddingCustom(false); setNewCatName(""); setNewCatLimit(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground">
          Limits are per month. Expenses only match to a category if they were
          tagged with it at entry — custom categories never auto-fill.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Reusable budget row ───────────────────────────────────────────────────────

function BudgetRow({
  icon, label, value, isSaved, saving,
  onLimitChange, onSave, onDelete, isExisting,
}: {
  icon: string;
  label: string;
  value: string;
  isSaved: boolean;
  saving: boolean;
  onLimitChange: (v: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  isExisting: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-36 shrink-0">
        <span className="text-base shrink-0" aria-hidden>{icon}</span>
        <Label className="text-sm truncate">{label}</Label>
      </div>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₦</span>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={value}
          onChange={(e) => onLimitChange(e.target.value)}
          className="pl-7"
        />
      </div>
      <Button
        type="button"
        variant={isSaved ? "outline" : "default"}
        size="sm"
        disabled={saving || !value || isSaved}
        onClick={onSave}
        className={isSaved
          ? "text-[#1A6B4A] border-[#1A6B4A]/40 min-w-[64px]"
          : "bg-[#1A6B4A] hover:bg-[#145a3d] min-w-[64px]"
        }
      >
        {isSaved ? "Saved" : isExisting ? "Update" : "Set"}
      </Button>
      {isExisting && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={saving}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
          title="Remove budget"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
