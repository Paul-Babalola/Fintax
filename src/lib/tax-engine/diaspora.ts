// Diaspora Tax Module - For Nigerians living abroad
// Handles dual taxation, tax treaties, and foreign income reporting

export interface DiasporaProfile {
  residence_country: string;
  tax_treaty_exists: boolean;
  foreign_tax_id: string | null;
  arrival_date: string; // When they moved abroad
  departure_date: string | null; // If they returned
  resident_status: 'non_resident' | 'resident' | 'dual_resident';
  days_in_nigeria: number; // Annual days spent in Nigeria
}

export interface ForeignIncome {
  source: 'employment' | 'business' | 'investment' | 'pension' | 'rental';
  amount: number;
  currency: string;
  country: string;
  foreign_tax_paid: number;
  tax_treaty_relief: boolean;
  withholding_tax_rate: number;
  exchange_rate: number; // To NGN
}

export interface DiasporaTaxCalculation {
  nigerian_sourced_income: number;
  foreign_sourced_income: number;
  total_income_ngn: number;
  nigerian_tax_liability: number;
  foreign_tax_credit: number;
  net_nigerian_tax: number;
  resident_status: string;
  treaty_benefits_applied: number;
  recommendations: string[];
}

// Common tax treaty countries for Nigeria
export const TAX_TREATIES = {
  'UK': {
    withholding_tax_rate: 0.075, // 7.5%
    treaty_relief_available: true,
    tie_breaker_rules: true,
  },
  'USA': {
    withholding_tax_rate: 0.075,
    treaty_relief_available: true,
    tie_breaker_rules: true,
  },
  'CANADA': {
    withholding_tax_rate: 0.075,
    treaty_relief_available: true,
    tie_breaker_rules: true,
  },
  'SOUTH_AFRICA': {
    withholding_tax_rate: 0.05,
    treaty_relief_available: true,
    tie_breaker_rules: true,
  },
  // Add more countries as needed
};

export function determineResidenceStatus(profile: DiasporaProfile): string {
  const { days_in_nigeria, residence_country } = profile;
  
  // Nigerian residence test: 183 days rule
  if (days_in_nigeria >= 183) {
    return 'nigerian_resident';
  } else if (days_in_nigeria > 0) {
    return 'part_year_resident';
  } else {
    return 'non_resident';
  }
}

export function calculateDiasporaTax(
  nigerianIncome: any[],
  foreignIncome: ForeignIncome[],
  profile: DiasporaProfile,
  deductions: any = {}
): DiasporaTaxCalculation {
  // Calculate Nigerian-sourced income
  const nigerianSourcedIncome = nigerianIncome.reduce((total, income) => {
    return total + income.amount;
  }, 0);

  // Convert and sum foreign income
  const foreignSourcedIncome = foreignIncome.reduce((total, income) => {
    return total + (income.amount * income.exchange_rate);
  }, 0);

  const totalIncomeNGN = nigerianSourcedIncome + foreignSourcedIncome;
  const residenceStatus = determineResidenceStatus(profile);

  let taxableIncome = 0;
  let recommendations: string[] = [];

  // Determine taxable income based on residence status
  switch (residenceStatus) {
    case 'nigerian_resident':
      // Residents are taxed on worldwide income
      taxableIncome = totalIncomeNGN;
      recommendations.push('As a Nigerian resident, you are liable for tax on worldwide income');
      break;
    
    case 'non_resident':
      // Non-residents only pay tax on Nigerian-sourced income
      taxableIncome = nigerianSourcedIncome;
      recommendations.push('As a non-resident, you only pay Nigerian tax on Nigerian-sourced income');
      break;
    
    case 'part_year_resident':
      // Pro-rated based on days in Nigeria
      const dailyRate = profile.days_in_nigeria / 365;
      taxableIncome = nigerianSourcedIncome + (foreignSourcedIncome * dailyRate);
      recommendations.push(`As a part-year resident (${profile.days_in_nigeria} days), foreign income is pro-rated`);
      break;
  }

  // Calculate Nigerian tax (simplified - would use full tax bands)
  const nigeriaTaxRate = taxableIncome > 800000 ? 0.24 : 0; // 24% above exempt threshold
  const exemptThreshold = 800000;
  const taxableAmount = Math.max(0, taxableIncome - exemptThreshold);
  let nigerianTaxLiability = taxableAmount * nigeriaTaxRate;

  // Apply deductions
  const totalDeductions = Object.values(deductions).reduce((sum: number, val: any) => sum + (val || 0), 0);
  const taxOnDeductions = totalDeductions * nigeriaTaxRate;
  nigerianTaxLiability = Math.max(0, nigerianTaxLiability - taxOnDeductions);

  // Calculate foreign tax credit
  let foreignTaxCredit = 0;
  
  if (residenceStatus === 'nigerian_resident') {
    foreignTaxCredit = foreignIncome.reduce((total, income) => {
      const treaty = TAX_TREATIES[income.country as keyof typeof TAX_TREATIES];
      
      if (treaty && profile.tax_treaty_exists) {
        // Apply treaty benefits
        const treatyRate = treaty.withholding_tax_rate;
        const creditableAmount = Math.min(
          income.foreign_tax_paid * income.exchange_rate,
          (income.amount * income.exchange_rate) * treatyRate
        );
        return total + creditableAmount;
      } else {
        // No treaty - limited credit
        const maxCredit = (income.amount * income.exchange_rate) * 0.075; // 7.5% max
        return total + Math.min(income.foreign_tax_paid * income.exchange_rate, maxCredit);
      }
    }, 0);

    if (foreignTaxCredit > 0) {
      recommendations.push(`Foreign tax credit of ₦${foreignTaxCredit.toLocaleString()} applied`);
    }
  }

  // Apply tax treaty benefits
  let treatyBenefitsApplied = 0;
  if (profile.tax_treaty_exists) {
    treatyBenefitsApplied = foreignIncome.reduce((total, income) => {
      const treaty = TAX_TREATIES[income.country as keyof typeof TAX_TREATIES];
      if (treaty && income.tax_treaty_relief) {
        // Calculate savings from reduced withholding rate
        const standardRate = 0.10; // 10% standard WHT
        const treatyRate = treaty.withholding_tax_rate;
        const savings = (income.amount * income.exchange_rate) * (standardRate - treatyRate);
        return total + savings;
      }
      return total;
    }, 0);

    if (treatyBenefitsApplied > 0) {
      recommendations.push(`Tax treaty benefits of ₦${treatyBenefitsApplied.toLocaleString()} applied`);
    }
  }

  const netNigerianTax = Math.max(0, nigerianTaxLiability - foreignTaxCredit);

  // Add specific recommendations
  if (residenceStatus === 'nigerian_resident' && foreignSourcedIncome > 0) {
    recommendations.push('Consider tax planning strategies to minimize worldwide tax burden');
    recommendations.push('Ensure compliance with FIRS foreign income disclosure requirements');
  }

  if (!profile.tax_treaty_exists && foreignSourcedIncome > 0) {
    recommendations.push('Check if your country of residence has a tax treaty with Nigeria');
  }

  if (profile.days_in_nigeria > 150 && profile.days_in_nigeria < 183) {
    recommendations.push('Monitor days spent in Nigeria to manage residence status');
  }

  return {
    nigerian_sourced_income: nigerianSourcedIncome,
    foreign_sourced_income: foreignSourcedIncome,
    total_income_ngn: totalIncomeNGN,
    nigerian_tax_liability: nigerianTaxLiability,
    foreign_tax_credit: foreignTaxCredit,
    net_nigerian_tax: netNigerianTax,
    resident_status: residenceStatus,
    treaty_benefits_applied: treatyBenefitsApplied,
    recommendations,
  };
}

export const DIASPORA_COUNTRIES = [
  { code: 'USA', name: 'United States', has_treaty: true },
  { code: 'UK', name: 'United Kingdom', has_treaty: true },
  { code: 'CANADA', name: 'Canada', has_treaty: true },
  { code: 'SOUTH_AFRICA', name: 'South Africa', has_treaty: true },
  { code: 'UAE', name: 'United Arab Emirates', has_treaty: false },
  { code: 'GERMANY', name: 'Germany', has_treaty: false },
  { code: 'FRANCE', name: 'France', has_treaty: false },
  { code: 'NETHERLANDS', name: 'Netherlands', has_treaty: false },
  { code: 'CHINA', name: 'China', has_treaty: false },
  { code: 'INDIA', name: 'India', has_treaty: false },
] as const;

export function formatNairaDiaspora(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}