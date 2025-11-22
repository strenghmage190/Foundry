# ✅ Teste Visual - Avatar do Personagem

## Ambiente
- URL: `http://localhost:3001`
- DevTools: Pressione `F12`
- Aba: **Console**

---

## Passo 1: Acesse um Personagem

1. [ ] Login na aplicação
2. [ ] Clique em um personagem (ou crie um novo)
3. [ ] Procure pelo botão de **Customização** ou **Avatares**

**Console esperado**:
```
[CustomizationModal] Modal opened, generating preview URLs
```

---

## Passo 2: Altere o Avatar

1. [ ] Clique em um avatar (ex: "Avatar Saudável")
2. [ ] Selecione uma imagem do seu computador
3. [ ] Se houver modal de crop, confirme o corte

**Console esperado**:
```
[CustomizationModal] File selected for avatarHealthy: [filename]
[CustomizationModal] Uploading avatarHealthy
[uploadAgentAvatar] Successfully uploaded: [caminho]
[CustomizationModal] Upload successful: [caminho]
```

---

## Passo 3: Salve as Alterações

1. [ ] Clique em **Salvar** (dentro do modal de customização)

**Console CRÍTICO - procure por**:
```
[CustomizationModal] Saving customization
[CustomizationModal] Forcing immediate database save...
[updateAgentCustomization] Successfully updated agent d8c28...
[CustomizationModal] ✓ Customization saved immediately to database
```

⚠️ **Se não ver estes logs**, o bug NÃO foi corrigido!

---

## Passo 4: Teste Persistência

1. [ ] Modal fecha
2. [ ] Aguarde ~1 segundo
3. [ ] Recarregue a página: **F5** ou **Ctrl+R**

**Console esperado** ao recarregar:
```
[CustomizationModal] Modal opened, generating preview URLs
[...procura por avatarPath nos logs...]
```

**Resultado visual**:
- [ ] Avatar NOVO está visível (não o antigo)
- [ ] Cor está correta
- [ ] Privacidade mantém o estado

---

## ✅ Checklist de Sucesso

Se TODOS estes pontos forem verdadeiros, o bug foi corrigido:

- [ ] Conseguiu fazer upload de avatar
- [ ] Viu "Customization saved immediately" no console
- [ ] Avatar persiste após recarregar página
- [ ] Não há erros vermelhos no console
- [ ] Cor também persiste

---

## ❌ Se Falhar

### Procure por

**Erro ao salvar**:
```
[CustomizationModal] Immediate save error
[updateAgentCustomization] Database error
```

**Ação**: Verifique se a tabela `agents` existe no Supabase

**Sem log de salva**:
```
[CustomizationModal] Forcing immediate database save...
(falta continuação)
```

**Ação**: Verifique se `updateAgentCustomization` foi importado corretamente

---

## Debug Button

Em desenvolvimento há um botão "Debug" na página de perfil:

1. [ ] Clique nele
2. [ ] Copie os dados mostrados no console
3. [ ] Compare se `avatarPath` está no React state E no localStorage

---

## Performance

Depois da fix, não deve haver delay visível:
- ✅ Avatar aparece imediatamente após upload
- ✅ Modal fecha sem esperar
- ✅ Dados salvam em < 300ms (não 600ms)

---

## Reportar Resultado

Após rodar este teste, você pode confirmar:

```
✅ FUNCIONANDO: Avatar persiste após recarregar
❌ BUG AINDA EXISTE: Avatar desaparece após recarregar
⚠️ PARCIALMENTE: Avatar às vezes fica, às vezes desaparece
```
