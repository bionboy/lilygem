-- Exchange rates table (pair-based)
CREATE TABLE exchange_rate_pairs (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, base_currency, target_currency)
);

-- User transactions table
CREATE TABLE user_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX idx_exchange_rate_pairs_date ON exchange_rate_pairs(date);
CREATE INDEX idx_exchange_rate_pairs_base ON exchange_rate_pairs(base_currency);
CREATE INDEX idx_exchange_rate_pairs_target ON exchange_rate_pairs(target_currency);
CREATE INDEX idx_exchange_rate_pairs_pair ON exchange_rate_pairs(base_currency, target_currency);
CREATE INDEX idx_exchange_rate_pairs_date_pair ON exchange_rate_pairs(date, base_currency, target_currency);
CREATE INDEX idx_user_transactions_user_date ON user_transactions(user_id, date);
CREATE INDEX idx_user_transactions_currencies ON user_transactions(base_currency, target_currency);

-- Row Level Security (RLS) policies
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON user_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON user_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON user_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON user_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_transactions_updated_at
  BEFORE UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 