-- Corrigir políticas RLS de agents para permitir visualização de personagens da mesma campanha
-- Execute este SQL no Supabase

-- 1. Remover a política antiga muito restritiva
DROP POLICY IF EXISTS "Users can view their own agents" ON public.agents;

-- 2. Criar nova política que permite:
--    - Ver seus próprios agentes
--    - Ver agentes vinculados às campanhas que você participa (como jogador)
--    - GM pode ver TODOS os agentes de suas campanhas
CREATE POLICY "Users can view own or campaign agents" ON public.agents
  FOR SELECT
  TO authenticated
  USING (
    -- Pode ver seus próprios agentes
    auth.uid() = user_id
    OR
    auth.uid() = created_by
    OR
    -- GM pode ver TODOS os agentes vinculados às suas campanhas
    EXISTS (
      SELECT 1 FROM public.campaign_players cp
      INNER JOIN public.campaigns c ON cp.campaign_id = c.id
      WHERE cp.agent_id = agents.id
      AND c.gm_id = auth.uid()
    )
    OR
    -- Jogador pode ver agentes das campanhas onde ele está
    EXISTS (
      SELECT 1 FROM public.campaign_players cp1
      INNER JOIN public.campaign_players cp2 ON cp1.campaign_id = cp2.campaign_id
      WHERE cp1.agent_id = agents.id
      AND cp2.player_id = auth.uid()
    )
  );

-- As políticas de INSERT, UPDATE e DELETE permanecem inalteradas
-- (cada usuário só pode criar/editar/deletar seus próprios agentes)
