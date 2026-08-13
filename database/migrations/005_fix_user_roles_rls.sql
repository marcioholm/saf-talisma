-- ============================================================
-- SAF TALISMÃ — Migração 005 — Leitura Própria em user_roles
-- Permite que usuários autenticados leiam seu próprio papel em user_roles
-- ============================================================

DROP POLICY IF EXISTS "self_read_user_roles" ON user_roles;

CREATE POLICY "self_read_user_roles" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);
