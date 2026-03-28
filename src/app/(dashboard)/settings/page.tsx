"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

type EmploymentType = "employed" | "self_employed" | "both";

export default function SettingsPage() {
  const supabase = createClient();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [employmentType, setEmploymentType]   = useState<EmploymentType>("employed");
  const [state, setState]                     = useState("Lagos");
  const [annualRent, setAnnualRent]           = useState("");
  const [pension, setPension]                 = useState("");
  const [nhf, setNhf]                         = useState("");

  // Load existing profile
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setEmploymentType(data.employment_type ?? "employed");
        // Reverse the slug back to a display name
        const displayState = NIGERIAN_STATES.find(
          (s) => s.toLowerCase().replace(/\s+/g, "_") ===
                 (data.state_of_residence ?? "lagos")
        ) ?? "Lagos";
        setState(displayState);
        setAnnualRent(data.annual_rent?.toString() ?? "");
        setPension(data.monthly_pension_contribution?.toString() ?? "");
        setNhf(data.nhf_monthly_contribution?.toString() ?? "");
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const toNumber = (v: string) => {
      const n = parseFloat(v.replace(/,/g, ""));
      return isNaN(n) || n <= 0 ? null : n;
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: dbError } = await supabase
      .from("user_profiles")
      .update({
        employment_type:              employmentType,
        state_of_residence:           state.toLowerCase().replace(/\s+/g, "_"),
        annual_rent:                  toNumber(annualRent),
        monthly_pension_contribution: toNumber(pension),
        nhf_monthly_contribution:     toNumber(nhf),
      })
      .eq("id", user.id);

    setSaving(false);

    if (dbError) { setError(dbError.message); return; }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your profile details power the NTA 2025 tax estimate.
        </p>
      </div>

      {/* Employment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Employment type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(["employed", "self_employed", "both"] as EmploymentType[]).map((type) => {
            const labels = {
              employed:      "Employed (salary)",
              self_employed: "Self-employed / freelance",
              both:          "Both",
            };
            return (
              <label
                key={type}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  employmentType === type
                    ? "border-[#1A6B4A] bg-[#1A6B4A]/5"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="employment_type"
                  value={type}
                  checked={employmentType === type}
                  onChange={() => setEmploymentType(type)}
                  className="accent-[#1A6B4A]"
                />
                <span className="text-sm font-medium">{labels[type]}</span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">State of residence</CardTitle>
          <CardDescription>
            Determines which revenue authority (e.g. LIRS for Lagos) handles your PIT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6B4A]/30"
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tax deductions</CardTitle>
          <CardDescription>
            These reduce your taxable income under NTA 2025. All fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s-rent">Annual rent paid (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₦</span>
              <Input
                id="s-rent"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 1,200,000"
                value={annualRent}
                onChange={(e) => setAnnualRent(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Rent relief: 20% of annual rent, capped at ₦500,000.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-pension">Monthly pension contribution (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₦</span>
              <Input
                id="s-pension"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 40,000"
                value={pension}
                onChange={(e) => setPension(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Standard is 8% of gross monthly salary.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-nhf">Monthly NHF contribution (₦)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">₦</span>
              <Input
                id="s-nhf"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 12,500"
                value={nhf}
                onChange={(e) => setNhf(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              National Housing Fund — 2.5% of monthly basic salary. Leave blank if not applicable.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#1A6B4A] hover:bg-[#145a3d] w-full sm:w-auto"
      >
        {saving ? "Saving…" : saved ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        ) : "Save changes"}
      </Button>
    </div>
  );
}
