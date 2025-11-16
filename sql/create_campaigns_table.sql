-- Create campaigns table and RLS policies for Supabase

-- Extension for gen_random_uuid (pgcrypto) is usually available in Supabase
create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  gm_id uuid references auth.users(id) not null,
  invite_code uuid,
  players jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.campaigns enable row level security;

-- INSERT: only allow authenticated users to create campaigns where gm_id = auth.uid()
create policy "Campaigns: allow insert for owner" 
  on public.campaigns
  for insert
  to authenticated
  with check (gm_id = auth.uid());

-- SELECT: only allow the gm (owner) to view their campaigns
create policy "Campaigns: allow select for owner"
  on public.campaigns
  for select
  to authenticated
  using (gm_id = auth.uid());

-- UPDATE: only allow the gm to update their campaigns and prevent changing gm_id
create policy "Campaigns: allow update for owner"
  on public.campaigns
  for update
  to authenticated
  using (gm_id = auth.uid())
  with check (gm_id = auth.uid());

-- DELETE: only allow the gm to delete their campaigns
create policy "Campaigns: allow delete for owner"
  on public.campaigns
  for delete
  to authenticated
  using (gm_id = auth.uid());

-- Notes:
-- 1) Run this SQL in your Supabase SQL editor to create the table and policies.
-- 2) If you need an admin or service role to bypass RLS, use a separate policy or run actions using the service_role key.
-- 3) The `players` column is jsonb to store simple arrays of { userId, agentId } objects; you can normalize that into a separate table later if needed.
