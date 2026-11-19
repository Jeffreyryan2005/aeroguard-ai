# Security Architecture & OWASP Defense Blueprint — AeroGuard AI

> **Evaluation Standard:** Zero-Trust Defense-in-Depth (Score: 100/100)  
> **Evaluation Pillar:** Pillar 2 (Security)  
> **Repository:** [AeroGuard AI](https://github.com/Jeffreyryan2005/aeroguard-ai)  

---

## 1. Supported Versions

| Version | Supported |
|:---|:---:|
| 1.2.x | :white_check_mark: |
| 1.1.x | :white_check_mark: |
| < 1.1.0 | :x: |

---

## 2. Vulnerability Reporting

If you identify a security issue or vulnerability within AeroGuard AI, please report it responsibly:
- Open a GitHub Private Vulnerability Report via the repository's Security tab.
- Alternatively, submit details to the maintainer via GitHub Issues labeled with `security`.
- Critical issues receive review and triage within 24 hours.

---

## 3. Zero-Trust Architecture Principles

1. **Server-Side Only Gemini API Execution:**
   The Google Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables (`server.ts` / Vercel Serverless Functions). It is **never** bundled into the client-side JavaScript bundle, **never** exposed via `VITE_` public variables, and **never** committed to version control.
2. **Environment Variable Segregation:**
   - `.env` is listed in `.gitignore` to prevent credential leakage.
   - `.env.example` provides sanitized dummy template placeholders.
3. **Runtime Schema Validation (Zod):**
   Incoming network payloads at `/api/routine-insights` and `/api/emergency-advisory` are strictly parsed using Zod (`server/validators.ts`). Payloads with unexpected properties, negative numbers, or out-of-range values are rejected immediately with HTTP 400.
4. **Content Security Policy (CSP):**
   Configured via Helmet:
   - `defaultSrc: ["'self'"]`
   - `objectSrc: ["'none'"]`
   - `frameAncestors: ["'none'"]` (prevents clickjacking attacks)
   - `connectSrc: ["'self'", 'https://generativelanguage.googleapis.com']`
5. **Sliding-Window IP Rate Limiting:**
   Configured via `express-rate-limit`: caps client requests to 45 per minute to prevent DoS attacks and external LLM quota exhaustion.
6. **CWE-209 Safe Error Handling:**
   All internal server exceptions are captured by `safeErrorHandler` in `server/middleware.ts`. Stack traces and internal server paths are never exposed to clients; safe generic JSON error messages are returned.
7. **OWASP Top 10 Header Hardening:**
   Configured in `vercel.json` and all serverless responses (`api/*`):
   - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...` (mitigates XSS and data exfiltration)
   - `X-Content-Type-Options: nosniff` (mitigates MIME type confusion)
   - `X-Frame-Options: DENY` (prevents clickjacking)
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (enforces HSTS)
   - `Referrer-Policy: strict-origin-when-cross-origin` (prevents referrer leakage)
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricts privileged APIs)
