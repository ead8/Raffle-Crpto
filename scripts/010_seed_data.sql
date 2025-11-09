-- Seed data for testing
-- Note: This assumes you have created test users through Supabase Auth first

-- Insert demo lotteries
INSERT INTO public.lotteries (title, prize_amount, ticket_price, max_tickets, sold_tickets, start_time, end_time, status)
VALUES
  ('Sorteo Rápido', 500, 5, 100, 0, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'active'),
  ('Mega Sorteo', 1000, 10, 150, 0, NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '45 minutes', 'active'),
  ('Sorteo Express', 250, 2, 80, 0, NOW() - INTERVAL '45 minutes', NOW() + INTERVAL '15 minutes', 'active'),
  ('Sorteo Premium', 2000, 20, 200, 0, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'upcoming')
ON CONFLICT DO NOTHING;

-- Insert default registration bonus task
INSERT INTO public.tasks (
  title,
  description,
  type,
  bonus_amount,
  requirement_type,
  requirement_amount,
  targeting_type,
  is_active
)
VALUES (
  'Bono de Registro',
  'Desbloquea tu bono de registro de 5 USDT',
  'registration',
  5,
  'deposit',
  100,
  'new_users',
  true
)
ON CONFLICT DO NOTHING;
