-- Corrigir políticas RLS de agents para permitir visualização de personagens da mesma campanha
-- Execute este SQL no Supabase

-- 1. Remover a política antiga muito restritiva
DROP POLICY IF EXISTS "Users can view their own agents" ON public.agents;

-- 2. Criar nova política que permite:
--    - Ver seus próprios agentes
--    - Ver agentes vinculados às campanhas que você participa (públicos ou seus)
--    - GM pode ver todos os agentes de suas campanhas
CREATE POLICY "Users can view own or campaign agents" ON public.agents
  FOR SELECT
  TO authenticated
  USING (
    -- Pode ver seus próprios agentes
    auth.uid() = user_id
    OR
    auth.uid() = created_by
    OR
    -- Pode ver agentes vinculados às campanhas que você participa
    EXISTS (
      SELECT 1 FROM public.campaign_players cp
      WHERE cp.agent_id = agents.id
      AND EXISTS (
        -- Você está na mesma campanha
        SELECT 1 FROM public.campaign_players cp2
        WHERE cp2.campaign_id = cp.campaign_id
        AND cp2.player_id = auth.uid()
      )
    )
    OR
    -- GM pode ver todos os agentes de suas campanhas
    EXISTS (
      SELECT 1 FROM public.campaigns c
      INNER JOIN public.campaign_players cp ON c.id = cp.campaign_id
      WHERE c.gm_id = auth.uid()
      AND cp.agent_id = agents.id
    )
  );

-- As políticas de INSERT, UPDATE e DELETE permanecem inalteradas
-- (cada usuário só pode criar/editar/deletar seus próprios agentes)
