-- SQL: create_user_profiles.sql
-- Run this in your Supabase SQL editor or via psql to add the user_profiles table.

-- Table to store simple per-user preferences and avatar path
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY,
  display_name text,
  pronouns text,
  avatar_path text,
  use_open_dyslexic_font boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to update `updated_at` on row change
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.user_profiles;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at();

-- Grant minimal privileges (adjust role names as needed)
-- Example: allow authenticated users to insert/update their own profile via policies.

-- NOTE: After creating the table, define Row Level Security (RLS) policies
-- in Supabase to allow users to read/update only their own row. Example policies:
-- 1) Enable RLS:
--    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- 2) Allow authenticated users to select their profile:
--    CREATE POLICY "Select own profile" ON public.user_profiles
--      FOR SELECT USING (auth.uid() = user_id);
-- 3) Allow insert for authenticated users (so they can create their profile):
--    CREATE POLICY "Insert own profile" ON public.user_profiles
--      FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 4) Allow update only on own profile:
--    CREATE POLICY "Update own profile" ON public.user_profiles
--      FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Remember to adapt these policies to your project's auth setup.
