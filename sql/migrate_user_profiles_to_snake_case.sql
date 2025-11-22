-- Migration: normalize user_profiles column names to snake_case
-- Run ONLY if current columns are camelCase (check with information_schema first)
-- Existing columns detected (example): displayName, avatarPath, useOpenDyslexicFont, pronouns, highlight_color
-- After migration: display_name, avatar_path, use_open_dyslexic_font, pronouns (unchanged), highlight_color (already snake_case)

BEGIN;

-- Safety check (optional): raise notice of existing columns
DO $$
DECLARE
  has_displayName boolean;
  has_avatarPath boolean;
  has_useOpenDyslexicFont boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='displayName'
  ) INTO has_displayName;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='avatarPath'
  ) INTO has_avatarPath;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='useOpenDyslexicFont'
  ) INTO has_useOpenDyslexicFont;
  RAISE NOTICE 'displayName exists: % / avatarPath exists: % / useOpenDyslexicFont exists: %', has_displayName, has_avatarPath, has_useOpenDyslexicFont;
END $$;

-- Rename columns if they exist
ALTER TABLE public.user_profiles
  RENAME COLUMN IF EXISTS "displayName" TO display_name;
ALTER TABLE public.user_profiles
  RENAME COLUMN IF EXISTS "avatarPath" TO avatar_path;
ALTER TABLE public.user_profiles
  RENAME COLUMN IF EXISTS "useOpenDyslexicFont" TO use_open_dyslexic_font;

-- Ensure highlight_color exists (already should) with default
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS highlight_color text DEFAULT '#8b5cf6';

-- OPTIONAL: add comments for clarity
COMMENT ON COLUMN public.user_profiles.display_name IS 'User display name';
COMMENT ON COLUMN public.user_profiles.avatar_path IS 'Path in storage bucket user-avatars';
COMMENT ON COLUMN public.user_profiles.use_open_dyslexic_font IS 'Accessibility font preference';
COMMENT ON COLUMN public.user_profiles.highlight_color IS 'Preferred highlight color';

COMMIT;

-- Verification query
SELECT column_name
FROM information_schema.columns
WHERE table_name='user_profiles' AND table_schema='public'
ORDER BY ordinal_position;
