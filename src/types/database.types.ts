export type IncomeSource    = "salary" | "freelance" | "investment" | "rental" | "other";
export type ExpenseCategory = "rent" | "food" | "transport" | "utilities" | "health" | "education" | "entertainment" | "other";
export type DeductionType   = "rent_relief" | "pension" | "nhf" | "life_assurance";
export type EmploymentType  = "employed" | "self_employed" | "both";

export interface Database {
  public: {
    Tables: {

      user_profiles: {
        Row: {
          id:                           string;
          employment_type:              EmploymentType;
          state_of_residence:           string;
          annual_rent:                  number | null;
          monthly_pension_contribution: number | null;
          nhf_monthly_contribution:     number | null;
          tax_year_start:               string;
          onboarding_complete:          boolean;
          created_at:                   string;
          updated_at:                   string;
        };
        Insert: {
          id:                            string;
          employment_type?:              EmploymentType;
          state_of_residence?:           string;
          annual_rent?:                  number | null;
          monthly_pension_contribution?: number | null;
          nhf_monthly_contribution?:     number | null;
          tax_year_start?:               string;
          onboarding_complete?:          boolean;
        };
        Update: {
          employment_type?:              EmploymentType;
          state_of_residence?:           string;
          annual_rent?:                  number | null;
          monthly_pension_contribution?: number | null;
          nhf_monthly_contribution?:     number | null;
          tax_year_start?:               string;
          onboarding_complete?:          boolean;
        };
      };

      income_entries: {
        Row: {
          id:         string;
          user_id:    string;
          amount:     number;
          source:     IncomeSource;
          date:       string;
          notes:      string | null;
          wht_rate:   number | null;
          wht_amount:   number | null;
          is_recurring: boolean;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id?:           string;
          user_id:       string;
          amount:        number;
          source:        IncomeSource;
          date:          string;
          notes?:        string | null;
          wht_rate?:     number | null;
          wht_amount?:   number | null;
          is_recurring?: boolean;
        };
        Update: {
          amount?:     number;
          source?:     IncomeSource;
          date?:       string;
          notes?:      string | null;
          wht_rate?:   number | null;
          wht_amount?: number | null;
        };
      };

      expenses: {
        Row: {
          id:                 string;
          user_id:            string;
          amount:             number;
          category:           ExpenseCategory;
          date:               string;
          notes:              string | null;
          is_deductible:      boolean;
          deduction_type:     DeductionType | null;
          receipt_url:        string | null;
          custom_category_id: string | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: {
          id?:                 string;
          user_id:             string;
          amount:              number;
          category:            ExpenseCategory;
          date:                string;
          notes?:              string | null;
          is_deductible?:      boolean;
          deduction_type?:     DeductionType | null;
          receipt_url?:        string | null;
          custom_category_id?: string | null;
        };
        Update: {
          amount?:             number;
          category?:           ExpenseCategory;
          date?:               string;
          notes?:              string | null;
          is_deductible?:      boolean;
          deduction_type?:     DeductionType | null;
          receipt_url?:        string | null;
          custom_category_id?: string | null;
        };
      };

      budgets: {
        Row: {
          id:                 string;
          user_id:            string;
          category:           ExpenseCategory;
          monthly_limit:      number;
          custom_label:       string | null;
          custom_category_id: string | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: {
          id?:                 string;
          user_id:             string;
          category:            ExpenseCategory;
          monthly_limit:       number;
          custom_label?:       string | null;
          custom_category_id?: string | null;
        };
        Update: {
          monthly_limit?:      number;
          custom_label?:       string | null;
          custom_category_id?: string | null;
        };
      };

      user_categories: {
        Row: {
          id:         string;
          user_id:    string;
          name:       string;
          icon:       string | null;
          created_at: string;
        };
        Insert: {
          id?:      string;
          user_id:  string;
          name:     string;
          icon?:    string | null;
        };
        Update: {
          name?: string;
          icon?: string | null;
        };
      };

      tax_snapshots: {
        Row: {
          id:                string;
          user_id:           string;
          snapshot_month:    string;
          gross_income:      number;
          taxable_income:    number;
          total_deductions:  number;
          pit_before_wht:    number;
          wht_credit:        number;
          net_tax_liability: number;
          effective_rate:    number;
          is_exempt:         boolean;
          engine_version:    string;
          created_at:        string;
        };
        Insert: {
          id?:               string;
          user_id:           string;
          snapshot_month:    string;
          gross_income:      number;
          taxable_income:    number;
          total_deductions:  number;
          pit_before_wht:    number;
          wht_credit:        number;
          net_tax_liability: number;
          effective_rate:    number;
          is_exempt:         boolean;
          engine_version?:   string;
        };
        Update: never;
      };

      subscriptions: {
        Row: {
          id:                    string;
          user_id:               string;
          stripe_customer_id:    string;
          stripe_subscription_id: string | null;
          plan_name:             string;
          status:                string;
          current_period_start:  string;
          current_period_end:    string;
          created_at:            string;
          updated_at:            string;
        };
        Insert: {
          id?:                   string;
          user_id:               string;
          stripe_customer_id:    string;
          stripe_subscription_id?: string | null;
          plan_name:             string;
          status:                string;
          current_period_start:  string;
          current_period_end:    string;
        };
        Update: {
          stripe_subscription_id?: string | null;
          plan_name?:            string;
          status?:               string;
          current_period_start?: string;
          current_period_end?:   string;
        };
      };

      payments: {
        Row: {
          id:                    string;
          user_id:               string;
          stripe_payment_intent_id: string;
          amount:                number;
          currency:              string;
          status:                string;
          plan_name:             string;
          created_at:            string;
        };
        Insert: {
          id?:                   string;
          user_id:               string;
          stripe_payment_intent_id: string;
          amount:                number;
          currency:              string;
          status:                string;
          plan_name:             string;
        };
        Update: {
          status?: string;
        };
      };

      bank_connections: {
        Row: {
          id:                    string;
          user_id:               string;
          mono_account_id:       string;
          bank_name:             string;
          bank_code:             string;
          account_number:        string;
          account_name:          string;
          account_type:          string;
          is_active:             boolean;
          last_sync:             string | null;
          created_at:            string;
          updated_at:            string;
        };
        Insert: {
          id?:                   string;
          user_id:               string;
          mono_account_id:       string;
          bank_name:             string;
          bank_code:             string;
          account_number:        string;
          account_name:          string;
          account_type:          string;
          is_active?:            boolean;
          last_sync?:            string | null;
        };
        Update: {
          is_active?:            boolean;
          last_sync?:            string | null;
        };
      };

      synced_transactions: {
        Row: {
          id:                    string;
          user_id:               string;
          bank_connection_id:    string;
          mono_transaction_id:   string;
          amount:                number;
          description:           string;
          transaction_date:      string;
          transaction_type:      'debit' | 'credit';
          category:              string | null;
          balance_after:         number;
          is_processed:          boolean;
          income_entry_id:       string | null;
          expense_entry_id:      string | null;
          created_at:            string;
        };
        Insert: {
          id?:                   string;
          user_id:               string;
          bank_connection_id:    string;
          mono_transaction_id:   string;
          amount:                number;
          description:           string;
          transaction_date:      string;
          transaction_type:      'debit' | 'credit';
          category?:             string | null;
          balance_after:         number;
          is_processed?:         boolean;
          income_entry_id?:      string | null;
          expense_entry_id?:     string | null;
        };
        Update: {
          category?:             string | null;
          is_processed?:         boolean;
          income_entry_id?:      string | null;
          expense_entry_id?:     string | null;
        };
      };

    };

    Views: {
      monthly_income_summary: {
        Row: {
          user_id:      string;
          month:        string;
          source:       IncomeSource;
          entry_count:  number;
          total_amount: number;
          total_wht:    number;
        };
      };
      monthly_expense_summary: {
        Row: {
          user_id:           string;
          month:             string;
          category:          ExpenseCategory;
          entry_count:       number;
          total_amount:      number;
          deductible_amount: number;
        };
      };
    };

    Functions: Record<string, never>;

    Enums: {
      income_source:    IncomeSource;
      expense_category: ExpenseCategory;
      deduction_type:   DeductionType;
      employment_type:  EmploymentType;
    };
  };
}
