-- ============================================
-- SCRIPT DE LIMPEZA COMPLETA
-- ============================================
-- Este script REMOVE TODAS as políticas antigas
-- Execute PRIMEIRO antes de criar as novas
-- ============================================

-- LIMPAR POLÍTICAS DA TABELA: campaigns
-- ============================================
drop policy if exists "ALL" on public.campaigns;
drop policy if exists "Campaigns: select by invite_code" on public.campaigns;
drop policy if exists "Campaigns: update by gm" on public.campaigns;
drop policy if exists "DELETE" on public.campaigns;
drop policy if exists "Insert" on public.campaigns;
drop policy if exists "Select" on public.campaigns;
drop policy if exists "UPDATE" on public.campaigns;
drop policy if exists "Campaigns: allow insert for owner" on public.campaigns;
drop policy if exists "Campaigns: allow select for owner" on public.campaigns;
drop policy if exists "Campaigns: allow update for owner" on public.campaigns;
drop policy if exists "Campaigns: allow delete for owner" on public.campaigns;

-- LIMPAR POLÍTICAS DA TABELA: campaign_players
-- ============================================
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

-- ============================================
-- RESULTADO:
-- ============================================
-- Todas as políticas antigas foram removidas
-- Agora execute os arquivos na ordem:
-- 1. campaign_invite_policies.sql
-- 2. campaign_players_policies.sql
-- ============================================
