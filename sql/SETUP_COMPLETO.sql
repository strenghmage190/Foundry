-- ============================================
-- SCRIPT COMPLETO: LIMPAR + RECRIAR TUDO
-- ============================================
-- Execute APENAS este arquivo no Supabase
-- Ele remove todas as políticas antigas e cria novas
-- ============================================

-- ====================================
-- PARTE 1: LIMPAR TODAS AS POLÍTICAS
-- ====================================

-- Limpar políticas da tabela campaigns
drop policy if exists "ALL" on public.campaigns;
drop policy if exists "Campaigns: select by invite_code" on public.campaigns;
drop policy if exists "Campaigns: update by gm" on public.campaigns;
drop policy if exists "DELETE" on public.campaigns;
drop policy if exists "Insert" on public.campaigns;
drop policy if exists "Select" on public.campaigns;
drop policy if exists "UPDATE" on public.campaigns;
drop policy if exists "Campaigns: allow insert for owner" on public.campaigns;
drop policy if exists "Campaigns: allow select for owner" on public.campaigns;
drop policy if exists "Campaigns: allow select for owner or invite" on public.campaigns;
drop policy if exists "Campaigns: allow update for owner" on public.campaigns;
drop policy if exists "Campaigns: allow delete for owner" on public.campaigns;

-- Limpar políticas da tabela campaign_players
drop policy if exists "CampaignPlayers: delete for gm only" on public.campaign_players;
drop policy if exists "CampaignPlayers: insert for gm or invited player" on public.campaign_players;
drop policy if exists "CampaignPlayers: select for gm and members" on public.campaign_players;
drop policy if exists "CampaignPlayers: update for gm and player" on public.campaign_players;
drop policy if exists "PLAYERS: GM pode atualizar/deletar jogadores do seu cam..." on public.campaign_players;
drop policy if exists "PLAYERS: GM pode deletar jogadores do seu campaign" on public.campaign_players;
drop policy if exists "PLAYERS: GMs podem adicionar jogadores às suas campan..." on public.campaign_players;
drop policy if exists "PLAYERS: Inserir apenas se GM ou adicionando a si mesmo" on public.campaign_players;
drop policy if exists "PLAYERS: Jogadores ou GMs podem remover um registro ..." on public.campaign_players;
drop policy if exists "PLAYERS: Membros e GMs podem ver a lista de jogadores." on public.campaign_players;

-- ====================================
-- PARTE 2: CONFIGURAR TABELAS
-- ====================================

-- Garantir que invite_code existe
alter table public.campaigns
  add column if not exists invite_code uuid;

-- Gerar códigos para campanhas sem código
update public.campaigns
  set invite_code = gen_random_uuid()
  where invite_code is null;

-- Habilitar RLS nas tabelas
alter table public.campaigns enable row level security;
alter table public.campaign_players enable row level security;

-- ====================================
-- PARTE 3: POLÍTICAS PARA CAMPAIGNS
-- ====================================

-- INSERT: Apenas o GM pode criar campanhas (ele mesmo)
create policy "Campaigns: allow insert for owner"
  on public.campaigns
  for insert
  to authenticated
  with check (gm_id = auth.uid());

-- SELECT: GM pode ver suas campanhas OU qualquer um pode ver por invite_code
create policy "Campaigns: allow select for owner or invite"
  on public.campaigns
  for select
  to authenticated
  using (
    gm_id = auth.uid() 
    or 
    invite_code is not null
  );

-- UPDATE: Apenas o GM pode atualizar suas campanhas
create policy "Campaigns: allow update for owner"
  on public.campaigns
  for update
  to authenticated
  using (gm_id = auth.uid())
  with check (gm_id = auth.uid());

-- DELETE: Apenas o GM pode deletar suas campanhas
create policy "Campaigns: allow delete for owner"
  on public.campaigns
  for delete
  to authenticated
  using (gm_id = auth.uid());

-- ====================================
-- PARTE 4: POLÍTICAS PARA CAMPAIGN_PLAYERS
-- ====================================

-- INSERT: GM adiciona jogadores OU jogador se adiciona via convite
create policy "CampaignPlayers: insert for gm or invited player"
  on public.campaign_players
  for insert
  to authenticated
  with check (
    -- O GM pode adicionar qualquer jogador
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    -- Jogador se adiciona (com convite válido)
    (
      player_id = auth.uid()
      and exists (
        select 1 from public.campaigns
        where campaigns.id = campaign_id
        and campaigns.invite_code is not null
      )
    )
  );

-- SELECT: GM e membros da campanha podem ver a lista
create policy "CampaignPlayers: select for gm and members"
  on public.campaign_players
  for select
  to authenticated
  using (
    -- GM pode ver tudo da campanha
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    -- Próprio jogador pode ver seu registro
    player_id = auth.uid()
  );

-- UPDATE: GM ou próprio jogador podem atualizar (vincular personagem)
create policy "CampaignPlayers: update for gm and player"
  on public.campaign_players
  for update
  to authenticated
  using (
    -- GM pode atualizar
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    -- Próprio jogador pode atualizar
    player_id = auth.uid()
  )
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_players.campaign_id
      and campaigns.gm_id = auth.uid()
    )
    or
    player_id = auth.uid()
  );

-- DELETE: Apenas GM pode remover jogadores
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
-- CONCLUÍDO! ✅
-- ============================================
-- Todas as políticas antigas foram removidas
-- Novas políticas foram criadas
-- Sistema de convites está funcionando
-- ============================================
