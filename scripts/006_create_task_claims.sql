-- Create task_claims table
CREATE TABLE IF NOT EXISTS public.task_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, task_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_claims_user_id ON public.task_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_task_claims_task_id ON public.task_claims(task_id);
CREATE INDEX IF NOT EXISTS idx_task_claims_claimed_at ON public.task_claims(claimed_at);

-- Enable RLS
ALTER TABLE public.task_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own task claims"
  ON public.task_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task claims"
  ON public.task_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task claims"
  ON public.task_claims FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all task claims
CREATE POLICY "Admins can view all task claims"
  ON public.task_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND name = 'Admin'
    )
  );
