-- ============================================================
-- ROLLBACK: REMOVER SISTEMA DE CAMINHOS SECRETOS
-- ============================================================
-- Este script remove todas as tabelas, funções e views criadas
-- pelo sistema de caminhos secretos

-- 1. Remover políticas RLS (se foram criadas)
DROP POLICY IF EXISTS admin_manage_secret_pathways ON secret_pathway_access;
DROP POLICY IF EXISTS users_view_own_access ON secret_pathway_access;

-- 2. Remover view
DROP VIEW IF EXISTS user_visible_pathways;

-- 3. Remover funções
DROP FUNCTION IF EXISTS can_user_see_secret_pathway(text, uuid, integer);
DROP FUNCTION IF EXISTS grant_secret_pathway_access(text, uuid, integer);
DROP FUNCTION IF EXISTS revoke_secret_pathway_access(text, uuid, integer);

-- 4. Remover tabela
DROP TABLE IF EXISTS secret_pathway_access;

-- 5. Remover índices (são removidos automaticamente com a tabela, mas listamos para clareza)
-- DROP INDEX IF EXISTS idx_secret_pathway_name;
-- DROP INDEX IF EXISTS idx_secret_pathway_is_secret;

-- ============================================================
-- Confirmação
-- ============================================================
-- SELECT 'Sistema de caminhos secretos removido com sucesso!' as status;
