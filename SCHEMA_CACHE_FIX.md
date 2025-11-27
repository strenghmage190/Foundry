# Schema Cache Fix: avatar_path Column Error

## Error Details
```
Could not find the 'avatar_path' column of 'user_profiles' in the schema cache
```

This occurs when Supabase's PostgREST API schema cache is out of sync with the actual database schema.

## Root Causes
1. Column was added to database but schema cache wasn't refreshed
2. RLS policies don't explicitly allow the column
3. Supabase internal schema cache is stale

## Solutions (Try in Order)

### Solution 1: Run the SQL Fix (IMMEDIATE)
Execute `sql/fix_avatar_path_column.sql` in Supabase SQL Editor:
- Ensures `avatar_path` column exists
- Adds proper documentation
- Verifies column presence

### Solution 2: Refresh Supabase Schema Cache (CRITICAL)
After running the SQL, refresh the schema cache:

**Option A: Toggle Webhooks (Easiest)**
1. Go to Supabase Dashboard → Database → Webhooks
2. Find any webhook for `user_profiles` table
3. Toggle the webhook OFF
4. Wait 2 seconds
5. Toggle the webhook back ON
6. This forces schema cache refresh

**Option B: Direct API Call**
```bash
# This forces Supabase to rebuild schema cache
curl -X POST https://[PROJECT_ID].supabase.co/rest/v1/rpc/pg_catalog.refresh_materialized_view \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

**Option C: Restart Database Connection**
1. Go to Supabase Dashboard → Database → Network
2. Note the current connection status
3. Wait 30-60 seconds
4. Test connection - it forces a reset

**Option D: Wait and Retry**
Sometimes the cache automatically refreshes within 5-10 minutes.

### Solution 3: Verify Column Exists
Run this query in Supabase SQL Editor to confirm:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'avatar_path';
```

Expected output:
| column_name | data_type | is_nullable |
|------------|-----------|------------|
| avatar_path | text | YES |

### Solution 4: Check RLS Policies
Verify that `avatar_path` is accessible via RLS policies:

```sql
SELECT *
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
```

If policies exist and use `SELECT *` or explicitly include `avatar_path`, they're correct.

### Solution 5: Reset PostgREST Service
In Supabase Dashboard:
1. Go to Project Settings → API
2. Under PostgREST, look for "Reset PostgREST"
3. Click to rebuild PostgREST's schema cache

## Testing After Fix

### Frontend Console Test
Open browser dev tools and try saving avatar path:
```javascript
// Check if error still occurs
fetch('/.netlify/functions/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'test-id',
    avatar_path: 'avatars/test.png'
  })
})
```

### Database Query Test
```sql
-- Insert test record
INSERT INTO public.user_profiles (user_id, display_name, avatar_path)
VALUES ('65da2a01-03c9-4d1f-b6c2-30b70a4f69f9', 'Test User', 'avatars/test.png')
ON CONFLICT (user_id) DO UPDATE SET avatar_path = 'avatars/test.png';

-- Verify
SELECT user_id, display_name, avatar_path 
FROM public.user_profiles 
WHERE user_id = '65da2a01-03c9-4d1f-b6c2-30b70a4f69f9';
```

## Prevention

### For Future Migrations
1. **Always run migrations through Supabase SQL Editor** (not directly to postgres)
2. **Test schema cache** immediately after ALTER TABLE statements
3. **Add comments** to new columns for clarity
4. **Update RLS policies** if adding new sensitive columns
5. **Document in README** any schema changes

### For Production
1. Schedule maintenance window before major schema changes
2. Have rollback plan (previous column name in comments)
3. Test on staging database first
4. Monitor PostgREST logs for schema errors

## File References
- Migration: `sql/fix_avatar_path_column.sql`
- Related: `sql/migrate_user_profiles_to_snake_case.sql`
- API Usage: `api/users.ts` (lines 100-140)
- Test Page: `components/UserProfilePage.tsx` (line 244)

## Additional Resources
- [Supabase Schema Caching Docs](https://supabase.com/docs/guides/api/rest/debugging)
- [PostgREST Schema Cache](https://postgrest.org/en/stable/how-it-works.html#schema-caching)
- [RLS Policy Debugging](https://supabase.com/docs/guides/auth/row-level-security)
