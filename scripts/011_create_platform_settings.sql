-- Platform Settings Table
-- Stores global configuration for the platform

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- General Settings
  platform_name TEXT NOT NULL DEFAULT 'Raffle USDT',
  support_email TEXT NOT NULL DEFAULT 'support@usdtlottery.com',
  
  -- Lottery Settings
  default_lottery_duration_minutes INTEGER NOT NULL DEFAULT 60,
  min_ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  max_tickets_per_user INTEGER NOT NULL DEFAULT 50,
  auto_start_lotteries BOOLEAN NOT NULL DEFAULT true,
  
  -- Financial Settings
  platform_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
  withdrawal_fee_usdt DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  min_deposit_usdt DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  min_withdrawal_usdt DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
  
  -- Security Settings
  email_verification_required BOOLEAN NOT NULL DEFAULT true,
  two_factor_auth_enabled BOOLEAN NOT NULL DEFAULT false,
  max_login_attempts INTEGER NOT NULL DEFAULT 5,
  login_lockout_duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings (single row)
INSERT INTO platform_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_at ON platform_settings(updated_at);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can read settings
CREATE POLICY "Admins can read platform settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update platform settings"
  ON platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_platform_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_timestamp();
