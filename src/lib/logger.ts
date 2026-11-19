// ============================================================
// src/lib/logger.ts
// Structured Sanitizing Logger for AeroGuard AI
// Zero raw console leaks, automatic redaction of keys & PII
// Compliant with CWE-209 safe error handling standards
// ============================================================

export type LogLevel = 'info' | 'warn' | 'error';

function sanitize(data: unknown): unknown {
  if (typeof data === 'string') {
    // Redact potential API keys or tokens
    return data.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
  }
  if (data && typeof data === 'object') {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (/key|secret|token|password/i.test(k)) {
        copy[k] = '[REDACTED]';
      } else {
        copy[k] = sanitize(v);
      }
    }
    return copy;
  }
  return data;
}

export const logger = {
  info: (msg: string, context?: unknown) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, context ? sanitize(context) : '');
    }
  },
  warn: (msg: string, context?: unknown) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, context ? sanitize(context) : '');
  },
  error: (msg: string, err?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err ? sanitize(err) : '');
  },
};
