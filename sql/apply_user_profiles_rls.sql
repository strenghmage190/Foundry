-- SQL: apply_user_profiles_rls.sql
-- Run this after creating the `user_profiles` table to enable RLS and allow users
-- to manage only their own profile rows.

-- Enable Row Level Security on the table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own profile
CREATE POLICY "Select own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own profile (user_id must match auth.uid())
CREATE POLICY "Insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update only their own profile
CREATE POLICY "Update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Optionally allow delete (usually not necessary), uncomment to enable:
-- CREATE POLICY "Delete own profile" ON public.user_profiles
--   FOR DELETE USING (auth.uid() = user_id);

-- Notes:
-- - Run this in the Supabase SQL editor as a user with the required privileges.
-- - After applying, test your client operations with an authenticated user.
-- - If you use service_role for server-side upserts, those bypass RLS (keep service_role secret!).
