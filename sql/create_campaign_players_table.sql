-- Criar tabela campaign_players se não existir
-- Execute este SQL no Supabase SQL Editor

-- Criar a tabela campaign_players
CREATE TABLE IF NOT EXISTS public.campaign_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Constraint: cada jogador pode aparecer apenas uma vez por campanha
  UNIQUE(campaign_id, player_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_campaign_players_campaign_id 
  ON public.campaign_players(campaign_id);
  
CREATE INDEX IF NOT EXISTS idx_campaign_players_player_id 
  ON public.campaign_players(player_id);

CREATE INDEX IF NOT EXISTS idx_campaign_players_agent_id 
  ON public.campaign_players(agent_id);

-- Comentários para documentação
COMMENT ON TABLE public.campaign_players IS 'Vincula jogadores e seus personagens (agents) às campanhas';
COMMENT ON COLUMN public.campaign_players.player_id IS 'ID do usuário jogador (pode ser null para NPCs)';
COMMENT ON COLUMN public.campaign_players.agent_id IS 'ID do personagem/agente vinculado (pode ser null se ainda não escolheu)';
