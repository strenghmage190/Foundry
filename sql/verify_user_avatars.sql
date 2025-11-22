-- Verificar e limpar dados de avatares órfãos
-- Execute este SQL para diagnosticar problemas

-- 1. Ver todos os avatares no storage
SELECT 
  name as arquivo,
  created_at,
  updated_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'user-avatars'
ORDER BY created_at DESC
LIMIT 20;

-- 2. Ver avatares na tabela user_profiles
SELECT 
  user_id,
  "displayName",
  "avatarPath",
  created_at
FROM user_profiles
WHERE "avatarPath" IS NOT NULL
ORDER BY created_at DESC;

-- 3. Encontrar avatares órfãos (na tabela mas não no storage)
SELECT 
  up.user_id,
  up."displayName",
  up."avatarPath" as caminho_no_banco,
  CASE 
    WHEN so.name IS NULL THEN 'NÃO EXISTE NO STORAGE'
    ELSE 'EXISTE'
  END as status_storage
FROM user_profiles up
LEFT JOIN storage.objects so ON so.name = up."avatarPath" AND so.bucket_id = 'user-avatars'
WHERE up."avatarPath" IS NOT NULL;

-- 4. OPCIONAL: Limpar referências de avatares que não existem no storage
-- CUIDADO: Execute apenas se tiver certeza
-- UPDATE user_profiles
-- SET "avatarPath" = NULL
-- WHERE "avatarPath" IS NOT NULL
-- AND NOT EXISTS (
--   SELECT 1 FROM storage.objects 
--   WHERE bucket_id = 'user-avatars' 
--   AND name = user_profiles."avatarPath"
-- );
