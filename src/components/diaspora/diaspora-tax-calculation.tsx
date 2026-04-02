"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  calculateDiasporaTax, 
  formatNairaDiaspora,
  type DiasporaTaxCalculation 
} from "@/lib/tax-engine/diaspora";
import { 
  Globe2, 
  TrendingUp, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";

interface DiasporaTaxCalculationProps {
  calculation: DiasporaTaxCalculation;
  profile: any;
}

export function DiasporaTaxCalculationDisplay({ calculation, profile }: DiasporaTaxCalculationProps) {
  const isResident = calculation.resident_status === 'nigerian_resident';
  const hasNoTax = calculation.net_nigerian_tax === 0;
  
  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className={
        hasNoTax
          ? "border-green-200 bg-green-50/50"
          : isResident
          ? "border-amber-200 bg-amber-50/50"
          : "border-blue-200 bg-blue-50/50"
      }>
        <CardContent className="py-4 flex items-start gap-3">
          {hasNoTax ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isResident ? 'Nigerian Tax Resident' : 'Non-Resident for Tax Purposes'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isResident 
                ? 'You are liable for Nigerian tax on your worldwide income'
                : 'You only pay Nigerian tax on Nigerian-sourced income'
              }
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            {calculation.resident_status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Nigerian Income"
          value={formatNairaDiaspora(calculation.nigerian_sourced_income)}
          icon={<Globe2 className="h-4 w-4" />}
        />
        <SummaryCard
          label="Foreign Income"
          value={formatNairaDiaspora(calculation.foreign_sourced_income)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <SummaryCard
          label="Foreign Tax Credit"
          value={formatNairaDiaspora(calculation.foreign_tax_credit)}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <SummaryCard
          label="Net Nigerian Tax"
          value={formatNairaDiaspora(calculation.net_nigerian_tax)}
          highlight
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y">
            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-muted-foreground">Nigerian-sourced income</span>
              <span className="font-medium">{formatNairaDiaspora(calculation.nigerian_sourced_income)}</span>
            </div>
            
            {isResident && calculation.foreign_sourced_income > 0 && (
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-muted-foreground">Foreign income (converted to ₦)</span>
                <span className="font-medium">{formatNairaDiaspora(calculation.foreign_sourced_income)}</span>
              </div>
            )}

            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-muted-foreground">Total taxable income</span>
              <span className="font-medium">{formatNairaDiaspora(calculation.total_income_ngn)}</span>
            </div>

            <div className="flex justify-between py-2.5 text-sm">
              <span className="text-muted-foreground">Nigerian tax liability</span>
              <span className="font-medium">{formatNairaDiaspora(calculation.nigerian_tax_liability)}</span>
            </div>

            {calculation.foreign_tax_credit > 0 && (
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-muted-foreground text-[#1A6B4A]">Less: Foreign tax credit</span>
                <span className="font-medium text-[#1A6B4A]">−{formatNairaDiaspora(calculation.foreign_tax_credit)}</span>
              </div>
            )}

            {calculation.treaty_benefits_applied > 0 && (
              <div className="flex justify-between py-2.5 text-sm">
                <span className="text-muted-foreground text-[#1A6B4A]">Tax treaty benefits</span>
                <span className="font-medium text-[#1A6B4A]">−{formatNairaDiaspora(calculation.treaty_benefits_applied)}</span>
              </div>
            )}

            <div className="flex justify-between py-2.5 text-sm font-semibold border-t">
              <span>Net Nigerian tax due</span>
              <span className={calculation.net_nigerian_tax > 0 ? "text-red-600" : "text-green-600"}>
                {formatNairaDiaspora(calculation.net_nigerian_tax)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {calculation.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {calculation.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#1A6B4A] mt-0.5 shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Important Diaspora Tax Notes
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Residence is determined by the 183-day test (time spent in Nigeria)</li>
          <li>• Nigerian residents must report and pay tax on worldwide income</li>
          <li>• Foreign tax credits may reduce or eliminate double taxation</li>
          <li>• Tax treaty benefits depend on your country of residence</li>
          <li>• Consider professional advice for complex international tax matters</li>
          <li>• FIRS requires disclosure of foreign assets and income above certain thresholds</li>
        </ul>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
  icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Card className={highlight ? "border-[#1A6B4A]/30 bg-[#1A6B4A]/5" : ""}>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <p className={`text-lg font-semibold ${highlight ? "text-[#1A6B4A]" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}