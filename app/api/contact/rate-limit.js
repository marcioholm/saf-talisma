// Rate limiting para o endpoint /api/contact
// Armazena contagens em arquivos temporários (para demonstração)
// Produção deve usar Redis/Upstash

const fs = require('fs');
const path = require('path');
const os = require('os');

const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_FILE = path.join(os.tmpdir(), 'contact-rate-limit.json');

function getRateLimitKey(ip) {
  return `contact_${ip}`;
}

function getRateLimitData(ip) {
  const data = fs.readFileSync(path.join(os.tmpdir(), 'contact-rate-limit.json'), 'utf8');
  const dataObj = JSON.parse(data);
  return dataObj[getRateLimitKey(ip)] || { count: 0, resetTime: Date.now() };
}

function updateRateLimitData(ip, count, resetTime) {
  const data = {};
  const dataObj = JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'contact-rate-limit.json'), 'utf8'));
  dataObj[getRateLimitKey(ip)] = { count, resetTime };
  fs.writeFileSync(path.join(os.tmpdir(), 'contact-rate-limit.json'), JSON.stringify(dataObj));
}

export function checkRateLimit(ip) {
  const data = getRateLimitData(ip);
  const now = Date.now();
  
  // Reset if window has passed
  if (now - data.resetTime > 15 * 60 * 1000) {
    data.count = 0;
    data.resetTime = now + 15 * 60 * 1000;
  }
  
  data.count++;
  updateRateLimitData(ip, data.count, data.resetTime);
  
  if (data.count > MAX_ATTEMPTS) {
    const waitTime = resetTime - now;
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.max(0, Math.ceil(resetTime - now / 1000)),
      resetTime: new Date(data.resetTime),
    };
  }
  
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - data.count,
    resetIn: null,
  };
}

export function resetRateLimit(ip) {
  updateRateLimitData(ip, 0, Date.now());
  return { allowed: true, remaining: MAX_ATTEMPTS, resetIn: 0 };
}

module.exports = { checkRateLimit, resetRateLimit };
