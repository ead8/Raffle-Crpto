-- Create lotteries table
CREATE TABLE IF NOT EXISTS public.lotteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prize_amount DECIMAL(10, 2) NOT NULL CHECK (prize_amount > 0),
  ticket_price DECIMAL(10, 2) NOT NULL CHECK (ticket_price > 0),
  max_tickets INTEGER NOT NULL CHECK (max_tickets > 0),
  sold_tickets INTEGER DEFAULT 0 NOT NULL CHECK (sold_tickets >= 0 AND sold_tickets <= max_tickets),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL CHECK (end_time > start_time),
  status TEXT DEFAULT 'upcoming' NOT NULL CHECK (status IN ('active', 'completed', 'upcoming')),
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  winning_ticket TEXT,
  auto_recreate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lotteries_status ON public.lotteries(status);
CREATE INDEX IF NOT EXISTS idx_lotteries_start_time ON public.lotteries(start_time);
CREATE INDEX IF NOT EXISTS idx_lotteries_end_time ON public.lotteries(end_time);
CREATE INDEX IF NOT EXISTS idx_lotteries_winner_id ON public.lotteries(winner_id);

-- Enable RLS
ALTER TABLE public.lotteries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view lotteries
CREATE POLICY "Anyone can view lotteries"
  ON public.lotteries FOR SELECT
  USING (true);

-- Only admins can insert/update/delete lotteries
CREATE POLICY "Admins can manage lotteries"
  ON public.lotteries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND name = 'Admin'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_lotteries_updated_at
  BEFORE UPDATE ON public.lotteries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
