-- Seed data for admin functionality
-- Creates a default admin user and sample admin activity logs

-- Note: This assumes you have at least one user in auth.users
-- You'll need to replace the user_id with an actual user ID from your auth.users table

-- Create a default admin user (you should update this with a real user ID)
-- First, let's create a function to set the first user as admin
CREATE OR REPLACE FUNCTION set_first_user_as_admin()
RETURNS VOID AS $$
DECLARE
  v_first_user_id UUID;
BEGIN
  -- Get the first user ID
  SELECT id INTO v_first_user_id
  FROM profiles
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- If a user exists, make them admin
  IF v_first_user_id IS NOT NULL THEN
    UPDATE profiles
    SET role = 'admin'
    WHERE id = v_first_user_id;
    
    RAISE NOTICE 'First user (%) set as admin', v_first_user_id;
  ELSE
    RAISE NOTICE 'No users found to set as admin';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT set_first_user_as_admin();

-- Insert sample admin activity logs (optional, for testing)
-- These will only be inserted if there's at least one admin user
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Get first admin user
  SELECT id INTO v_admin_id
  FROM profiles
  WHERE role = 'admin'
  LIMIT 1;
  
  -- Only insert sample logs if an admin exists
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO admin_activity_logs (admin_id, action_type, action_description, target_type, metadata) VALUES
    (v_admin_id, 'settings_updated', 'Updated platform fee to 5%', 'settings', '{"field": "platform_fee_percentage", "old_value": "3", "new_value": "5"}'::jsonb),
    (v_admin_id, 'lottery_created', 'Created new lottery: Grand Prize Draw', 'lottery', '{"lottery_name": "Grand Prize Draw", "prize_amount": 1000}'::jsonb),
    (v_admin_id, 'task_created', 'Created new task: First Deposit Bonus', 'task', '{"task_name": "First Deposit Bonus", "bonus_amount": 10}'::jsonb);
    
    RAISE NOTICE 'Sample admin activity logs created';
  END IF;
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS set_first_user_as_admin();
