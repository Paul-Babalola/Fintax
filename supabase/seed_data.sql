-- Seed Data for FinTax
-- Default categories and sample data for development

-- Insert default tax categories that all users can access
INSERT INTO categories (id, user_id, name, tax_category, description, is_default) VALUES
  -- Business Expenses
  (uuid_generate_v4(), NULL, 'Office Supplies', 'office_supplies', 'Pens, paper, software, equipment under $2,500', true),
  (uuid_generate_v4(), NULL, 'Business Meals', 'business_meal', 'Client meetings, business lunches (50% deductible)', true),
  (uuid_generate_v4(), NULL, 'Travel - Flights', 'travel', 'Business flights and airfare', true),
  (uuid_generate_v4(), NULL, 'Travel - Hotels', 'travel', 'Business hotel accommodations', true),
  (uuid_generate_v4(), NULL, 'Travel - Ground Transport', 'travel', 'Uber, taxi, rental cars for business', true),
  (uuid_generate_v4(), NULL, 'Professional Services', 'professional_services', 'Legal, accounting, consulting fees', true),
  (uuid_generate_v4(), NULL, 'Software Subscriptions', 'software', 'SaaS tools, development software', true),
  (uuid_generate_v4(), NULL, 'Marketing & Advertising', 'marketing', 'Google Ads, Facebook Ads, promotional materials', true),
  (uuid_generate_v4(), NULL, 'Education & Training', 'education', 'Courses, books, conferences', true),
  (uuid_generate_v4(), NULL, 'Equipment', 'equipment', 'Computers, furniture, tools over $2,500', true),
  
  -- Personal (Non-deductible)
  (uuid_generate_v4(), NULL, 'Personal Food', 'personal', 'Groceries, personal dining', true),
  (uuid_generate_v4(), NULL, 'Personal Transportation', 'personal', 'Personal car payments, gas, maintenance', true),
  (uuid_generate_v4(), NULL, 'Entertainment', 'personal', 'Movies, streaming, personal fun', true),
  (uuid_generate_v4(), NULL, 'Personal Shopping', 'personal', 'Clothing, personal items', true),
  (uuid_generate_v4(), NULL, 'Utilities', 'personal', 'Personal utilities (unless home office)', true),
  
  -- Other Deductible
  (uuid_generate_v4(), NULL, 'Home Office', 'other_deductible', 'Portion of rent/mortgage for home office', true),
  (uuid_generate_v4(), NULL, 'Internet & Phone', 'other_deductible', 'Business portion of internet/phone bills', true),
  (uuid_generate_v4(), NULL, 'Insurance', 'other_deductible', 'Business insurance premiums', true);

-- Create useful database functions
CREATE OR REPLACE FUNCTION get_user_transaction_summary(
  user_uuid UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_income DECIMAL(12,2),
  total_expenses DECIMAL(12,2),
  total_deductions DECIMAL(12,2),
  transaction_count INTEGER
) AS $$
BEGIN
  -- Set default date range if not provided (current year)
  IF start_date IS NULL THEN
    start_date := DATE_TRUNC('year', CURRENT_DATE);
  END IF;
  
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.is_tax_deductible = true THEN t.amount ELSE 0 END), 0) as total_deductions,
    COUNT(*)::INTEGER as transaction_count
  FROM transactions t
  WHERE t.user_id = user_uuid
    AND t.date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-categorize transactions based on merchant/description
CREATE OR REPLACE FUNCTION auto_categorize_transaction(
  transaction_id_param UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  trans_record RECORD;
  rule_record RECORD;
  matched BOOLEAN := FALSE;
BEGIN
  -- Get the transaction
  SELECT * INTO trans_record FROM transactions WHERE id = transaction_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Find matching rule (ordered by priority)
  FOR rule_record IN 
    SELECT * FROM transaction_rules 
    WHERE user_id = trans_record.user_id 
      AND is_active = true
      AND (
        (merchant_contains IS NULL OR trans_record.merchant_name ILIKE '%' || merchant_contains || '%')
        AND (description_contains IS NULL OR trans_record.description ILIKE '%' || description_contains || '%')
        AND (amount_min IS NULL OR trans_record.amount >= amount_min)
        AND (amount_max IS NULL OR trans_record.amount <= amount_max)
      )
    ORDER BY priority DESC
    LIMIT 1
  LOOP
    -- Apply the rule
    UPDATE transactions SET
      category_id = rule_record.category_id,
      tax_category = rule_record.tax_category,
      is_business_expense = rule_record.is_business_expense,
      is_tax_deductible = rule_record.is_tax_deductible,
      confidence_score = 0.95 -- High confidence for rule-based categorization
    WHERE id = transaction_id_param;
    
    matched := TRUE;
    EXIT;
  END LOOP;
  
  RETURN matched;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-categorize new transactions
CREATE OR REPLACE FUNCTION trigger_auto_categorize()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-categorize if not already categorized
  IF NEW.category_id IS NULL THEN
    PERFORM auto_categorize_transaction(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_categorize_new_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_auto_categorize();