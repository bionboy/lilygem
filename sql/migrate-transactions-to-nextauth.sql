-- Migration: Update user_transactions table for NextAuth integration
-- This script drops and recreates the user_transactions table to work with NextAuth

-- Drop existing table and its policies
DROP TABLE IF EXISTS user_transactions CASCADE;

-- Recreate user_transactions table with reference to next_auth.users
CREATE TABLE user_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES next_auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  base_amount DECIMAL(15,2) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  exchange_rate DECIMAL(15,6) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes for performance
CREATE INDEX idx_user_transactions_user_date ON user_transactions(user_id, date);
CREATE INDEX idx_user_transactions_currencies ON user_transactions(base_currency, target_currency);

-- Enable Row Level Security
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using next_auth.uid() instead of auth.uid()
CREATE POLICY "Users can view own transactions" ON user_transactions
  FOR SELECT USING (next_auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON user_transactions
  FOR INSERT WITH CHECK (next_auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON user_transactions
  FOR UPDATE USING (next_auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON user_transactions
  FOR DELETE USING (next_auth.uid() = user_id);

-- Recreate trigger for updated_at (function should already exist)
CREATE TRIGGER update_user_transactions_updated_at
  BEFORE UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
