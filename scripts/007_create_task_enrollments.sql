-- Create task_enrollments table
CREATE TABLE IF NOT EXISTS public.task_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  eligibility_checked BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, task_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_enrollments_user_id ON public.task_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_enrollments_task_id ON public.task_enrollments(task_id);

-- Enable RLS
ALTER TABLE public.task_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own enrollments"
  ON public.task_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments"
  ON public.task_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
  ON public.task_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND name = 'Admin'
    )
  );
