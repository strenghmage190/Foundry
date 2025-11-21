-- ============================================================
-- SISTEMA DE CAMINHOS SECRETOS
-- ============================================================
-- Permite controlar quais usuários ou agentes podem ver caminhos ocultos
-- baseado nas permissões existentes (can_create_pathways, max_pathways)

-- 1. Tabela para rastrear caminhos secretos e seus acessos
CREATE TABLE IF NOT EXISTS secret_pathway_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_name text NOT NULL UNIQUE, -- Nome exato do caminho (ex: 'CAMINHO DO ÉON ETERNO')
  is_secret boolean NOT NULL DEFAULT true,
  -- Listas de acesso explícito
  allowed_user_ids uuid[] DEFAULT array[]::uuid[], -- UUIDs de auth.users
  allowed_agent_ids integer[] DEFAULT array[]::integer[], -- IDs numéricos da tabela agents
  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_secret_pathway_name ON secret_pathway_access(pathway_name);
CREATE INDEX IF NOT EXISTS idx_secret_pathway_is_secret ON secret_pathway_access(is_secret);

-- 2. Função para verificar se usuário pode ver um caminho secreto
CREATE OR REPLACE FUNCTION can_user_see_secret_pathway(
  p_pathway_name text,
  p_user_id uuid DEFAULT NULL,
  p_agent_id integer DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_is_secret boolean;
  v_user_allowed boolean := false;
  v_agent_allowed boolean := false;
  v_has_global_permission boolean := false;
BEGIN
  -- Se user_id não fornecido, usa o atual
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  -- Verifica se o caminho é secreto
  SELECT is_secret INTO v_is_secret
  FROM secret_pathway_access
  WHERE pathway_name = p_pathway_name;

  -- Se não encontrou registro ou não é secreto, libera
  IF v_is_secret IS NULL OR v_is_secret = false THEN
    RETURN true;
  END IF;

  -- Verifica se usuário está na lista de permitidos
  SELECT p_user_id = ANY(allowed_user_ids) INTO v_user_allowed
  FROM secret_pathway_access
  WHERE pathway_name = p_pathway_name;

  IF v_user_allowed THEN
    RETURN true;
  END IF;

  -- Se agent_id fornecido, verifica lista de agentes
  IF p_agent_id IS NOT NULL THEN
    SELECT p_agent_id = ANY(allowed_agent_ids) INTO v_agent_allowed
    FROM secret_pathway_access
    WHERE pathway_name = p_pathway_name;

    IF v_agent_allowed THEN
      RETURN true;
    END IF;
  END IF;

  -- Acesso negado
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. View para listar caminhos visíveis ao usuário atual
CREATE OR REPLACE VIEW user_visible_pathways AS
SELECT 
  spa.pathway_name,
  spa.is_secret,
  can_user_see_secret_pathway(spa.pathway_name, auth.uid()) as can_access
FROM secret_pathway_access spa
WHERE can_user_see_secret_pathway(spa.pathway_name, auth.uid()) = true
UNION ALL
-- Inclui caminhos não registrados como secretos (público por padrão)
SELECT 
  NULL as pathway_name,
  false as is_secret,
  true as can_access;

-- 4. Inserir os caminhos secretos existentes
INSERT INTO secret_pathway_access (pathway_name, is_secret, allowed_user_ids, allowed_agent_ids)
VALUES 
  ('CAMINHO DO ÉON ETERNO', true, array[]::uuid[], array[]::integer[]),
  ('CAMINHO DO VÉU', true, array[]::uuid[], array[]::integer[])
ON CONFLICT (pathway_name) DO NOTHING;

-- 5. Função helper para adicionar acesso a um usuário
CREATE OR REPLACE FUNCTION grant_secret_pathway_access(
  p_pathway_name text,
  p_user_id uuid DEFAULT NULL,
  p_agent_id integer DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    UPDATE secret_pathway_access
    SET 
      allowed_user_ids = array_append(allowed_user_ids, p_user_id),
      updated_at = now()
    WHERE pathway_name = p_pathway_name
      AND NOT (p_user_id = ANY(allowed_user_ids));
  END IF;

  IF p_agent_id IS NOT NULL THEN
    UPDATE secret_pathway_access
    SET 
      allowed_agent_ids = array_append(allowed_agent_ids, p_agent_id),
      updated_at = now()
    WHERE pathway_name = p_pathway_name
      AND NOT (p_agent_id = ANY(allowed_agent_ids));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função helper para remover acesso
CREATE OR REPLACE FUNCTION revoke_secret_pathway_access(
  p_pathway_name text,
  p_user_id uuid DEFAULT NULL,
  p_agent_id integer DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    UPDATE secret_pathway_access
    SET 
      allowed_user_ids = array_remove(allowed_user_ids, p_user_id),
      updated_at = now()
    WHERE pathway_name = p_pathway_name;
  END IF;

  IF p_agent_id IS NOT NULL THEN
    UPDATE secret_pathway_access
    SET 
      allowed_agent_ids = array_remove(allowed_agent_ids, p_agent_id),
      updated_at = now()
    WHERE pathway_name = p_pathway_name;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- EXEMPLOS DE USO
-- ============================================================

-- Conceder acesso ao Caminho do Éon Eterno para um usuário específico:
-- SELECT grant_secret_pathway_access('CAMINHO DO ÉON ETERNO', 'uuid-do-usuario');

-- Conceder acesso ao Caminho do Véu para um agente específico:
-- SELECT grant_secret_pathway_access('CAMINHO DO VÉU', NULL, 123);

-- Verificar se usuário atual pode ver um caminho:
-- SELECT can_user_see_secret_pathway('CAMINHO DO ÉON ETERNO');

-- Remover acesso:
-- SELECT revoke_secret_pathway_access('CAMINHO DO ÉON ETERNO', 'uuid-do-usuario');

-- Listar todos os acessos configurados:
-- SELECT * FROM secret_pathway_access;

-- Ver quais caminhos o usuário atual pode acessar:
-- SELECT * FROM user_visible_pathways;

-- ============================================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- ============================================================
-- Descomente se quiser proteger a tabela com RLS

-- ALTER TABLE secret_pathway_access ENABLE ROW LEVEL SECURITY;

-- -- Apenas admins/GMs podem gerenciar acessos
-- CREATE POLICY admin_manage_secret_pathways ON secret_pathway_access
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_permissions
--       WHERE user_id = auth.uid() 
--       AND can_create_pathways = true
--     )
--   );

-- -- Usuários comuns podem apenas consultar (não modificar)
-- CREATE POLICY users_view_own_access ON secret_pathway_access
--   FOR SELECT
--   USING (
--     can_user_see_secret_pathway(pathway_name, auth.uid())
--   );
