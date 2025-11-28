-- Tabela de caminhos Beyonder (inclui suporte a caminhos secretos)
create table if not exists pathways (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  pv_base int not null,
  pv_por_avanco int not null,
  pe_base int not null,
  pe_por_avanco int not null,
  vontade_bonus int not null,
  sanidade_base int not null,
  domain_description text,
  sequences jsonb not null default '{}'::jsonb,
  mecanica_unica jsonb,
  poderes_inatos jsonb,
  forma_mitica jsonb,
  is_secret boolean not null default false,
  allowed_agent_ids uuid[] default array[]::uuid[], -- caso queira vincular por agent_id (uuid na tabela agents)
  allowed_user_ids uuid[] default array[]::uuid[],  -- supabase auth user ids
  created_at timestamptz default now()
);

-- Índices auxiliares
create index if not exists pathways_is_secret_idx on pathways(is_secret);

-- Exemplo de inserção de um caminho secreto (Aeon) - ajuste valores reais depois
insert into pathways (
  name, category, pv_base, pv_por_avanco, pe_base, pe_por_avanco, vontade_bonus, sanidade_base,
  domain_description, sequences, is_secret, allowed_agent_ids
) values (
  'CAMINHO DE AEON (SECRETO)', 'SECRETO', 6, 2, 6, 2, 1, 5,
  'Domínio desconhecido ligado aos ciclos ocultos do tempo e destino.',
  '{"Sequência 9":[{"name":"Eco do Horizonte","desc":"Pequena percepção de possibilidades futuras (placeholder)."}],"Sequência 8":[{"name":"Memória Fraturada","desc":"Acessa lembranças perdidas de outros (placeholder)."}]}',
  true,
  ARRAY[/* uuid do agente 1 */]::uuid[]
);

insert into pathways (
  name, category, pv_base, pv_por_avanco, pe_base, pe_por_avanco, vontade_bonus, sanidade_base,
  domain_description, sequences, is_secret, allowed_agent_ids
) values (
  'CAMINHO DO PRIMOGÊNITO DO CAOS (SECRETO)', 'SECRETO', 7, 2, 5, 2, 1, 6,
  'Domínio de ilusões e ocultação metafísica.',
  '{"Sequência 9":[{"name":"Bruma Inicial","desc":"Cria névoa ilusória menor (placeholder)."}],"Sequência 8":[{"name":"Olhar Obscuro","desc":"Dificulta rastreamento mental (placeholder)."}]}',
  true,
  ARRAY[/* uuid do agente 2 */]::uuid[]
);

-- Política opcional: permitir SELECT para todos, mas restringir secret por RLS
-- Exemplo de RLS (ajuste conforme seu modelo de auth / mapping):
-- alter table pathways enable row level security;
-- create policy select_public_pathways on pathways for select using (
--   not is_secret or auth.uid() = any(allowed_user_ids)
-- );
