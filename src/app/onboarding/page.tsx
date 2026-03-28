"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmploymentType = "employed" | "self_employed" | "both";

interface ProfileData {
  employment_type: EmploymentType;
  state_of_residence: string;
  annual_rent: string;
  monthly_pension_contribution: string;
  nhf_monthly_contribution: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const STEPS = [
  { id: 1, title: "Employment", description: "How do you earn your income?" },
  { id: 2, title: "Location", description: "Which state are you based in?" },
  { id: 3, title: "Deductions", description: "Help us find your tax reliefs" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    employment_type: "employed",
    state_of_residence: "Lagos",
    annual_rent: "",
    monthly_pension_contribution: "",
    nhf_monthly_contribution: "",
  });

  function update(field: keyof ProfileData, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function canProceed(): boolean {
    if (step === 1) return !!profile.employment_type;
    if (step === 2) return !!profile.state_of_residence;
    return true; // step 3 — all optional
  }

  async function handleFinish() {
    setSaving(true);
    setError(null);

    const toNumber = (v: string) => {
      const n = parseFloat(v.replace(/,/g, ""));
      return isNaN(n) || n <= 0 ? null : n;
    };

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: dbError } = await supabase
      .from("user_profiles")
      .update({
        employment_type: profile.employment_type,
        state_of_residence: profile.state_of_residence
          .toLowerCase()
          .replace(/\s+/g, "_"),
        annual_rent: toNumber(profile.annual_rent),
        monthly_pension_contribution: toNumber(
          profile.monthly_pension_contribution,
        ),
        nhf_monthly_contribution: toNumber(profile.nhf_monthly_contribution),
        onboarding_complete: true,
      })
      .eq("id", user.id);

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  const isLastStep = step === STEPS.length;

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-2xl font-semibold tracking-tight">
            Fin<span className="text-[#1A6B4A]">tax</span>
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            Let&apos;s personalise your tax estimate
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  s.id < step
                    ? "bg-[#1A6B4A] text-white"
                    : s.id === step
                      ? "bg-[#1A6B4A]/10 text-[#1A6B4A] border-2 border-[#1A6B4A]"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
              {s.id < STEPS.length && (
                <div
                  className={`w-12 h-0.5 ${s.id < step ? "bg-[#1A6B4A]" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step card */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ── Step 1: Employment type ── */}
            {step === 1 && (
              <div className="space-y-3">
                {(
                  ["employed", "self_employed", "both"] as EmploymentType[]
                ).map((type) => {
                  const labels = {
                    employed: {
                      title: "Employed",
                      sub: "I receive a salary from an employer",
                    },
                    self_employed: {
                      title: "Self-employed",
                      sub: "I earn from my own business or freelance work",
                    },
                    both: {
                      title: "Both",
                      sub: "I have a salary and additional self-employment income",
                    },
                  };
                  return (
                    <label
                      key={type}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        profile.employment_type === type
                          ? "border-[#1A6B4A] bg-[#1A6B4A]/5"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="employment_type"
                        value={type}
                        checked={profile.employment_type === type}
                        onChange={() => update("employment_type", type)}
                        className="mt-1 accent-[#1A6B4A]"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {labels[type].title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {labels[type].sub}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* ── Step 2: State of residence ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="state">State of residence</Label>
                  <select
                    id="state"
                    value={profile.state_of_residence}
                    onChange={(e) =>
                      update("state_of_residence", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6B4A]/30"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Used to route your tax estimate to the correct state revenue
                    authority (e.g. LIRS for Lagos, FIRS for FCT).
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: Deductions ── */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These are optional — skip any you&apos;re unsure about. You
                  can update them later in Settings. They unlock NTA 2025
                  deductions that directly reduce your estimated tax.
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="rent">Annual rent paid (₦)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                      ₦
                    </span>
                    <Input
                      id="rent"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 1,200,000"
                      value={profile.annual_rent}
                      onChange={(e) => update("annual_rent", e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unlocks rent relief: 20% of annual rent, max ₦500,000 (NTA
                    2025 s.30).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pension">
                    Monthly pension contribution (₦)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                      ₦
                    </span>
                    <Input
                      id="pension"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 40,000"
                      value={profile.monthly_pension_contribution}
                      onChange={(e) =>
                        update("monthly_pension_contribution", e.target.value)
                      }
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard rate is 8% of gross salary. Enter your actual
                    monthly amount.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nhf">Monthly NHF contribution (₦)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                      ₦
                    </span>
                    <Input
                      id="nhf"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 12,500"
                      value={profile.nhf_monthly_contribution}
                      onChange={(e) =>
                        update("nhf_monthly_contribution", e.target.value)
                      }
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    National Housing Fund — 2.5% of monthly basic salary. Leave
                    blank if you&apos;re not registered.
                  </p>
                </div>

                {/* Live deduction preview */}
                <DeductionPreview profile={profile} />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={saving}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving || !canProceed()}
                  className="bg-[#1A6B4A] hover:bg-[#145a3d]"
                >
                  {saving ? "Saving…" : "Go to dashboard"}
                  {!saving && <CheckCircle2 className="h-4 w-4 ml-2" />}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="bg-[#1A6B4A] hover:bg-[#145a3d]"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip link */}
        {step === 3 && (
          <p className="text-center text-xs text-muted-foreground">
            <button
              onClick={handleFinish}
              disabled={saving}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Skip for now — I&apos;ll add these in Settings
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Deduction preview ─────────────────────────────────────────────────────────

function DeductionPreview({ profile }: { profile: ProfileData }) {
  const toNum = (v: string) => {
    const n = parseFloat(v.replace(/,/g, ""));
    return isNaN(n) || n <= 0 ? 0 : n;
  };

  const annualRent = toNum(profile.annual_rent);
  const monthlyPension = toNum(profile.monthly_pension_contribution);
  const monthlyNHF = toNum(profile.nhf_monthly_contribution);

  const rentRelief = annualRent > 0 ? Math.min(annualRent * 0.2, 500_000) : 0;
  const pensionAnnual = monthlyPension * 12;
  const nhfAnnual = monthlyNHF * 12;
  const total = rentRelief + pensionAnnual + nhfAnnual;

  if (total === 0) return null;

  const fmt = (n: number) =>
    `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="rounded-lg border border-[#1A6B4A]/20 bg-[#1A6B4A]/5 p-4 space-y-2">
      <p className="text-xs font-medium text-[#1A6B4A]">
        Annual deductions unlocked
      </p>
      {rentRelief > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Rent relief</span>
          <span className="font-medium">{fmt(rentRelief)}</span>
        </div>
      )}
      {pensionAnnual > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Pension (annual)</span>
          <span className="font-medium">{fmt(pensionAnnual)}</span>
        </div>
      )}
      {nhfAnnual > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">NHF (annual)</span>
          <span className="font-medium">{fmt(nhfAnnual)}</span>
        </div>
      )}
      <div className="flex justify-between text-xs font-semibold border-t border-[#1A6B4A]/20 pt-2">
        <span>Total deductions</span>
        <span className="text-[#1A6B4A]">{fmt(total)}</span>
      </div>
    </div>
  );
}
