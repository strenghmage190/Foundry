-- ============================================================
-- ADICIONAR PERMISSÕES DE CAMINHOS SECRETOS EM USER_PERMISSIONS
-- ============================================================
-- Adiciona colunas booleanas para controlar acesso aos caminhos Aeon e Véu

-- 1. Adicionar colunas para os caminhos secretos
ALTER TABLE user_permissions 
ADD COLUMN IF NOT EXISTS can_see_pathway_aeon boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS can_see_pathway_veu boolean DEFAULT false;

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN user_permissions.can_see_pathway_aeon IS 'Permite acesso ao Caminho do Éon Eterno (caminho secreto)';
COMMENT ON COLUMN user_permissions.can_see_pathway_veu IS 'Permite acesso ao Caminho do Véu (caminho secreto)';

-- ============================================================
-- EXEMPLOS DE USO
-- ============================================================

-- Conceder acesso ao Caminho do Éon para um usuário específico:
-- UPDATE user_permissions 
-- SET can_see_pathway_aeon = true 
-- WHERE user_id = 'uuid-do-usuario';

-- Conceder acesso ao Caminho do Véu para um usuário específico:
-- UPDATE user_permissions 
-- SET can_see_pathway_veu = true 
-- WHERE user_id = 'uuid-do-usuario';

-- Conceder ambos os caminhos:
-- UPDATE user_permissions 
-- SET can_see_pathway_aeon = true, can_see_pathway_veu = true 
-- WHERE user_id = 'uuid-do-usuario';

-- Ver quem tem acesso aos caminhos secretos:
-- SELECT 
--   up.user_id,
--   au.email,
--   up.can_see_pathway_aeon,
--   up.can_see_pathway_veu
-- FROM user_permissions up
-- LEFT JOIN auth.users au ON au.id = up.user_id
-- WHERE up.can_see_pathway_aeon = true OR up.can_see_pathway_veu = true;

-- Remover acesso:
-- UPDATE user_permissions 
-- SET can_see_pathway_aeon = false, can_see_pathway_veu = false 
-- WHERE user_id = 'uuid-do-usuario';
