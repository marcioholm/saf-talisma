-- ============================================================
-- SAF TALISMÃ — Migração 004 — Relatórios Bimestrais
-- Lei Federal 13.019/14 e Decreto Municipal 4.510/2017
-- ============================================================

-- Adicionar colunas na tabela transparency_records para relatório bimestral
ALTER TABLE transparency_records
ADD COLUMN IF NOT EXISTS periodo_bimestral varchar(20);  -- '1º bimestre', '2º bimestre', etc.

ALTER TABLE transparency_records
ADD COLUMN IF NOT EXISTS mes_referencia integer;  -- 1-12

ALTER TABLE transparency_records
ADD COLUMN IF NOT EXISTS exercicio_fiscal varchar(9);  -- '2024', '2025', etc.

ALTER TABLE transparency_records
ADD COLUMN IF NOT EXISTS descricao_resumida text;  -- Descrição resumida para o relatório

ALTER TABLE transparency_records
ADD COLUMN IF NOT EXISTS dados_identificacao jsonb;  -- Dados identificadores (CPF, CNPJ, etc.)

ALTER TABLE transparency_records
ADD COLUMN IF NOT EXISTS link_original varchar(255);  -- Link para o documento original

-- Criar tabela de anexos do relatório bimestral
CREATE TABLE IF NOT EXISTS transparency_bimestral_annexes (
  id uuid primary key default gen_random_uuid(),
  transparency_record_id uuid references transparency_records(id) on delete cascade,
  titulo varchar(255) not null,
  file_url text not null,  -- URL do arquivo no storage
  file_name varchar(255) not null,
  file_size integer,  -- Tamanho em bytes
  file_type varchar(100),  -- Tipo MIME
  uploaded_at timestamptz default now(),
  uploaded_by uuid,  -- Admin que fez o upload
  description text,  -- Descrição do anexo
  constraint unique_transparency_bimestral_annex unique (transparency_record_id, titulo)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transparency_records_bimestral ON transparency_records(periodo_bimestral, mes_referencia, exercicio_fiscal);
CREATE INDEX IF NOT EXISTS idx_bimestral_annexes_record ON transparency_bimestral_annexes(transparency_record_id);
