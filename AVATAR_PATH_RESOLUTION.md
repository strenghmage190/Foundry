# Avatar Path Column - Complete Resolution Guide

## What's Happening

Your app is trying to save a user profile with an `avatar_path` field to the Supabase `user_profiles` table. The database error indicates:

```
Could not find the 'avatar_path' column of 'user_profiles' in the schema cache
Error Code: PGRST204
```

This is a **schema cache synchronization issue** between Supabase's PostgREST API and the actual PostgreSQL database.

## The Problem in 3 Points

1. **The column likely exists in PostgreSQL** but PostgREST (Supabase's API layer) hasn't refreshed its cached schema
2. **PostgREST caches table schemas** to avoid querying the database constantly
3. **The cache can become stale** after table modifications, especially if multiple migrations ran

## Solution Checklist

### ✅ STEP 1: Execute the SQL Fix (5 minutes)

Open **Supabase Dashboard** → **SQL Editor** → Create new query:

```sql
-- Fix: Ensure avatar_path column exists in user_profiles table
BEGIN;

-- Add avatar_path column if missing
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS avatar_path text;

-- Document the column
COMMENT ON COLUMN public.user_profiles.avatar_path IS 'Path to user avatar in storage bucket user-avatars';

-- Verify it exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'user_profiles' AND column_name = 'avatar_path'
) AS avatar_path_exists;

COMMIT;
```

**Expected Result**: 
- No errors
- Final query shows: `avatar_path_exists | true`

### ✅ STEP 2: Refresh PostgREST Schema Cache (2-10 minutes)

**Method A: Webhook Toggle** (If you have webhooks)
1. Dashboard → Database → Webhooks
2. Find any webhook on `user_profiles` table
3. Toggle OFF → wait 2 seconds → toggle ON
4. This forces cache refresh

**Method B: Wait for Auto-Refresh**
- PostgREST auto-refreshes cache every 5-10 minutes
- Safest option - just wait 10 minutes

**Method C: Reload the App**
- Close the browser tab completely
- Clear browser cache (Ctrl+Shift+Delete)
- Reopen and test avatar upload
- Sometimes client-side cache is the issue

### ✅ STEP 3: Verify Fix Worked

**In Supabase SQL Editor**, run:

```sql
-- Check column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

Look for `avatar_path | text | YES` in results.

**In Your App**, open browser DevTools → Console:
1. Go to User Profile page
2. Try to save profile with avatar
3. Check if error still appears
4. Look for success message in console

### ✅ STEP 4: Test the Actual Save

Run this in Supabase SQL Editor to test the data layer:

```sql
-- Test insert/update with avatar_path
INSERT INTO public.user_profiles (user_id, display_name, avatar_path)
VALUES (gen_random_uuid(), 'Test User', 'avatars/test.png')
ON CONFLICT (user_id) DO UPDATE SET avatar_path = 'avatars/test.png';

-- Verify
SELECT user_id, display_name, avatar_path 
FROM public.user_profiles 
WHERE avatar_path = 'avatars/test.png'
LIMIT 5;
```

Should successfully insert/update a record.

## If Problem Persists After 15 Minutes

### Check 1: Verify RLS Policies Allow This Column

```sql
-- View all policies on user_profiles
SELECT schemaname, tablename, policyname, qual, with_check, cmd
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
```

The policies should either:
- Use `SELECT *` (allows all columns)
- Explicitly list `avatar_path` in the policy condition

### Check 2: Look for Policy Issues

```sql
-- If a policy restricts columns, it needs to include avatar_path
-- For example, a correct UPSERT policy would be:
-- CREATE POLICY "Allow users to update own profile"
-- ON user_profiles FOR UPDATE
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- Check what's in your current policies:
\d user_profiles
```

### Check 3: Check Supabase Logs for More Info

1. Go to Dashboard → Logs → API requests
2. Filter by recent timestamps
3. Look for requests to `user_profiles` endpoint
4. Check for any `PGRST204` errors
5. Note the exact request/response details

### Check 4: Force Full PostgREST Rebuild

**Last resort** - restart the database connection:

1. Dashboard → Project Settings → Database
2. Check the status indicator
3. If available, click "Restart" or toggle network setting
4. Wait for connection to re-establish
5. This forces PostgREST to rebuild entire schema

## Prevention for Future Changes

When modifying the `user_profiles` table:

1. **Always use Supabase SQL Editor** (not direct postgres client)
2. **Test immediately after** with a SELECT query
3. **Wait 30-60 seconds** before testing from the app
4. **Check schema cache** with verification queries
5. **Document** the change in SQL comments

## Key Files

| File | Purpose |
|------|---------|
| `sql/fix_avatar_path_column.sql` | The fix SQL to run |
| `sql/create_user_profiles.sql` | Original table definition |
| `sql/migrate_user_profiles_to_snake_case.sql` | Column naming migration |
| `api/users.ts` | Code using avatar_path (lines 95-140) |
| `components/UserProfilePage.tsx` | UI that saves avatar (line 244) |

## Timeline of Resolution

| Time | Action | Expected State |
|------|--------|-----------------|
| T+0 | Run SQL fix | Column verified as existing |
| T+0:30 | Close/reopen browser | Client cache cleared |
| T+5 | Check console | No errors visible |
| T+10 | Try avatar upload | Success or cached error |
| T+15 | If error persists, check logs | Clear problem diagnosis |

## Technical Background

**Why This Happens:**
- PostgREST maintains an in-memory schema cache
- It's refreshed from PostgreSQL at startup and periodically
- When you ALTER a table, the PostgreSQL schema changes immediately
- But PostgREST might not refresh its cache for 5-10 minutes
- This creates a window where the column exists but PostgREST doesn't know about it

**Error Code PGRST204:**
- "Could not find X column in schema cache"
- Not a database error - the column DOES exist in database
- It's an API-layer error - PostgREST doesn't know about it yet

**Why Webhooks Work:**
- Toggling webhooks signals to Supabase that schema might have changed
- Forces PostgREST to rebuild its cache from PostgreSQL
- Takes about 2-5 seconds to complete

## Success Criteria

Your fix is complete when:

1. ✅ No `PGRST204` errors in browser console
2. ✅ Avatar upload completes without database errors
3. ✅ User profile saves successfully with `avatar_path` value
4. ✅ Database query returns rows with non-null `avatar_path`

---

**Last Updated**: November 25, 2025
**Status**: Debugging Guide - Execute steps above to resolve
