-- Script para corrigir campanhas sem código de convite
-- Execute no Supabase SQL Editor

-- 1. Ver campanhas sem código de convite
SELECT id, name, gm_id, invite_code
FROM public.campaigns
WHERE invite_code IS NULL;

-- 2. Gerar códigos para campanhas que não têm
UPDATE public.campaigns
SET invite_code = gen_random_uuid()
WHERE invite_code IS NULL;

-- 3. Verificar se todas têm código agora
SELECT 
  COUNT(*) as total_campanhas,
  COUNT(invite_code) as com_invite_code,
  COUNT(*) - COUNT(invite_code) as sem_invite_code
FROM public.campaigns;

-- 4. Mostrar todas as campanhas com seus códigos
SELECT 
  id,
  name,
  invite_code,
  CONCAT('http://localhost:5173/invite/', invite_code) as link_convite
FROM public.campaigns
ORDER BY created_at DESC;
