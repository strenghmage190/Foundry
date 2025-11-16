User profiles migration and storage policies

Files in this folder:
- `create_user_profiles.sql` - creates the `user_profiles` table (includes trigger to update `updated_at`).
- `apply_user_profiles_rls.sql` - enables RLS and creates example policies so users can only operate on their own profile.
- `supabase_storage_policies.sql` - example RLS policies for `storage.objects` to scope avatar uploads to the uploading user.

Quick steps to apply on Supabase:
1) Open the Supabase project SQL editor.
2) Run `create_user_profiles.sql` (or paste its content) to create the table.
3) Run `apply_user_profiles_rls.sql` to enable RLS and add row-level policies for the table.
4) Create buckets via the Storage UI: `user-avatars` and `agent-avatars`.

Creating the buckets (step-by-step)
- Open your Supabase project and go to `Storage` → `Buckets`.
- Click `New bucket` and create a bucket named exactly `user-avatars`.
  - Recommended settings: make it **private** (so uploaded avatars are protected) and enable `Prevent public access` if you plan to use signed URLs.
- Repeat to create `agent-avatars` (used for agent-specific uploads).

If you prefer a public bucket for development, you can set the bucket to public, but production apps should keep avatars private and use signed URLs.

Troubleshooting
- If you see "Bucket not found" in the browser console when uploading, the client is attempting to upload to a bucket that doesn't exist — create it using the steps above.
- If uploads still fail with 400/403 after creating the bucket, check the storage policies in `supabase_storage_policies.sql` and ensure your upload includes `metadata.user_id` when policies expect it.
5) Optionally run `supabase_storage_policies.sql` to add example policies restricting storage access by `metadata->>'user_id'`.

Upload guidance (frontend):
- When uploading an avatar from the client, include the current user's id in object metadata so RLS policies can validate ownership.
  Example (JS):

  const user = supabase.auth.getUser();
  const path = `avatars/${user.id}/avatar-${Date.now()}.png`;
  await supabase.storage.from('user-avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    metadata: { user_id: user.id }
  });

- Save only the storage `path` in `user_profiles.avatar_path`, not the signed URL. Use Supabase Storage `createSignedUrl` when rendering images.

Security notes:
- Signed URLs generated with the service role bypass RLS. Keep the service role key secret.
- Test these policies in a development project before enabling on production.

If you want, I can:
- generate a single SQL file that creates the table + enables RLS + storage policies in one go, ready to run; or
- add example upload helper functions in `api/users.ts` to standardize how `avatar_path` and metadata are written.