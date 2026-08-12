#!/usr/bin/env node
/**
 * Cria o primeiro usuário administrador da SAF Talismã.
 *
 * Requisitos:
 *  1. Migração 001 executada no Supabase (SQL Editor).
 *  2. Variáveis no .env: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 *
 * Uso:
 *  node scripts/create-admin.mjs admin@saftalisma.com.br "Nome Completo" "senha-forte"
 *  (ou com a variável ADMIN_PASSWORD no .env para omitir a senha)
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
const password = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;

const [email, fullName, argPassword] = process.argv.slice(2);
const finalPassword = argPassword || password;

if (!url || !serviceKey) {
  console.error("❌ Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}
if (!email) {
  console.error("❌ Uso: node scripts/create-admin.mjs <email> [nome] [senha]");
  process.exit(1);
}
if (!finalPassword || finalPassword.length < 8) {
  console.error("❌ Informe uma senha com pelo menos 8 caracteres (3º argumento ou ADMIN_PASSWORD no .env).");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const exit = (msg) => {
  console.error(msg);
  process.exit(1);
};

// 1. Verifica se a migração foi aplicada
const { error: checkError } = await admin.from("user_roles").select("id").limit(1);
if (checkError) {
  exit(`❌ Tabela user_roles não encontrada. Execute database/migrations/001_portal.sql no SQL Editor do Supabase primeiro. (${checkError.message})`);
}

// 2. Cria o usuário de autenticação
const { data: user, error: createError } = await admin.auth.admin.createUser({
  email,
  password: finalPassword,
  email_confirm: true,
  user_metadata: { full_name: fullName || email },
});
if (createError) {
  exit(`❌ Falha ao criar usuário: ${createError.message}`);
}

// 3. Cria o perfil
const { error: profileError } = await admin
  .from("profiles")
  .insert({ id: user.user.id, full_name: fullName || null });
if (profileError) {
  exit(`❌ Falha ao criar perfil: ${profileError.message}`);
}

// 4. Atribui papel de administrador
const { error: roleError } = await admin
  .from("user_roles")
  .insert({ user_id: user.user.id, role: "admin", created_by: user.user.id });
if (roleError) {
  exit(`❌ Falha ao atribuir papel: ${roleError.message}`);
}

console.log(`✅ Administrador criado: ${email}`);
console.log(`   ID: ${user.user.id}`);
console.log(`   Papel: admin`);
console.log(`   Acesse o painel em http://localhost:5173/admin/login`);
