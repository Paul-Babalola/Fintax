"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plane, Globe2, CalendarDays } from "lucide-react";
import { DIASPORA_COUNTRIES } from "@/lib/tax-engine/diaspora";

interface DiasporaProfileFormProps {
  onSubmit: (profile: any) => void;
  initialData?: any;
}

export function DiasporaProfileForm({ onSubmit, initialData }: DiasporaProfileFormProps) {
  const [profile, setProfile] = useState({
    residence_country: initialData?.residence_country || '',
    foreign_tax_id: initialData?.foreign_tax_id || '',
    arrival_date: initialData?.arrival_date || '',
    days_in_nigeria: initialData?.days_in_nigeria || 0,
    ...initialData
  });

  const selectedCountry = DIASPORA_COUNTRIES.find(c => c.code === profile.residence_country);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      ...profile,
      tax_treaty_exists: selectedCountry?.has_treaty || false,
      resident_status: profile.days_in_nigeria >= 183 ? 'resident' : 'non_resident',
    };
    
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-5 w-5" />
          Diaspora Tax Profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set up your international tax profile to get accurate calculations for dual taxation scenarios.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="residence_country">Country of Residence</Label>
              <select
                id="residence_country"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={profile.residence_country}
                onChange={(e) => setProfile({ ...profile, residence_country: e.target.value })}
                required
              >
                <option value="">Select country...</option>
                {DIASPORA_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {selectedCountry && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={selectedCountry.has_treaty ? "default" : "secondary"}>
                    {selectedCountry.has_treaty ? "Tax Treaty Available" : "No Tax Treaty"}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="foreign_tax_id">Foreign Tax ID (Optional)</Label>
              <Input
                id="foreign_tax_id"
                placeholder="e.g., SSN, NI Number"
                value={profile.foreign_tax_id}
                onChange={(e) => setProfile({ ...profile, foreign_tax_id: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrival_date">Date Moved Abroad</Label>
              <Input
                id="arrival_date"
                type="date"
                value={profile.arrival_date}
                onChange={(e) => setProfile({ ...profile, arrival_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days_in_nigeria">Days in Nigeria (This Year)</Label>
              <Input
                id="days_in_nigeria"
                type="number"
                min="0"
                max="365"
                value={profile.days_in_nigeria}
                onChange={(e) => setProfile({ ...profile, days_in_nigeria: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">
                {profile.days_in_nigeria >= 183 ? '183+ days = Nigerian resident for tax purposes' : 'Under 183 days = Non-resident status'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Residence Status Summary</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Nigerian residents (183+ days): Taxed on worldwide income</p>
                <p>• Non-residents (&lt;183 days): Only Nigerian-sourced income taxed</p>
                <p>• Tax treaties can reduce withholding tax rates and provide relief</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#1A6B4A] hover:bg-[#145a3d]">
            <Plane className="h-4 w-4 mr-2" />
            Update Diaspora Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}