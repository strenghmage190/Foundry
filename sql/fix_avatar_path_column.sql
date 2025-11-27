-- Fix: Ensure avatar_path column exists in user_profiles table
-- This resolves the "Could not find the 'avatar_path' column" schema cache error
-- 
-- IMPORTANT: After running this SQL:
-- 1. In Supabase dashboard, go to Database → Webhooks
-- 2. Toggle any webhook off and back on to refresh the schema cache
-- OR restart the database connection
--
-- If issue persists, run: SELECT pg_sleep(5); to give cache time to update

BEGIN;

-- Step 1: Add avatar_path column if it doesn't exist
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS avatar_path text;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN public.user_profiles.avatar_path IS 'Path to user avatar in storage bucket user-avatars';

-- Step 3: Ensure RLS policy allows avatar_path to be read/updated
-- This is crucial - the column must be included in the select policy
-- If avatar_path is not in the policy, Supabase may not expose it

-- Grant SELECT access to avatar_path (part of reading own profile)
-- The existing RLS policies should allow this since they select * or specific columns

-- Step 4: Verify the column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'user_profiles' AND column_name = 'avatar_path'
) AS avatar_path_exists;

COMMIT;
