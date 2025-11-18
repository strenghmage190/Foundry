# 🔧 Corrigir Erro de Convite Inválido

## Problema
A mensagem "Este link de convite é inválido ou expirou" aparece porque as políticas RLS (Row Level Security) do Supabase não permitem que jogadores vejam campanhas através do código de convite.

## Solução
Execute o seguinte SQL no **SQL Editor do Supabase**:

```sql
-- Permitir SELECT de campanhas com invite_code por qualquer usuário autenticado
CREATE POLICY "Campaigns: select by invite_code"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (invite_code IS NOT NULL);
```

**Nota:** Se a política já existir, delete-a primeiro com:
```sql
DROP POLICY IF EXISTS "Campaigns: select by invite_code" ON public.campaigns;
```

## Como aplicar:
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** no menu lateral
3. Execute os arquivos SQL **NA ORDEM** abaixo:

### Passo 1: Verificar estrutura (opcional, mas recomendado)
```sql
-- Execute: sql/verify_campaign_players.sql
-- Isto mostrará se a tabela existe e está configurada
```

### Passo 2: Criar/verificar tabela campaign_players
```sql
-- Execute: sql/create_campaign_players_table.sql
-- Cria a tabela se não existir
```

### Passo 3: Aplicar políticas de campanhas
```sql
-- Execute: sql/campaign_invite_policies.sql
-- Permite ver campanhas via convite
```

### Passo 4: Aplicar políticas de jogadores
```sql
-- Execute: sql/campaign_players_policies.sql
-- Permite jogadores entrarem e vincularem personagens
```

4. Teste novamente o link de convite

## Verificação
Após aplicar, teste criando um novo convite:
1. Crie/edite uma campanha
2. Copie o link de convite
3. Abra em uma aba anônima ou outro navegador
4. Faça login com outro usuário
5. O convite deve funcionar ✅

## ⚠️ IMPORTANTE: Execute AMBOS os arquivos SQL

### 1. Políticas de Campanhas (obrigatório)
Arquivo: `campaign_invite_policies.sql`
- Permite que jogadores vejam campanhas através do código de convite

### 2. Políticas de Jogadores (obrigatório)
Arquivo: `campaign_players_policies.sql`  
- Permite que jogadores se adicionem às campanhas
- Permite que jogadores vinculem seus personagens
- Permite que o GM gerencie jogadores

## Políticas Relacionadas
Veja também:
- `sql/create_campaigns_table.sql` - Políticas básicas da tabela campaigns
