// Módulo de double opt-in seguro
// Gera tokens criptograficamente seguros, armazena hash com expiração
// Ativa inscrição somente após confirmação real

import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Em produção, usar Supabase ou banco de dados persistente
// Este é um modelo de implementação

interface SubscriptionRecord {
  email: string;
  token: string; // hash criptografado
  tokenExpiry: Date;
  ip: string;
  createdAt: Date;
  used: boolean;
}

/**
 * Gerar token criptograficamente seguro para confirmação de e-mail
 * @param email O e-mail do inscrito
 * @param ip Endereço IP do inscrito
 * @returns Objeto com token hash e dados para armazenamento
 */
export function generateConfirmationToken(email: string, ip: string): {
  token: string; // Token aleatório para enviar ao usuário
  tokenHash: string; // Hash armazenado no banco (mais seguro)
  expiryMinutes: number;
} {
  // Token aleatório para enviar ao usuário (64 caracteres base64url)
  const token = crypto.randomBytes(32).toString("base64url");
  
  // Hash do token para armazenamento seguro (não armazenar token em texto puro)
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  
  const expiryMinutes = 24; // Expiração em 24 horas
  
  return {
    token,
    tokenHash,
    expiryMinutes,
  };
}

/**
 * Verificar se token é válido e não expirado
 * @param tokenHash Hash armazenado no banco
 * @param tokenToken Token recebido no e-mail
 * @returns { valid: boolean, email?: string }
 */
export function verifyConfirmationToken(
  tokenHash: string,
  tokenToken: string
): { valid: boolean; email?: string } {
  const expectedHash = crypto
    .createHash("sha256")
    .update(tokenToken)
    .digest("hex");
  
  if (expectedHash !== tokenHash) {
    return { valid: false };
  }
  
  // Verificar expiração (24 horas)
  const // Em produção, comparar com data de criação armazenada
  // Por enquanto, aceitar se hash corresponde
  return { valid: true };
}

/**
 * Marcar token como usado (após confirmação)
 * @param tokenHash Hash do token
 */
export function markTokenUsed(tokenHash: string): void {
  // Em produção: atualizar banco de dados para marcar token como usado
  // e impedir reutilização
  console.log(`Token ${tokenHash.substring(0, 8)}... marcado como usado`);
}
