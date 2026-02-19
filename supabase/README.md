# FinTax Supabase Database Setup

This directory contains the complete database schema for the FinTax application.

## Files Overview

- `schema.sql` - Core database tables, types, and indexes
- `rls_policies.sql` - Row Level Security policies for data protection
- `seed_data.sql` - Default categories and utility functions

## Quick Setup

### 1. Create a Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize in your project
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. Apply the Schema
```bash
# Run the SQL files in order
supabase db reset

# Or manually in Supabase Dashboard SQL Editor:
# 1. Run schema.sql
# 2. Run rls_policies.sql  
# 3. Run seed_data.sql
```

### 3. Set Environment Variables
```bash
# In your .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## Database Structure

### Core Tables

1. **profiles** - User account information extending Supabase auth
2. **accounts** - Connected bank accounts (Plaid/Mono integration)
3. **transactions** - Financial transactions with tax categorization
4. **categories** - Tax categories for expense classification
5. **transaction_rules** - Auto-categorization rules
6. **tax_reports** - Generated tax reports and summaries
7. **receipts** - Receipt storage and OCR data

### Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Auto-categorization** - Rules-based transaction categorization
- **Tax Intelligence** - Built-in tax category mapping
- **Receipt Management** - OCR and document storage
- **Audit Trail** - Created/updated timestamps on all records

### Tax Categories

- `business_meal` - 50% deductible business meals
- `office_supplies` - Fully deductible office expenses
- `travel` - Business travel expenses
- `professional_services` - Legal, accounting fees
- `software` - SaaS subscriptions and tools
- `equipment` - Business equipment purchases
- `marketing` - Advertising and promotional costs
- `education` - Professional development
- `other_deductible` - Other qualifying business expenses
- `personal` - Non-deductible personal expenses

## Security Features

- All tables have RLS enabled
- Users can only access their own data
- Service key required for admin operations
- Encrypted sensitive data (tax IDs)

## Useful Queries

### Get User Transaction Summary
```sql
SELECT * FROM get_user_transaction_summary(
  'user-uuid',
  '2024-01-01'::DATE,
  '2024-12-31'::DATE
);
```

### Monthly Deduction Summary
```sql
SELECT 
  DATE_TRUNC('month', date) as month,
  tax_category,
  SUM(amount) as total_amount
FROM transactions 
WHERE user_id = 'user-uuid' 
  AND is_tax_deductible = true
GROUP BY month, tax_category
ORDER BY month DESC;
```