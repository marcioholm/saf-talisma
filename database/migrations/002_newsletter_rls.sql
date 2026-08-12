-- ============================================================
-- SAF TALISMÃ — Migração 002 — Correção de RLS da newsletter
-- ------------------------------------------------------------
-- Políticas FOR ALL com WITH CHECK(is_admin) bloqueavam o INSERT
-- anônimo (no Postgres, TODAS as políticas aplicáveis precisam
-- passar). Aqui separamos por operação e mantemos o INSERT
-- público (public_insert_newsletter) sem conflito.
-- ============================================================

DROP POLICY IF EXISTS admin_all_newsletter ON newsletter_subscribers;

CREATE POLICY "admin_select_newsletter" ON newsletter_subscribers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_update_newsletter" ON newsletter_subscribers
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_newsletter" ON newsletter_subscribers
  FOR DELETE USING (public.is_admin());
