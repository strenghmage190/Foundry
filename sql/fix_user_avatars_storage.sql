-- Configuração completa do bucket user-avatars
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar o bucket se não existir (público para leitura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;

-- 3. Criar políticas corretas

-- Permitir que qualquer um LEIA os avatares (bucket público)
CREATE POLICY "Public read access to user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- Permitir que usuários autenticados INSIRAM avatares na sua própria pasta
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários autenticados ATUALIZEM seus próprios avatares
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários autenticados DELETEM seus próprios avatares
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Verificar se as políticas foram criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
