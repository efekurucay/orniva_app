-- Fix initial credits from 10 to 3
-- This migration corrects the default credits given to new users

-- 1. Update the default value for the credits column
ALTER TABLE public.user_profiles 
ALTER COLUMN credits SET DEFAULT 3;

-- 2. Update the trigger function to give 3 credits instead of 10
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, credits)
  VALUES (NEW.id, NEW.email, 3);  -- Changed from 10 to 3
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This only affects NEW users created after this migration
-- Existing users keep their current credit balance
