-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'deposit_volume', 'lottery_volume', 'referral', 'custom')),
  bonus_amount DECIMAL(10, 2) NOT NULL CHECK (bonus_amount > 0),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('deposit', 'lottery_spending', 'referrals', 'custom')),
  requirement_amount DECIMAL(10, 2),
  requirement_count INTEGER,
  targeting_type TEXT DEFAULT 'all' NOT NULL CHECK (targeting_type IN ('all', 'new_users', 'registered_after', 'specific_users')),
  targeting_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  duration_days INTEGER,
  max_completions INTEGER,
  current_completions INTEGER DEFAULT 0 NOT NULL CHECK (current_completions >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON public.tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON public.tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_targeting_type ON public.tasks(targeting_type);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view active tasks
CREATE POLICY "Anyone can view active tasks"
  ON public.tasks FOR SELECT
  USING (is_active = true);

-- Admins can manage all tasks
CREATE POLICY "Admins can manage tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND name = 'Admin'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
