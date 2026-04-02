"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Trash2 } from "lucide-react";

interface ForeignIncome {
  id: string;
  source: string;
  amount: number;
  currency: string;
  country: string;
  foreign_tax_paid: number;
  exchange_rate: number;
}

interface ForeignIncomeFormProps {
  onUpdate: (incomes: ForeignIncome[]) => void;
  initialData?: ForeignIncome[];
}

const INCOME_SOURCES = [
  { value: 'employment', label: 'Employment' },
  { value: 'business', label: 'Business' },
  { value: 'investment', label: 'Investment' },
  { value: 'pension', label: 'Pension' },
  { value: 'rental', label: 'Rental' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
];

export function ForeignIncomeForm({ onUpdate, initialData = [] }: ForeignIncomeFormProps) {
  const [incomes, setIncomes] = useState<ForeignIncome[]>(initialData);
  const [newIncome, setNewIncome] = useState({
    source: 'employment',
    amount: '',
    currency: 'USD',
    country: '',
    foreign_tax_paid: '',
    exchange_rate: '',
  });

  const addIncome = () => {
    if (!newIncome.amount || !newIncome.country || !newIncome.exchange_rate) return;

    const income: ForeignIncome = {
      id: Date.now().toString(),
      source: newIncome.source,
      amount: parseFloat(newIncome.amount),
      currency: newIncome.currency,
      country: newIncome.country.toUpperCase(),
      foreign_tax_paid: parseFloat(newIncome.foreign_tax_paid) || 0,
      exchange_rate: parseFloat(newIncome.exchange_rate),
    };

    const updatedIncomes = [...incomes, income];
    setIncomes(updatedIncomes);
    onUpdate(updatedIncomes);
    
    setNewIncome({
      source: 'employment',
      amount: '',
      currency: 'USD',
      country: '',
      foreign_tax_paid: '',
      exchange_rate: '',
    });
  };

  const removeIncome = (id: string) => {
    const updatedIncomes = incomes.filter(income => income.id !== id);
    setIncomes(updatedIncomes);
    onUpdate(updatedIncomes);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency} ${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Foreign Income
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add income earned outside Nigeria. This helps calculate your worldwide tax liability.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing incomes */}
        {incomes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Current Foreign Income</h4>
            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatCurrency(income.amount, income.currency)}
                    </span>
                    <Badge variant="outline">
                      {INCOME_SOURCES.find(s => s.value === income.source)?.label}
                    </Badge>
                    <Badge variant="secondary">{income.country}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ≈ ₦{(income.amount * income.exchange_rate).toLocaleString()} 
                    {income.foreign_tax_paid > 0 && ` • Tax paid: ${formatCurrency(income.foreign_tax_paid, income.currency)}`}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeIncome(income.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new income form */}
        <div className="space-y-4 p-4 border border-dashed rounded-lg">
          <h4 className="font-medium">Add Foreign Income</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Income Source</Label>
              <select
                id="source"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newIncome.source}
                onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
              >
                {INCOME_SOURCES.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., USA, UK, Canada"
                value={newIncome.country}
                onChange={(e) => setNewIncome({ ...newIncome, country: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100000"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newIncome.currency}
                onChange={(e) => setNewIncome({ ...newIncome, currency: e.target.value })}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchange_rate">Exchange Rate (to ₦)</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.01"
                placeholder="1500"
                value={newIncome.exchange_rate}
                onChange={(e) => setNewIncome({ ...newIncome, exchange_rate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreign_tax_paid">Foreign Tax Paid (Optional)</Label>
            <Input
              id="foreign_tax_paid"
              type="number"
              step="0.01"
              placeholder="0"
              value={newIncome.foreign_tax_paid}
              onChange={(e) => setNewIncome({ ...newIncome, foreign_tax_paid: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Tax already paid to foreign government (for foreign tax credit calculation)
            </p>
          </div>

          <Button 
            type="button" 
            onClick={addIncome}
            className="w-full"
            disabled={!newIncome.amount || !newIncome.country || !newIncome.exchange_rate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Foreign Income
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}