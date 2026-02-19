-- FinTax Database Schema
-- Supabase PostgreSQL Schema for Tax-Focused Financial Management

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'business', 'investment');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
CREATE TYPE tax_category AS ENUM ('business_meal', 'office_supplies', 'travel', 'professional_services', 'software', 'equipment', 'marketing', 'education', 'other_deductible', 'personal');
CREATE TYPE connection_status AS ENUM ('connected', 'error', 'maintenance', 'setup_required');

-- Core Tables

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  business_name TEXT,
  tax_id TEXT, -- EIN or SSN (encrypted)
  country_code TEXT DEFAULT 'US',
  timezone TEXT DEFAULT 'America/New_York',
  fiscal_year_end DATE DEFAULT '2024-12-31',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bank Account Connections
CREATE TABLE accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  external_account_id TEXT NOT NULL, -- Plaid/Mono account ID
  institution_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  account_subtype TEXT, -- checking, credit, etc.
  currency TEXT DEFAULT 'USD',
  current_balance DECIMAL(12,2),
  available_balance DECIMAL(12,2),
  connection_status connection_status DEFAULT 'connected',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, external_account_id)
);

-- 3. Transaction Categories
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tax_category tax_category NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES categories(id), -- For subcategories
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- 4. Transactions
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  external_transaction_id TEXT NOT NULL, -- Plaid/Mono transaction ID
  
  -- Transaction Details
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT NOT NULL,
  transaction_type transaction_type NOT NULL,
  date DATE NOT NULL,
  posted_date DATE,
  
  -- Categorization
  category_id UUID REFERENCES categories(id),
  tax_category tax_category,
  is_business_expense BOOLEAN DEFAULT FALSE,
  is_tax_deductible BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2), -- AI categorization confidence (0.00-1.00)
  
  -- Merchant Info
  merchant_name TEXT,
  merchant_category_code TEXT,
  
  -- Location (for travel/meal deductions)
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  
  -- Metadata
  notes TEXT,
  receipt_url TEXT,
  tags TEXT[], -- Array of tags
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, external_transaction_id)
);

-- 5. Transaction Rules (for auto-categorization)
CREATE TABLE transaction_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  
  -- Rule Conditions
  merchant_contains TEXT,
  description_contains TEXT,
  amount_min DECIMAL(12,2),
  amount_max DECIMAL(12,2),
  
  -- Rule Actions
  category_id UUID REFERENCES categories(id),
  tax_category tax_category,
  is_business_expense BOOLEAN,
  is_tax_deductible BOOLEAN,
  
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 1, -- Higher numbers = higher priority
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tax Reports
CREATE TABLE tax_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_name TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Report Data (JSON)
  categories_summary JSONB, -- Summary by tax category
  monthly_breakdown JSONB,  -- Month-by-month breakdown
  top_merchants JSONB,      -- Most frequent business expenses
  
  total_income DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  potential_savings DECIMAL(12,2) DEFAULT 0,
  
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Receipts & Documents
CREATE TABLE receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  
  filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  
  -- OCR/AI extracted data
  extracted_amount DECIMAL(12,2),
  extracted_date DATE,
  extracted_merchant TEXT,
  extracted_items JSONB, -- Line items from receipt
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX idx_transactions_tax_category ON transactions(tax_category);
CREATE INDEX idx_transactions_business_expense ON transactions(user_id, is_business_expense) WHERE is_business_expense = TRUE;
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_receipts_transaction ON receipts(transaction_id);

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();