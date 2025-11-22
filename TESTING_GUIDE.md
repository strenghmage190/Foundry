# 🧪 Guia de Testes - Sistema de Customization

## Testes Manuais Necessários

### 1️⃣ Perfil do Usuário - `UserProfilePage.tsx`

#### Teste 1.1: Carregar Perfil
```
1. Acesse: /user-profile
2. Verifique se o perfil carrega do DB
3. Se offline, deve carregar do localStorage
4. Console deve mostrar "[UserProfilePage] Successfully loaded profile"
```

#### Teste 1.2: Upload de Avatar
```
1. Clique na área de avatar (avatar box)
2. Selecione uma imagem < 5MB
3. Verifique feedback visual de upload
4. Após upload, preview deve aparecer
5. Recargue a página - avatar deve persistir
6. Console deve mostrar "[UserProfilePage] Avatar successfully saved"
```

#### Teste 1.3: Validação de Arquivo
```
1. Tente selecionar arquivo não-imagem (ex: .txt)
2. Deve mostrar erro: "Por favor, selecione um arquivo de imagem válido"
3. Tente selecionar imagem > 5MB
4. Deve mostrar erro: "A imagem deve ter menos de 5MB"
```

#### Teste 1.4: Salvar Perfil
```
1. Preencha Nome de Exibição
2. (Opcional) Preencha Pronomes
3. (Opcional) Mude cor de destaque
4. (Opcional) Ative fonte para dislexia
5. Clique "Salvar Perfil"
6. Verifique se salva em DB
7. Cor deve atualizar globalmente no app
8. Fonte dyslexia deve ser aplicada (class 'open-dyslexic' no body)
```

#### Teste 1.5: Sincronização localStorage
```
1. Desconecte do Supabase (simulate offline)
2. Modifique o perfil
3. Clique salvar
4. Deve salvar em localStorage com mensagem apropriada
5. Reconecte - data deve estar em localStorage
```

---

### 2️⃣ Modal de Customização - `CustomizationModal.tsx`

#### Teste 2.1: Abrir Modal
```
1. Acesse uma ficha de personagem
2. Clique no botão de customização (ícone de paleta)
3. Modal deve abrir com estado sincronizado
4. Console deve mostrar "[CustomizationModal] Modal opened"
```

#### Teste 2.2: Carregar Previews
```
1. Se personagem tem avatares salvos, devem aparecer nos previews
2. Se não tem, deve aparecer "Sem Imagem"
3. Console deve mostrar URLs geradas
```

#### Teste 2.3: Upload de Avatar
```
1. Clique em um dos avatares (ex: Avatar Saudável)
2. Selecione uma imagem
3. Modal de crop deve abrir
4. Crop e confirme
5. Deve aparecer "Enviando..." no botão
6. Após upload, preview deve atualizar
7. Console: "[CustomizationModal] Upload successful"
```

#### Teste 2.4: Validação de Arquivo
```
1. Selecione arquivo não-imagem
2. Erro: "Por favor, selecione um arquivo de imagem válido"
3. Selecione imagem > 10MB
4. Erro: "A imagem deve ter menos de 10MB"
```

#### Teste 2.5: Cor de Destaque
```
1. Mude a cor no color picker
2. Clique "Salvar e Fechar"
3. Cor deve mudar globalmente no app
4. Verifique console para validação
```

#### Teste 2.6: Toggles (Privacidade & Acessibilidade)
```
1. Ative/desative "Ficha Privada"
2. Ative/desative "Fonte para Dislexia"
3. Salve as mudanças
4. Recargue a página - settings devem persistir
```

---

### 3️⃣ API - `api/users.ts` e `api/agents.ts`

#### Teste 3.1: getUserProfile
```javascript
// No console do browser:
import { getUserProfile } from './api/users.js'
const profile = await getUserProfile('USER_ID')
console.log(profile)
// Deve retornar UserProfile ou null
```

#### Teste 3.2: upsertUserProfile
```javascript
// No console do browser:
import { upsertUserProfile } from './api/users.js'
const ok = await upsertUserProfile('USER_ID', {
  displayName: 'Teste',
  highlightColor: '#ff0000'
})
console.log(ok) // Deve ser true
```

#### Teste 3.3: uploadAgentAvatar
```javascript
// No console do browser:
import { uploadAgentAvatar } from './api/agents.js'
const file = /* obtém arquivo */
const path = await uploadAgentAvatar('AGENT_ID', 'avatarHealthy', file)
console.log(path) // Deve ser caminho do arquivo
```

---

### 4️⃣ Edge Cases

#### Teste 4.1: Sem Autenticação
```
1. Logout do app
2. Acesse /user-profile
3. Deve tentar carregar de localStorage
4. Botão salvar deve avisar "Você precisa estar autenticado"
```

#### Teste 4.2: Erro de Rede
```
1. Abra DevTools → Network → Offline
2. Tente fazer upload
3. Deve mostrar erro apropriado
4. Tente salvar perfil
5. Deve cair em fallback localStorage
```

#### Teste 4.3: Modal Aberto/Fechado Rapidamente
```
1. Abra modal
2. Feche imediatamente
3. Nenhum memory leak ou erro
4. Abra novamente - deve funcionar
```

#### Teste 4.4: Múltiplos Uploads
```
1. Faça upload de avatar 1
2. Antes de terminar, clique avatar 2
3. Deve mostrar "Enviando..." apropriadamente
4. Não deve haver conflito
```

---

## Console Logging Esperado

### UserProfilePage
```
[UserProfilePage] Loading profile from DB for user [userId]
[UserProfilePage] Successfully loaded from database
[UserProfilePage] Avatar URL generated
[UserProfilePage] Uploading avatar: [filename]
[UserProfilePage] Avatar successfully saved
[UserProfilePage] Saving profile
[UserProfilePage] Profile saved successfully
```

### CustomizationModal
```
[CustomizationModal] Modal opened, generating preview URLs
[CustomizationModal] File selected for avatarHealthy: [filename]
[CustomizationModal] Uploading avatarHealthy
[CustomizationModal] Upload successful: [filepath]
[CustomizationModal] Saving customization
```

### API
```
[getUserProfile] Successfully loaded profile for user [userId]
[upsertUserProfile] Saving profile for user [userId]
[upsertUserProfile] Successfully saved profile for user [userId]
[uploadAgentAvatar] Uploading file to agent-avatars: [filepath]
[uploadAgentAvatar] Successfully uploaded: [filepath]
```

---

## Checklist de Sucesso ✅

- [ ] Perfil carrega do DB
- [ ] Avatar faz upload corretamente
- [ ] Validação de arquivo funciona
- [ ] Cor atualiza globalmente
- [ ] Fonte dyslexia é aplicada
- [ ] localStorage funciona como fallback
- [ ] CustomizationModal abre/fecha
- [ ] Avatares fazem upload corretamente
- [ ] Toggles salvam estado
- [ ] Sem memory leaks (DevTools → Memory)
- [ ] Sem erros no console
- [ ] Funciona offline (modo cache)
- [ ] Funciona em mobile

---

## 🐛 Se encontrar bugs:

1. **Abra DevTools (F12)**
2. **Vá para Console**
3. **Procure por `[UserProfilePage]` ou `[CustomizationModal]`**
4. **Copie a mensagem de erro completa**
5. **Reproduza o passo a passo**

---

## 🚨 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Avatar não aparece | Verifique se bucket `user-avatars` existe no Supabase |
| Erro "bucket not found" | Crie bucket em Supabase → Storage → New Bucket |
| Cor não sincroniza | Verifique se `MyContext` tem `updateHighlightColor` |
| localStorage não funciona | Verifique se browser permite storage local |
| Crop não funciona | Verifique se `ImageCropModal` está importado corretamente |

---

**Data:** 22 de Novembro de 2025
**Versão:** 2.0.0
