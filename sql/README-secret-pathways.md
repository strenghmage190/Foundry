# Sistema de Caminhos Secretos - Supabase

Este sistema permite controlar quais usuários/agentes podem ver caminhos Beyonder secretos (como Éon Eterno e Véu).

## Configuração Inicial

1. Execute o arquivo SQL no SQL Editor do Supabase:
```sql
-- Copie e cole o conteúdo de: sql/create_secret_pathways_access.sql
```

## Como Funciona

### Regras de Visibilidade

Um usuário pode ver um caminho secreto se:
1. **Permissão Global**: Tem `can_create_pathways = true` OU `max_pathways > 3` em `user_permissions`
2. **Lista de Usuários**: Seu `user_id` está em `allowed_user_ids` do caminho
3. **Lista de Agentes**: O `agent_id` que está visualizando está em `allowed_agent_ids`

### Gerenciamento de Acessos

#### Conceder Acesso a um Usuário

```sql
-- Para o Caminho do Éon Eterno
SELECT grant_secret_pathway_access(
  'CAMINHO DO ÉON ETERNO', 
  'user-uuid-aqui'::uuid
);

-- Para o Caminho do Véu
SELECT grant_secret_pathway_access(
  'CAMINHO DO VÉU', 
  'user-uuid-aqui'::uuid
);
```

#### Conceder Acesso a um Agente Específico

```sql
-- Pelo ID numérico do agente
SELECT grant_secret_pathway_access(
  'CAMINHO DO ÉON ETERNO',
  NULL,
  123  -- ID do agente
);
```

#### Remover Acesso

```sql
SELECT revoke_secret_pathway_access(
  'CAMINHO DO ÉON ETERNO',
  'user-uuid'::uuid
);
```

### Consultas Úteis

#### Listar Todos os Caminhos Secretos

```sql
SELECT * FROM secret_pathway_access;
```

#### Ver Quem Tem Acesso a um Caminho

```sql
SELECT 
  pathway_name,
  allowed_user_ids,
  allowed_agent_ids
FROM secret_pathway_access
WHERE pathway_name = 'CAMINHO DO ÉON ETERNO';
```

#### Verificar Acesso de um Usuário

```sql
SELECT can_user_see_secret_pathway(
  'CAMINHO DO ÉON ETERNO',
  'user-uuid'::uuid
);
```

#### Listar Usuários com Permissões Globais

```sql
SELECT 
  user_id,
  can_create_pathways,
  max_pathways
FROM user_permissions
WHERE can_create_pathways = true 
   OR max_pathways > 3;
```

## Exemplo Prático

### Cenário: Liberar Éon Eterno para 2 players específicos

```sql
-- 1. Obter UUIDs dos usuários (assumindo que você sabe os emails)
SELECT id, email FROM auth.users 
WHERE email IN ('player1@email.com', 'player2@email.com');

-- 2. Conceder acesso
SELECT grant_secret_pathway_access(
  'CAMINHO DO ÉON ETERNO', 
  'uuid-player-1'::uuid
);

SELECT grant_secret_pathway_access(
  'CAMINHO DO ÉON ETERNO', 
  'uuid-player-2'::uuid
);

-- 3. Verificar
SELECT * FROM secret_pathway_access 
WHERE pathway_name = 'CAMINHO DO ÉON ETERNO';
```

### Cenário: Liberar Véu para quem tem can_create_pathways

Neste caso, não precisa fazer nada! O sistema já reconhece usuários com `can_create_pathways = true` automaticamente.

Para verificar quem tem essa permissão:

```sql
SELECT u.email, up.can_create_pathways, up.max_pathways
FROM user_permissions up
JOIN auth.users u ON u.id = up.user_id
WHERE up.can_create_pathways = true;
```

## Integração com o Frontend

O código React já está configurado para usar essas regras:

- `CharacterSheetPage.tsx` filtra `visiblePathways` baseado em:
  - `permissions.can_create_pathways`
  - `permissions.max_pathways > 3`
  - `allowedAgentIds` / `allowedUserIds` nos dados do pathway

Para que funcione totalmente dinâmico (buscando do DB), você precisaria:

1. Criar uma API route que chama `can_user_see_secret_pathway`
2. Ou buscar diretamente de `user_visible_pathways` view

## Notas de Segurança

- As funções usam `SECURITY DEFINER` para permitir verificação sem expor estrutura
- RLS está comentado por padrão; descomente se quiser proteção adicional
- Apenas usuários com `can_create_pathways` deveriam gerenciar acessos

## Manutenção

Para adicionar um novo caminho secreto:

```sql
INSERT INTO secret_pathway_access (pathway_name, is_secret)
VALUES ('NOME DO NOVO CAMINHO', true);
```

Para tornar um caminho público novamente:

```sql
UPDATE secret_pathway_access
SET is_secret = false
WHERE pathway_name = 'CAMINHO DO ÉON ETERNO';
```
