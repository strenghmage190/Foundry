-- Script de diagnóstico: verificar campanhas e códigos de convite
-- Execute no Supabase SQL Editor para ver os dados

-- 1. Ver todas as campanhas e seus códigos de convite
SELECT 
  id,
  name,
  gm_id,
  invite_code,
  created_at
FROM public.campaigns
ORDER BY created_at DESC;

-- 2. Verificar o tipo de dado da coluna invite_code
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'campaigns'
  AND column_name = 'invite_code';

-- 3. Testar busca por código específico (substitua CODIGO_AQUI pelo código real)
-- SELECT * FROM public.campaigns WHERE invite_code = 'CODIGO_AQUI';
