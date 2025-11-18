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
3. Cole e execute o SQL acima
4. Teste novamente o link de convite

## Verificação
Após aplicar, teste criando um novo convite:
1. Crie/edite uma campanha
2. Copie o link de convite
3. Abra em uma aba anônima ou outro navegador
4. Faça login com outro usuário
5. O convite deve funcionar ✅

## Políticas Relacionadas
Veja também:
- `sql/campaign_invite_policies.sql` - Políticas completas de convite
- `sql/create_campaigns_table.sql` - Políticas básicas da tabela
