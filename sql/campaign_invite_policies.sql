-- Enable invite-based access to campaigns for authenticated users
-- Run this in Supabase SQL editor.

-- Ensure invite_code exists
alter table public.campaigns
  add column if not exists invite_code uuid;

-- Backfill codes for existing rows without a code
update public.campaigns
  set invite_code = gen_random_uuid()
  where invite_code is null;

-- Allow SELECT of campaigns with an invite_code by any authenticated user
-- This is necessary for the InvitePage to resolve /invite/:code.
-- If you want to restrict exposure, consider exposing only specific columns via a view.
create policy if not exists "Campaigns: select by invite_code"
  on public.campaigns
  for select
  to authenticated
  using (invite_code is not null);

-- Optional: prevent UPDATE to invite_code except by GM
create policy if not exists "Campaigns: update by gm"
  on public.campaigns
  for update
  to authenticated
  using (gm_id = auth.uid())
  with check (gm_id = auth.uid());
