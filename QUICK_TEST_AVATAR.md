# 🔧 Quick Test - Avatar Upload

## Passo a Passo Simples

### 1️⃣ Prepare
- [ ] Abra `http://localhost:3001`
- [ ] Faça login
- [ ] Abra DevTools: **F12**
- [ ] Vá para aba **Console**

### 2️⃣ Teste Upload
- [ ] Clique no avatar (circulo vazio)
- [ ] Selecione uma imagem JPG ou PNG (~1-2 MB)
- [ ] **Esperado no Console**:
  ```
  [UserProfilePage] Uploading avatar: user123/user123_1234567890.jpg
  [UserProfilePage] Avatar uploaded, saving to database
  [UserProfilePage] ✓ DB save succeeded
  [UserProfilePage] ✓ Avatar successfully saved to DB
  ```

### 3️⃣ Verifique Visual
- [ ] O avatar deve aparecer imediatamente (circular com a foto)
- [ ] Se houver mensagem de erro em vermelho, copie-a

### 4️⃣ Teste Persistência
- [ ] Recarregue a página: **F5**
- [ ] **Esperado no Console**:
  ```
  [UserProfilePage] Loading profile from DB
  [getUserProfile] Successfully loaded profile for user
  [UserProfilePage] avatarPath: user123/user123_1234567890.jpg
  [UserProfilePage] Avatar URL generated
  ```
- [ ] O avatar deve estar lá novamente

### ✅ Sucesso
Se chegou até aqui, o bug foi corrigido!

### ❌ Se Falhar

**Procure no Console por**:
- `❌ [upsertUserProfile] Database error`
  → Problema com banco de dados / RLS
- `⚠️ [UserProfilePage] DB save FAILED`
  → Falha na salva, usando localStorage
- Sem erro mas avatar desaparece após recarregar
  → Problema no carregamento do banco

**Copie EXATAMENTE**:
1. A mensagem de erro completa do console
2. O seu user_id (procure por "user" nos logs)
3. O caminho do arquivo enviado

---

## Checklist Final

Se tudo funciona, verifique:
- [ ] Avatar aparece após upload
- [ ] Avatar persiste após recarregar
- [ ] Console mostra logs de sucesso (✓)
- [ ] Não há erros vermelhos no console
- [ ] O botão "Salvar Perfil" funciona sem erros

---

## Debug Button (só em dev)

Você verá um botão "Debug" ao lado de "Salvar Perfil".

Clique nele para ver:
```
[DEBUG] Current profile state: { avatarPath: "..." }
[DEBUG] Avatar path: "user123/user123_1234567890.jpg"
[DEBUG] localStorage: { avatarPath: "..." }
```

Os dados devem ser idênticos em ambos os locais.
