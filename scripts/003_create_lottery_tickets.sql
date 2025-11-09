-- Create lottery_tickets table
CREATE TABLE IF NOT EXISTS public.lottery_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lottery_id UUID NOT NULL REFERENCES public.lotteries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL CHECK (LENGTH(ticket_number) = 6),
  purchase_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'won', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_lottery_id ON public.lottery_tickets(lottery_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_user_id ON public.lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_ticket_number ON public.lottery_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_lottery_tickets_status ON public.lottery_tickets(status);

-- Unique constraint to prevent duplicate ticket numbers in same lottery
CREATE UNIQUE INDEX IF NOT EXISTS idx_lottery_tickets_unique 
  ON public.lottery_tickets(lottery_id, ticket_number);

-- Enable RLS
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tickets"
  ON public.lottery_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets"
  ON public.lottery_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.lottery_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND name = 'Admin'
    )
  );

-- Function to update sold_tickets count
CREATE OR REPLACE FUNCTION update_lottery_sold_tickets()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lotteries
    SET sold_tickets = sold_tickets + 1
    WHERE id = NEW.lottery_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lotteries
    SET sold_tickets = GREATEST(0, sold_tickets - 1)
    WHERE id = OLD.lottery_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update sold_tickets
CREATE TRIGGER update_sold_tickets_on_ticket_change
  AFTER INSERT OR DELETE ON public.lottery_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_lottery_sold_tickets();
