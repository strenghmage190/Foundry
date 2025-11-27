# Quick Fix Checklist: avatar_path Column Error

## Immediate Actions (Do These Now)

- [ ] **Step 1: Run SQL Fix**
  - Open Supabase SQL Editor
  - Copy & paste contents of `sql/fix_avatar_path_column.sql`
  - Click "Run" and wait for success message
  - You should see: `avatar_path_exists: true`

- [ ] **Step 2: Refresh Supabase Schema Cache**
  
  **FASTEST METHOD:**
  - Go to Supabase Dashboard → your project
  - Click "Database" in left sidebar
  - Click "Webhooks" 
  - If you have any webhooks on `user_profiles` table:
    - Toggle the webhook OFF
    - Wait 2 seconds
    - Toggle back ON
  - **OR** simply wait 30 seconds - cache auto-refreshes
  
  **ALTERNATIVE (If No Webhooks):**
  - Go to Project Settings → API
  - Under "PostgREST" section, look for schema cache info
  - Try refreshing the page (F5) to force client cache refresh

- [ ] **Step 3: Verify Column Exists**
  - In Supabase SQL Editor, run:
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'user_profiles' 
  AND column_name = 'avatar_path';
  ```
  - Should return one row with `avatar_path | text`

- [ ] **Step 4: Test in App**
  - Go to UserProfilePage in app
  - Try to upload/save an avatar
  - Check browser console for the error
  - If error persists after 5 minutes, check logs again

## If Problem Persists

1. **Check RLS Policies** in SQL Editor:
   ```sql
   SELECT policyname, qual, with_check 
   FROM pg_policies 
   WHERE tablename = 'user_profiles';
   ```

2. **Force Full Cache Refresh**:
   - Go to Project Settings → Database
   - Toggle "Network mode" or restart (if available)
   - Or wait 10-15 minutes for cache to auto-reset

3. **Check API Logs**:
   - Supabase Dashboard → Logs → API requests
   - Filter for `user_profiles` table errors
   - Look for PGRST204 errors after cache refresh

## Documentation Files
- Full guide: `SCHEMA_CACHE_FIX.md`
- SQL Migration: `sql/fix_avatar_path_column.sql`
- API Code: `api/users.ts` (lines ~100-140)
