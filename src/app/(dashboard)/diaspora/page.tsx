"use client";

import { useState, useEffect } from "react";
import { DiasporaProfileForm } from "@/components/diaspora/diaspora-profile-form";
import { ForeignIncomeForm } from "@/components/diaspora/foreign-income-form";
import { DiasporaTaxCalculationDisplay } from "@/components/diaspora/diaspora-tax-calculation";
import { calculateDiasporaTax } from "@/lib/tax-engine/diaspora";
import { Badge } from "@/components/ui/badge";
import { Plane, Globe2 } from "lucide-react";

interface NigerianIncome {
  amount: number;
  source: string;
}

export default function DiasporaPage() {
  const [diasporaProfile, setDiasporaProfile] = useState<any>(null);
  const [foreignIncomes, setForeignIncomes] = useState<any[]>([]);
  const [nigerianIncomes, setNigerianIncomes] = useState<NigerianIncome[]>([]);
  const [calculation, setCalculation] = useState<any>(null);

  // Simulate fetching Nigerian income data
  useEffect(() => {
    // In a real app, this would fetch from your API
    setNigerianIncomes([
      { amount: 2000000, source: 'salary' },
      { amount: 500000, source: 'investment' }
    ]);
  }, []);

  // Recalculate whenever profile or incomes change
  useEffect(() => {
    if (diasporaProfile && (foreignIncomes.length > 0 || nigerianIncomes.length > 0)) {
      const result = calculateDiasporaTax(
        nigerianIncomes,
        foreignIncomes,
        diasporaProfile,
        {} // deductions would go here
      );
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [diasporaProfile, foreignIncomes, nigerianIncomes]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Plane className="h-6 w-6" />
            Diaspora Tax Module
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tax calculations for Nigerians living abroad with dual taxation scenarios.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Globe2 className="h-3 w-3" />
          International
        </Badge>
      </div>

      {/* Profile Setup */}
      <DiasporaProfileForm 
        onSubmit={setDiasporaProfile}
        initialData={diasporaProfile}
      />

      {/* Foreign Income Entry */}
      {diasporaProfile && (
        <ForeignIncomeForm 
          onUpdate={setForeignIncomes}
          initialData={foreignIncomes}
        />
      )}

      {/* Tax Calculation Results */}
      {calculation && diasporaProfile && (
        <DiasporaTaxCalculationDisplay 
          calculation={calculation}
          profile={diasporaProfile}
        />
      )}

      {!diasporaProfile && (
        <div className="text-center py-12 text-muted-foreground">
          <Globe2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Set up your diaspora profile to begin international tax calculations.</p>
        </div>
      )}
    </div>
  );
}