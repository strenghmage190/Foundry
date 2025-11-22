# 🔧 Configuração do Supabase Storage - CRÍTICO

## Problema

Os buckets não estão acessíveis publicamente, causando erro 400 ao tentar gerar URLs.

---

## Solução: Configurar Buckets como Públicos

### Passo 1: Acessar Supabase

1. Abra https://app.supabase.com
2. Selecione seu projeto (`BeyondersSite`)
3. Vá para **Storage** no menu esquerdo

---

### Passo 2: Configurar `user-avatars` Bucket

#### Se o bucket NÃO existe:
1. Clique em **Create a new bucket**
2. Nome: `user-avatars`
3. **MARQUE**: "Public bucket" ✅
4. Clique em **Create bucket**

#### Se o bucket JÁ existe:
1. Clique no bucket `user-avatars`
2. Clique em **Settings** (ícone de engrenagem)
3. **MARQUE**: "Public bucket" ✅
4. Clique em **Save**

---

### Passo 3: Configurar `agent-avatars` Bucket

Repita o Passo 2, mas para o bucket `agent-avatars`:

1. Nome: `agent-avatars`
2. **MARQUE**: "Public bucket" ✅

---

### Passo 4: Verificar Políticas RLS (Row Level Security)

Ambos os buckets precisam permitir **leitura pública**, mas **upload restrito**.

No Supabase SQL Editor, execute:

```sql
-- Para user-avatars
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-avatars' AND auth.uid()::text = owner);

-- Para agent-avatars
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'agent-avatars');

CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'agent-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'agent-avatars' AND auth.uid()::text = owner);
```

---

## Verificar se Funcionou

### Teste Simples

Após configurar, recarregue a página:

```
http://localhost:3001
```

Nos logs do console, você deve ver:

```
[UserProfilePage] ✓ Avatar URL generated
```

E NÃO deve ver:

```
400 Bad Request
```

---

## Se ainda não funcionar

Execute no Supabase SQL Editor:

```sql
-- Verificar buckets
SELECT id, name, public FROM storage.buckets;
```

Resultado esperado:
```
| id              | name           | public |
|-----------------|----------------|--------|
| user-avatars    | user-avatars   | true   |
| agent-avatars   | agent-avatars  | true   |
```

Se `public` for `false`, execute:

```sql
UPDATE storage.buckets SET public = true WHERE id = 'user-avatars';
UPDATE storage.buckets SET public = true WHERE id = 'agent-avatars';
```

---

## Resultado Esperado

Depois dessas mudanças:

✅ Fotos de perfil aparecem e salvam  
✅ Avatares de personagem aparecem e salvam  
✅ Sem erro 400 no console  
✅ URLs públicas funcionam

---

## Próximas Ações

1. Configure os buckets conforme acima
2. Recarregue a página (`F5`)
3. Teste o upload de avatar novamente
4. Reporte se funcionou ✅ ou se ainda tem erro ❌
