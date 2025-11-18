-- Corrigir políticas RLS de user_profiles para permitir visualização entre membros de campanha
-- Execute este SQL no Supabase

-- 1. Remover a política antiga muito restritiva
DROP POLICY IF EXISTS "Select own profile" ON public.user_profiles;

-- 2. Criar nova política que permite:
--    - Ver seu próprio perfil
--    - Ver perfis de jogadores na mesma campanha
CREATE POLICY "Select own or campaign members profiles" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Pode ver seu próprio perfil
    auth.uid() = user_id
    OR
    -- Pode ver perfis de membros das campanhas que você participa
    EXISTS (
      SELECT 1 FROM public.campaign_players cp1
      INNER JOIN public.campaign_players cp2 ON cp1.campaign_id = cp2.campaign_id
      WHERE cp1.player_id = auth.uid()
      AND cp2.player_id = user_profiles.user_id
    )
    OR
    -- Pode ver perfis de jogadores das suas campanhas como GM
    EXISTS (
      SELECT 1 FROM public.campaigns c
      INNER JOIN public.campaign_players cp ON c.id = cp.campaign_id
      WHERE c.gm_id = auth.uid()
      AND cp.player_id = user_profiles.user_id
    )
  );

-- As políticas de INSERT e UPDATE permanecem inalteradas
-- (cada usuário só pode criar/editar seu próprio perfil)
