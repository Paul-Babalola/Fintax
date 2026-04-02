"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TaxSnapshot {
  id: string;
  snapshot_month: string;
  gross_income: number;
  taxable_income: number;
  total_deductions: number;
  pit_before_wht: number;
  wht_credit: number;
  net_tax_liability: number;
  effective_rate: number;
  is_exempt: boolean;
  created_at: string;
}

export function TaxHistory() {
  const [snapshots, setSnapshots] = useState<TaxSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTaxHistory();
  }, []);

  const fetchTaxHistory = async () => {
    try {
      const response = await fetch('/api/tax/history');
      const { snapshots } = await response.json();
      setSnapshots(snapshots || []);
    } catch (error) {
      console.error('Error fetching tax history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change),
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading tax history...</div>
        </CardContent>
      </Card>
    );
  }

  if (!snapshots.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tax History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tax history available yet. Add some income and expenses to see your tax snapshots.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly tax calculations and trends
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {snapshots.map((snapshot, index) => {
          const previousSnapshot = snapshots[index + 1];
          const incomeTrend = getTrend(snapshot.gross_income, previousSnapshot?.gross_income);
          const taxTrend = getTrend(snapshot.net_tax_liability, previousSnapshot?.net_tax_liability);

          return (
            <Card key={snapshot.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {formatMonth(snapshot.snapshot_month)}
                  </CardTitle>
                  {snapshot.is_exempt && (
                    <Badge variant="secondary">Tax Exempt</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Gross Income</p>
                      {incomeTrend && (
                        <div className="flex items-center gap-1">
                          {incomeTrend.direction === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                          {incomeTrend.direction === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                          {incomeTrend.direction === 'stable' && <Minus className="h-3 w-3 text-gray-600" />}
                          <span className="text-xs text-muted-foreground">
                            {incomeTrend.percentage.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold">{formatCurrency(snapshot.gross_income)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Deductions</p>
                    <p className="font-semibold">{formatCurrency(snapshot.total_deductions)}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">WHT Credit</p>
                    <p className="font-semibold">{formatCurrency(snapshot.wht_credit)}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Net Tax</p>
                      {taxTrend && (
                        <div className="flex items-center gap-1">
                          {taxTrend.direction === 'up' && <TrendingUp className="h-3 w-3 text-red-600" />}
                          {taxTrend.direction === 'down' && <TrendingDown className="h-3 w-3 text-green-600" />}
                          {taxTrend.direction === 'stable' && <Minus className="h-3 w-3 text-gray-600" />}
                          <span className="text-xs text-muted-foreground">
                            {taxTrend.percentage.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`font-semibold ${
                      snapshot.net_tax_liability > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(snapshot.net_tax_liability)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Effective Rate: {snapshot.effective_rate.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">
                    Taxable Income: {formatCurrency(snapshot.taxable_income)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}