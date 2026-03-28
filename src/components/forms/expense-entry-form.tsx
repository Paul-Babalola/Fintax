"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2, SplitSquareHorizontal, Plus } from "lucide-react";
import type { ExpenseCategory, DeductionType } from "@/types/database.types";
import type { ScannedReceipt } from "@/app/api/expenses/scan/route";

// ─── Constants ───────────────────────────────────────────────────────────────

const FIXED_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  icon: string;
}[] = [
  { value: "rent", label: "Rent", icon: "🏠" },
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "pos", label: "POS" },
  { value: "mobile_money", label: "Mobile money" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
];

const CATEGORY_DEDUCTION: Partial<Record<ExpenseCategory, DeductionType>> = {
  rent: "rent_relief",
};

const DEDUCTION_OPTIONS: {
  value: DeductionType;
  label: string;
  hint: string;
}[] = [
  {
    value: "rent_relief",
    label: "Rent relief",
    hint: "20% of annual rent, max ₦500k (NTA 2025 s.30)",
  },
  {
    value: "pension",
    label: "Pension contribution",
    hint: "8% of gross salary (PRA 2014)",
  },
  {
    value: "nhf",
    label: "NHF contribution",
    hint: "2.5% of monthly basic salary",
  },
  {
    value: "life_assurance",
    label: "Life assurance premium",
    hint: "Up to 20% of gross income",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface LineItemRow {
  name: string;
  amount: number;
  is_vat?: boolean;
  selected: boolean;
  // null = use fixed category, string = custom category id
  category_override: ExpenseCategory;
  custom_category_id: string | null;
}

type Mode = "manual" | "scanned";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function toFixedCategory(raw: string): ExpenseCategory {
  const valid: ExpenseCategory[] = [
    "rent",
    "food",
    "transport",
    "utilities",
    "health",
    "education",
    "entertainment",
    "other",
  ];
  return valid.includes(raw as ExpenseCategory)
    ? (raw as ExpenseCategory)
    : "other";
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ExpenseEntryForm({
  userId,
  userCategories,
}: {
  userId: string;
  userCategories: UserCategory[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [mode, setMode] = useState<Mode>("manual");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedReceipt, setScannedReceipt] = useState<ScannedReceipt | null>(
    null,
  );
  const [lineItems, setLineItems] = useState<LineItemRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected category — either a fixed ExpenseCategory or a custom category id
  const [selectedFixed, setSelectedFixed] = useState<ExpenseCategory | null>(
    "food",
  );
  const [selectedCustomId, setSelectedCustomId] = useState<string | null>(null);

  // Manual form state
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isDeductible, setIsDeductible] = useState(false);
  const [deductionType, setDeductionType] = useState<DeductionType | "">("");

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const isCustomSelected = selectedCustomId !== null;

  // ── Category selection ────────────────────────────────────────────────────

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

  // ── Receipt scan ──────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedReceipt(null);
    setLineItems([]);
    setScanError(null);
    setScanning(true);
    setMode("scanned");

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch("/api/expenses/scan", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setScanError(data.error ?? "Scan failed. Enter details manually.");
        setMode("manual");
        setScanning(false);
        return;
      }

      const receipt: ScannedReceipt = data.receipt;
      setScannedReceipt(receipt);
      if (receipt.date) setDate(receipt.date);
      if (receipt.merchant_name) setMerchantName(receipt.merchant_name);
      if (receipt.payment_method) setPaymentMethod(receipt.payment_method);

      setLineItems(
        receipt.line_items.map((item) => ({
          name: item.name,
          amount: item.amount,
          is_vat: item.is_vat,
          selected: !item.is_vat,
          category_override: toFixedCategory(item.suggested_category),
          custom_category_id: null,
        })),
      );
    } catch {
      setScanError("Scan failed — please enter details manually.");
      setMode("manual");
    } finally {
      setScanning(false);
    }
  }

  function clearReceipt() {
    setScannedReceipt(null);
    setLineItems([]);
    setScanError(null);
    setMode("manual");
    setMerchantName("");
    setPaymentMethod("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function toggleLineItem(i: number) {
    setLineItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, selected: !item.selected } : item,
      ),
    );
  }

  function updateLineItemFixed(i: number, cat: ExpenseCategory) {
    setLineItems((prev) =>
      prev.map((item, idx) =>
        idx === i
          ? { ...item, category_override: cat, custom_category_id: null }
          : item,
      ),
    );
  }

  function updateLineItemCustom(i: number, customId: string) {
    setLineItems((prev) =>
      prev.map((item, idx) =>
        idx === i
          ? {
              ...item,
              category_override: "other",
              custom_category_id: customId,
            }
          : item,
      ),
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (mode === "scanned" && lineItems.length > 0) {
        const selected = lineItems.filter((i) => i.selected);
        if (selected.length === 0) {
          setError("Select at least one line item to save.");
          setSaving(false);
          return;
        }

        const rows = selected.map((item) => ({
          user_id: userId,
          amount: item.amount,
          category: item.category_override,
          date,
          notes: item.name,
          is_deductible:
            !item.custom_category_id &&
            CATEGORY_DEDUCTION[item.category_override] !== undefined,
          deduction_type: !item.custom_category_id
            ? (CATEGORY_DEDUCTION[item.category_override] ?? null)
            : null,
          custom_category_id: item.custom_category_id,
        }));

        const { error: dbError } = await supabase.from("expenses").insert(rows);
        if (dbError) throw new Error(dbError.message);
      } else {
        // Manual entry
        if (amountNum <= 0) {
          setError("Please enter a valid amount.");
          setSaving(false);
          return;
        }
        if (!selectedFixed && !selectedCustomId) {
          setError("Please select a category.");
          setSaving(false);
          return;
        }
        if (isDeductible && !deductionType) {
          setError("Please select a deduction type.");
          setSaving(false);
          return;
        }

        const { error: dbError } = await supabase.from("expenses").insert({
          user_id: userId,
          amount: amountNum,
          category: selectedFixed ?? "other",
          date,
          notes: notes.trim() || null,
          is_deductible: isDeductible,
          deduction_type: isDeductible && deductionType ? deductionType : null,
          custom_category_id: selectedCustomId,
        });
        if (dbError) throw new Error(dbError.message);
      }

      setAmount("");
      setNotes("");
      setMerchantName("");
      setPaymentMethod("");
      clearReceipt();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const selectedTotal = lineItems
    .filter((i) => i.selected)
    .reduce((s, i) => s + i.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Add expense</CardTitle>
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Upload className="h-4 w-4" />
            Scan receipt
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {scanning && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Reading your receipt…
            </div>
          )}

          {scanError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
              {scanError}
            </div>
          )}

          {/* Scanned receipt view */}
          {mode === "scanned" && scannedReceipt && !scanning && (
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border">
                <div>
                  <p className="font-medium text-sm">
                    {scannedReceipt.merchant_name ?? "Receipt"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {scannedReceipt.date ?? date}
                    {scannedReceipt.payment_method && (
                      <>
                        {" "}
                        &middot;{" "}
                        {scannedReceipt.payment_method.replace("_", " ")}
                      </>
                    )}
                    {scannedReceipt.vat_amount && (
                      <>
                        {" "}
                        &middot; VAT: {formatNaira(scannedReceipt.vat_amount)}
                      </>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearReceipt}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <SplitSquareHorizontal className="h-3.5 w-3.5" />
                  Select items and assign categories
                </div>
                {lineItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                      item.selected
                        ? "border-[#1A6B4A]/30 bg-[#1A6B4A]/5"
                        : "border-border opacity-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleLineItem(i)}
                      className="accent-[#1A6B4A] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {item.name}
                        {item.is_vat && (
                          <Badge
                            variant="outline"
                            className="ml-1.5 text-xs py-0"
                          >
                            VAT
                          </Badge>
                        )}
                      </p>
                      {item.selected && (
                        <select
                          value={
                            item.custom_category_id
                              ? `custom:${item.custom_category_id}`
                              : item.category_override
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v.startsWith("custom:")) {
                              updateLineItemCustom(i, v.replace("custom:", ""));
                            } else {
                              updateLineItemFixed(i, v as ExpenseCategory);
                            }
                          }}
                          className="mt-1 text-xs text-muted-foreground bg-transparent border-none outline-none cursor-pointer"
                        >
                          <optgroup label="Standard">
                            {FIXED_CATEGORIES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </optgroup>
                          {userCategories.length > 0 && (
                            <optgroup label="Custom">
                              {userCategories.map((uc) => (
                                <option key={uc.id} value={`custom:${uc.id}`}>
                                  {uc.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      )}
                    </div>
                    <p className="text-sm font-medium shrink-0">
                      {formatNaira(item.amount)}
                    </p>
                  </div>
                ))}
              </div>

              {selectedTotal > 0 && (
                <div className="flex justify-between text-sm font-medium pt-1">
                  <span className="text-muted-foreground">
                    {lineItems.filter((i) => i.selected).length} items selected
                  </span>
                  <span>{formatNaira(selectedTotal)}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="scan-date">Date</Label>
                <Input
                  id="scan-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Manual entry */}
          {mode === "manual" && !scanning && (
            <>
              {/* Category picker — fixed */}
              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                  {FIXED_CATEGORIES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectFixed(value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        selectedFixed === value && !isCustomSelected
                          ? "bg-[#1A6B4A] text-white border-[#1A6B4A]"
                          : "bg-background text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      <span>{icon}</span>
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          selectedCustomId === uc.id
                            ? "bg-[#1A6B4A] text-white border-[#1A6B4A]"
                            : "bg-background text-foreground border-border hover:border-foreground"
                        }`}
                      >
                        <span>📦</span>
                        {uc.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Inline new category creator — always visible */}
                <InlineCategoryCreator
                  userId={userId}
                  onCreated={(id) => {
                    selectCustom(id);
                    router.refresh();
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="exp-amount">Amount (₦)</Label>
                  <Input
                    id="exp-amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 150,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exp-date">Date</Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="merchant">
                  Merchant / vendor{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="merchant"
                  type="text"
                  placeholder="e.g. Shoprite, Total Energies"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(paymentMethod === value ? "" : value)
                      }
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        paymentMethod === value
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exp-notes">
                  Notes{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="exp-notes"
                  type="text"
                  placeholder="e.g. January electricity bill"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={200}
                />
              </div>

              {/* Deductible toggle — only for fixed categories */}
              {!isCustomSelected && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isDeductible}
                      onClick={() => {
                        setIsDeductible(!isDeductible);
                        if (isDeductible) setDeductionType("");
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                        isDeductible ? "bg-[#1A6B4A]" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          isDeductible ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <Label
                      className="cursor-pointer"
                      onClick={() => setIsDeductible(!isDeductible)}
                    >
                      Mark as tax-deductible
                    </Label>
                  </div>

                  {isDeductible && (
                    <div className="space-y-2 pl-1">
                      {DEDUCTION_OPTIONS.map(({ value, label, hint }) => (
                        <label
                          key={value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            deductionType === value
                              ? "border-[#1A6B4A] bg-[#1A6B4A]/5"
                              : "border-border hover:border-foreground/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deduction_type"
                            value={value}
                            checked={deductionType === value}
                            onChange={() => setDeductionType(value)}
                            className="mt-0.5 accent-[#1A6B4A]"
                          />
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                              {hint}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!scanning && (
            <Button
              type="submit"
              className="w-full bg-[#1A6B4A] hover:bg-[#145a3d]"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : mode === "scanned"
                  ? `Save ${lineItems.filter((i) => i.selected).length} items`
                  : "Add entry"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ── Inline category creator ───────────────────────────────────────────────────
// Lets users create a new custom category directly from the expense form
// without having to navigate to Budget first.

function InlineCategoryCreator({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: (id: string) => void;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a category name.");
      return;
    }

    setSaving(true);
    const { data, error: dbError } = await supabase
      .from("user_categories")
      .insert({ user_id: userId, name: trimmed })
      .select("id")
      .single();
    setSaving(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? `"${trimmed}" already exists.`
          : dbError.message,
      );
      return;
    }

    onCreated(data.id);
    setName("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
      >
        <Plus className="h-3.5 w-3.5" />
        New category
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 pt-1">
      <Input
        type="text"
        placeholder="Category name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCreate();
          }
        }}
        maxLength={30}
        autoFocus
        className="h-8 text-sm flex-1"
      />
      <Button
        type="button"
        size="sm"
        onClick={handleCreate}
        disabled={saving || !name.trim()}
        className="h-8 bg-[#1A6B4A] hover:bg-[#145a3d] shrink-0"
      >
        {saving ? "…" : "Add"}
      </Button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setName("");
          setError(null);
        }}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
