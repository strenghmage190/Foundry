-- Create combat_sessions table
CREATE TABLE IF NOT EXISTS public.combat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'finished')),
  participant_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_combat_sessions_campaign_id ON public.combat_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_combat_sessions_created_by ON public.combat_sessions(created_by);

-- Enable RLS
ALTER TABLE public.combat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Users can see combat sessions for their campaigns
DROP POLICY IF EXISTS "Users can view combat sessions for their campaigns" ON public.combat_sessions;
CREATE POLICY "Users can view combat sessions for their campaigns"
  ON public.combat_sessions
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE gm_id = auth.uid()
    )
  );

-- Policy: GMs can insert combat sessions
DROP POLICY IF EXISTS "GMs can create combat sessions" ON public.combat_sessions;
CREATE POLICY "GMs can create combat sessions"
  ON public.combat_sessions
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE gm_id = auth.uid()
    )
  );

-- Policy: GMs can update their combat sessions
DROP POLICY IF EXISTS "GMs can update combat sessions" ON public.combat_sessions;
CREATE POLICY "GMs can update combat sessions"
  ON public.combat_sessions
  FOR UPDATE
  USING (
    created_by = auth.uid() AND
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE gm_id = auth.uid()
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE gm_id = auth.uid()
    )
  );

-- Policy: GMs can delete their combat sessions
DROP POLICY IF EXISTS "GMs can delete combat sessions" ON public.combat_sessions;
CREATE POLICY "GMs can delete combat sessions"
  ON public.combat_sessions
  FOR DELETE
  USING (
    created_by = auth.uid() AND
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE gm_id = auth.uid()
    )
  );
