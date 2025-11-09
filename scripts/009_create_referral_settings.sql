-- Create referral_settings table (single row configuration)
CREATE TABLE IF NOT EXISTS public.referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_reward DECIMAL(10, 2) DEFAULT 5 NOT NULL CHECK (signup_reward >= 0),
  commission_rate DECIMAL(5, 2) DEFAULT 10 NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default settings
INSERT INTO public.referral_settings (signup_reward, commission_rate)
VALUES (5, 10)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view settings
CREATE POLICY "Anyone can view referral settings"
  ON public.referral_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update referral settings"
  ON public.referral_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND name = 'Admin'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_referral_settings_updated_at
  BEFORE UPDATE ON public.referral_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
