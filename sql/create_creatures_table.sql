-- Tabela para Criaturas (Inimigos/NPCs)
CREATE TABLE IF NOT EXISTS creatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_creatures_owner_id ON creatures(owner_id);
CREATE INDEX idx_creatures_created_at ON creatures(created_at DESC);

-- RLS (Row Level Security) - Apenas o proprietário pode ver suas criaturas
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar apenas suas próprias criaturas"
    ON creatures FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Usuários podem inserir suas próprias criaturas"
    ON creatures FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias criaturas"
    ON creatures FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuários podem deletar apenas suas próprias criaturas"
    ON creatures FOR DELETE
    USING (auth.uid() = owner_id);
