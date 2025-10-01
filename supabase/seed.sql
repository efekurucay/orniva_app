-- Seed file for initial data
-- This file is executed after migrations when running `supabase db reset`

-- Note: This app doesn't require seed data as users create their own accounts
-- and data through the application. This file is here as a placeholder.

-- Example: If you wanted to create test users, you would do:
-- (Uncomment the lines below if you need test data)

/*
-- Test user (email: test@orniva.app, password: test123456)
-- You would need to handle password hashing properly through Supabase Auth API
-- This is just for reference

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@orniva.app',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- The trigger will automatically create the user_profile
-- But you can also manually insert if needed:
INSERT INTO public.user_profiles (id, email, username, credits, language)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@orniva.app',
  'Test User',
  50, -- Give test user extra credits
  'en'
);
*/

-- For production, seed data is not needed
-- Users will sign up through the app and get their initial 3 free credits automatically
