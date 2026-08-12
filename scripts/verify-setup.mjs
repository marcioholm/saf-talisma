#!/usr/bin/env node
/**
 * Verifica se a migração 001 foi aplicada no Supabase.
 * Uso: node scripts/verify-setup.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnv() {
  const env = {};
  try {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const i = line.indexOf("=");
      if (i > 0 && !line.trim().startsWith("#")) {
        env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
    }
  } catch {}
  return env;
}

const env = loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = [
  "profiles", "user_roles", "post_categories", "posts", "post_tags", "post_tag_relations",
  "sports_categories", "players", "staff", "competitions", "games",
  "transparency_records", "transparency_documents", "banners",
  "sponsor_categories", "sponsors", "institutional_content", "site_settings",
  "audit_logs", "newsletter_subscribers", "estatisticas",
];

let ok = true;
for (const table of tables) {
  const checkColumn = table === "post_tag_relations" ? "post_id" : "id";
  const { error } = await admin.from(table).select(checkColumn).limit(1);
  if (error) {
    ok = false;
    console.log(`❌ ${table} — ausente (${error.message})`);
  } else {
    console.log(`✅ ${table}`);
  }
}

// Buckets
for (const bucket of ["covers", "games", "banners", "sponsors", "transparency", "institutional"]) {
  const { data, error } = await admin.storage.getBucket(bucket);
  if (error || !data) {
    ok = false;
    console.log(`❌ bucket ${bucket} — ausente`);
  } else {
    console.log(`✅ bucket ${bucket}`);
  }
}

console.log(ok ? "\n✅ Setup completo. Pode rodar scripts/create-admin.mjs." : "\n⚠️ Itens ausentes. Execute database/migrations/001_portal.sql no SQL Editor.");
process.exit(ok ? 0 : 1);
