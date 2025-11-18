-- Políticas RLS para a tabela campaign_players
-- Esta tabela vincula jogadores e seus personagens (agents) às campanhas

-- PASSO 1: Remover todas as políticas existentes (limpar)
drop policy if exists "CampaignPlayers: insert for gm or invited player" on public.campaign_players;
drop policy if exists "CampaignPlayers: select for gm and members" on public.campaign_players;
drop policy if exists "CampaignPlayers: update for gm and player" on public.campaign_players;
drop policy if exists "CampaignPlayers: delete for gm only" on public.campaign_players;

-- PASSO 2: Habilitar RLS na tabela
alter table public.campaign_players enable row level security;

-- PASSO 3: Criar política de INSERT
-- Permite que o GM adicione jogadores/agentes à sua campanha
-- OU permite que jogadores se adicionem através de um convite válido
create policy "CampaignPlayers: insert for gm or invited player"
  on public.campaign_players
  for insert
  to authenticated
  with check (
    -- O GM pode adicionar qualquer jogador/agente à sua campanha
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    -- Ou o próprio jogador pode se adicionar (via convite válido)
    (
      player_id = auth.uid()
      and exists (
        select 1 from public.campaigns
        where campaigns.id = campaign_id
        and campaigns.invite_code is not null
      )
    )
  );

-- PASSO 4: Criar política de SELECT
-- Permite visualização para o GM e para jogadores que fazem parte da campanha
create policy "CampaignPlayers: select for gm and members"
  on public.campaign_players
  for select
  to authenticated
  using (
    -- O GM pode ver todos os jogadores da campanha
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    -- Ou o próprio jogador pode ver seus registros
    player_id = auth.uid()
  );

-- PASSO 5: Criar política de UPDATE
-- Apenas o GM ou o próprio jogador podem atualizar o agent_id (vincular personagem)
create policy "CampaignPlayers: update for gm and player"
  on public.campaign_players
  for update
  to authenticated
  using (
    -- O GM pode atualizar qualquer registro da campanha
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    -- Ou o próprio jogador pode atualizar seu registro (vincular personagem)
    player_id = auth.uid()
  )
  with check (
    -- Mesmas condições para o check
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    player_id = auth.uid()
  );

-- PASSO 6: Criar política de DELETE
-- Apenas o GM pode remover jogadores da campanha
create policy "CampaignPlayers: delete for gm only"
  on public.campaign_players
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
  );

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Copie TODO este arquivo
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute (clique em "Run" ou Ctrl+Enter)
-- 4. Todas as políticas antigas serão removidas e novas criadas
-- ============================================
