-- Adiciona a coluna highlight_color à tabela user_profiles
-- para permitir que usuários escolham sua cor de destaque preferida

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS highlight_color text DEFAULT '#8b5cf6';

-- Comentário descritivo
COMMENT ON COLUMN public.user_profiles.highlight_color IS 'Cor de destaque preferida pelo usuário (formato hex, ex: #8b5cf6)';
