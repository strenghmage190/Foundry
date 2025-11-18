-- ============================================
-- POLÍTICAS RLS PARA SISTEMA DE CONVITES
-- ============================================
-- Este arquivo configura as permissões para:
-- 1. Jogadores verem campanhas via código de convite
-- 2. Apenas o GM atualizar suas campanhas
-- ============================================

-- PASSO 1: Garantir que a coluna invite_code existe
alter table public.campaigns
  add column if not exists invite_code uuid;

-- PASSO 2: Gerar códigos para campanhas que não têm
update public.campaigns
  set invite_code = gen_random_uuid()
  where invite_code is null;

-- PASSO 3: Remover políticas antigas (limpar)
drop policy if exists "Campaigns: select by invite_code" on public.campaigns;
drop policy if exists "Campaigns: update by gm" on public.campaigns;

-- PASSO 4: Criar política para SELECT via invite_code
-- Permite que qualquer usuário autenticado veja campanhas com código de convite
create policy "Campaigns: select by invite_code"
  on public.campaigns
  for select
  to authenticated
  using (invite_code is not null);

-- PASSO 5: Criar política para UPDATE apenas para GM
-- Previne que não-GMs alterem campanhas
create policy "Campaigns: update by gm"
  on public.campaigns
  for update
  to authenticated
  using (gm_id = auth.uid())
  with check (gm_id = auth.uid());

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Copie TODO este arquivo
-- 2. Cole no SQL Editor do Supabase
-- 3. Execute (clique em "Run" ou Ctrl+Enter)
-- 4. Todas as políticas antigas serão removidas e novas criadas
-- ============================================
