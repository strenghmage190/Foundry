# Avatar Upload Debug Guide

## Como testar o upload de avatar e diagnosticar o problema

### Pré-requisitos
1. Abra o navegador em `http://localhost:3001`
2. Abra o DevTools (F12 ou Ctrl+Shift+I)
3. Vá para a aba "Console" para ver os logs
4. Vá para a aba "Network" para monitorar requisições

### Passos para Testar

#### Passo 1: Verificar Autenticação
```
No console, você deve ver:
[UserProfilePage] Loading profile from DB for user: <seu-user-id>
```

Se vir `No authenticated user`, você precisa estar logado.

#### Passo 2: Enviar a Imagem
1. Clique no botão de upload de avatar
2. Selecione uma imagem (JPG, PNG, etc.)
3. **IMPORTANTE**: Não clique em "Salvar" ainda, apenas selecione a imagem

No console, você deve ver:
```
[UserProfilePage] Uploading avatar: <seu-user-id>/<seu-user-id>_<timestamp>.jpg
[UserProfilePage] Avatar uploaded, saving to database
[UserProfilePage] Updated profile: {
  displayName: "...",
  pronouns: "...",
  avatarPath: "<seu-user-id>/<seu-user-id>_<timestamp>.jpg",
  useOpenDyslexicFont: false,
  highlightColor: "#8b5cf6"
}
[UserProfilePage] Saving to database with avatarPath: <seu-user-id>/<seu-user-id>_<timestamp>.jpg
```

Se vir ERRO aqui, anote a mensagem exata.

#### Passo 3: Verificar Salva no Banco de Dados
Após o upload, você deve ver:
```
[upsertUserProfile] Saving profile for user <seu-user-id>, {
  displayName: "...",
  avatarPath: "<seu-user-id>/<seu-user-id>_<timestamp>.jpg",
  ...
}
[upsertUserProfile] ✓ Successfully saved profile for user <seu-user-id>
```

**Se vir mensagem de erro aqui**, o banco não salvou corretamente:
- Copie a mensagem exata do erro
- Verifique se a tabela `user_profiles` existe no Supabase
- Verifique se as colunas necessárias existem

#### Passo 4: Recarregar a Página
```
F5 ou Ctrl+R para recarregar
```

No console, você deve ver:
```
[UserProfilePage] Loading profile from DB for user <seu-user-id>
[getUserProfile] Successfully loaded profile for user <seu-user-id>: {
  avatarPath: "<seu-user-id>/<seu-user-id>_<timestamp>.jpg",
  ...
}
[UserProfilePage] Successfully loaded from database: { ... }
[UserProfilePage] Generating public URL for avatar: <seu-user-id>/<seu-user-id>_<timestamp>.jpg
[UserProfilePage] Avatar URL generated
```

Se não vir `avatarPath` no perfil carregado, o banco **não salvou** o caminho do arquivo.

### Checklist de Diagnóstico

- [ ] Avatar aparece na prévia ANTES de salvar (sem recarregar página)
- [ ] Console mostra "Successfully saved profile" após enviar
- [ ] Avatar continua visível após recarregar a página
- [ ] Console mostra "avatarPath" quando carrega de novo
- [ ] A URL gerada começa com `https://` (Supabase URL)

### Mensagens de Erro Conhecidas e Soluções

#### "Bucket 'user-avatars' não encontrado"
**Solução**: Crie o bucket no Supabase:
1. Vá para Supabase → Storage → Create new bucket
2. Nome: `user-avatars`
3. Marque como "Public"
4. Salve

#### "Database error"
**Solução**: Verifique a tabela no Supabase:
1. Vá para Supabase → SQL Editor
2. Cole e execute:
```sql
SELECT * FROM user_profiles LIMIT 1;
```
3. Se der erro, execute:
```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY,
  display_name text,
  pronouns text,
  avatar_path text,
  use_open_dyslexic_font boolean DEFAULT false,
  highlight_color text DEFAULT '#8b5cf6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Users can select own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Fluxo Esperado Completo

```
1. Selecionar arquivo → Upload ao Supabase Storage
2. Upload bem-sucedido → Salvar caminho no banco de dados
3. Banco salvou → Atualizar estado local React
4. Estado atualizado → Gerar URL pública
5. URL gerada → Mostrar preview ao usuário
6. Recarregar página → Carregar do banco
7. Carregou do banco → Gerar URL novamente
8. Resultado final → Avatar persiste
```

### Próximas Informações que Preciso

Execute o teste e me envie:
1. **Logs exatos** do console (copie de cada Passo acima)
2. **Erros específicos** que aparecerem
3. **Qual Passo falha** (1, 2, 3 ou 4)
4. **Seu user_id** (aparece nos logs como `user <xxx-xxx-xxx>`)
