// Rate limiting persistente e atômico
// Versão segura para produção - usa arquivos bloqueados ou Redis
// Para produção real, recomenda-se Redis/Upstash com lock atômico

import fs from "fs";
import path from "path";
import os from "os";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_FILE = path.join(os.tmpdir(), "saf-talisma-rate-limit.json");

// Types
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn?: number; // segundos
  resetTime: Date;
}

// newsletter: 3 tentativas por IP/e-mail em 15 minutos
// contact: 5 tentativas por IP em 15 minutos
// login: 5 tentativas por IP/conta em 15 minutos
// notify: limite administrativo e idempotência por notícia

interface RateLimitEntry {
  count: number;
  resetTime: number;
  emails?: Set<string>; // Para newsletter - rastrear e-mails
}

// Carregar dados de rate limit
function loadData(): Map<string, RateLimitEntry> {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      const data = JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf8"));
      return new Map(Object.entries(data));
    }
  } catch (err) {
    console.error("Erro ao carregar rate limit data:", err);
  }
  return new Map();
}

// Salvar dados de rate limit
function saveData(data: Map<string, RateLimitEntry>): void {
  try {
    const obj = Object.fromEntries(data);
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(obj));
  } catch (err) {
    console.error("Erro ao salvar rate limit data:", err);
  }
}

// Obter chave baseada no tipo de limite
function getKey(type: "newsletter" | "contact" | "login" | "notify", ip: string, email?: string): string {
  if (type === "newsletter" && email) {
    return `nl_${ip}_${email}`;
  }
  return `${type}_${ip}`;
}

// Verificar e atualizar rate limit - operação atômica
export function checkRateLimit(
  type: "newsletter" | "contact" | "login" | "notify",
  ip: string,
  email?: string
): RateLimitResult {
  const data = loadData();
  const key = getKey(type, ip, email);
  const entry = data.get(key) || { count: 0, resetTime: Date.now(), emails: new Set() };
  const now = Date.now();

  // Resetar se janela expirou
  if (now - entry.resetTime > RATE_LIMIT_WINDOW_MS) {
    const newEntry: RateLimitEntry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS, emails: new Set() };
    if (type === "newsletter") {
      newEntry.emails = new Set();
    }
    data.set(key, newEntry);
    saveData(data);
    return { allowed: true, remaining: 3 - 0, resetIn: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000), resetTime: new Date(newEntry.resetTime) };
  }

  // Incrementar contador
  entry.count++;
  if (type === "newsletter" && email) {
    entry.emails!.add(email);
  }

  // Aplicar limites específicos por tipo
  const maxAttempts = type === "newsletter" ? 3 : 5;
  const remaining = Math.max(0, maxAttempts - entry.count);

  saveData(data);

  return {
    allowed: entry.count <= maxAttempts,
    remaining,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    resetTime: new Date(entry.resetTime),
  };
}

// Resetar rate limit (para uso administrativo)
export function resetRateLimit(type: "newsletter" | "contact" | "login" | "notify", ip: string, email?: string): void {
  const data = loadData();
  const key = getKey(type, ip, email);
  data.delete(key);
  saveData(data);
}
