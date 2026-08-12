(function() {
  'use strict';
  
  // Rate limiting middleware for Node.js/Next.js
  // Armazena contagens em memória (para demonstração)
  // Produção deve usar Redis/Upstash ou banco de dados
  
  const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  const MAX_ATTEMPTS = 5;
  const rateLimits = new Map();
  
  function getRateLimitKey(req) {
    // Usa o IP do cliente, preferindo x-forwarded-for
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    return forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  }
  
  function getRateLimitData(req) {
    const ip = getRateLimitKey(req);
    const entry = rateLimits.get(ip);
    if (!entry) return { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
    return { count: entry.count, resetTime: entry.resetTime };
  }
  
  function updateRateLimit(req, count, resetTime) {
    rateLimits.set(req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown', { count, resetTime });
  }
  
  export function checkRateLimit(req) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const data = checkRateLimitData(req);
    const now = Date.now();
    
    if (now - data.resetTime > RATE_LIMIT_WINDOW_MS) {
      data.count = 0;
      data.resetTime = now + 15 * 60 * 1000;
    }
    
    data.count++;
    updateRateLimit(req, data.count, data.resetTime);
    
    if (data.count > MAX_ATTEMPTS) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: Math.max(0, Math.ceil((data.resetTime - now) / 1000)),
      };
    }
    
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - data.count,
      resetIn: null,
    };
  };
  
  export function resetRateLimit(req) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    rateLimits.set(ip, { count: 0, resetTime: Date.now() });
    return { allowed: true, remaining: MAX_ATTEMPTS };
  };
