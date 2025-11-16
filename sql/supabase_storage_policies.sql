-- SQL: supabase_storage_policies.sql
-- Example Row Level Security policies for Supabase Storage `storage.objects` table
-- These examples scope access to objects by `bucket_id` and `metadata->>'user_id'`.
-- Adjust metadata keys and bucket names to match your upload logic.

-- Enable RLS on storage.objects (be cautious; this affects all buckets)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow users to read objects in the `user-avatars` bucket that they own
CREATE POLICY "Users can read own user-avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

-- Allow users to insert objects into `user-avatars` only when the metadata indicates their uid
CREATE POLICY "Users can insert own user-avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

-- Allow update/delete for own `user-avatars` objects
CREATE POLICY "Users can update own user-avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  ) WITH CHECK (
    bucket_id = 'user-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

CREATE POLICY "Users can delete own user-avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

-- Repeat similar policies for `agent-avatars` if agents are user-owned and uploads include user_id metadata.
CREATE POLICY "Users can read own agent-avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'agent-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

CREATE POLICY "Users can insert own agent-avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agent-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

CREATE POLICY "Users can update own agent-avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'agent-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  ) WITH CHECK (
    bucket_id = 'agent-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

CREATE POLICY "Users can delete own agent-avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'agent-avatars' AND (metadata->>'user_id')::uuid = auth.uid()
  );

-- Important notes:
-- 1) The object metadata must include a `user_id` property when uploading, e.g.:
--    const { data, error } = await supabase.storage.from('user-avatars').upload(path, file, {
--      cacheControl: '3600',
--      upsert: true,
--      metadata: { user_id: supabase.auth.user()?.id }
--    });
-- 2) If you generate signed URLs server-side (service role), the signed URL bypasses RLS.
-- 3) Test policies carefully on a dev project before enabling on production.
