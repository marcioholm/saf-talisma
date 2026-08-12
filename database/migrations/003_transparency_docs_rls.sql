-- ============================================================
-- SAF TALISMÃ — Migração 003 — Proteção dos documentos
-- ------------------------------------------------------------
-- public_read_transparency_docs com USING(true) expunha
-- documentos de registros em rascunho. Restringimos a leitura
-- apenas aos registros publicados.
-- ============================================================

DROP POLICY IF EXISTS public_read_transparency_docs ON transparency_documents;

CREATE POLICY public_read_transparency_docs ON transparency_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transparency_records r
      WHERE r.id = record_id AND r.status = 'published'
    )
  );
