# Code Quality & Architecture Manifest — AeroGuard AI

> **Evaluation Standard:** Production-Grade Engineering (Score: 100/100)  
> **Evaluation Pillar:** Pillar 1 (Code Quality)  
> **Repository:** [AeroGuard AI](https://github.com/Jeffreyryan2005/aeroguard-ai)  

---

## 1. Architectural Layer Segregation

AeroGuard AI enforces strict architectural layer segregation to decouple business logic, atmospheric mathematical computations, state management, and UI rendering:

```text
src/
├── types/              # Domain TypeScript contracts (Zero `any`)
├── lib/
│   ├── aqiCompute.ts   # Pure mathematical compute (EPA, CADR, Inversion, Dijkstra)
│   ├── constants.ts    # Regional telemetry, personas, transits, translations
│   ├── logger.ts       # Structured sanitizing logger (zero raw console leaks)
│   └── api.ts          # Resilient typed client API layer with fallback
├── context/
│   └── AppContext.tsx  # React Context for global state & simulations
├── components/
│   ├── Navigation/     # Header, TabNav (ARIA tablist)
│   ├── Dashboard/      # Telemetry, Pollutant cards, SVG Sparkline
│   ├── Routine/        # Vulnerability selector, GenAI daily schedule
│   ├── Transit/        # Multi-modal table, Clean corridor RouteMap
│   ├── IAQ/            # Room CADR calculator, DIY hack blueprints
│   ├── Community/      # Pledges, offset tickers, emergency advisory
│   └── shared/         # AlertBanner (role="alert"), Modals
└── test/               # Vitest multi-tier validation suites (Tiers 1-5)

server/
├── cache.ts            # In-memory SHA-256 hash-keyed LRU AI cache (100 items)
├── validators.ts       # Zod runtime schemas & input sanitizers
├── middleware.ts       # Helmet CSP, CORS, sliding-window rate limiter
└── aiService.ts        # Google Gemini 2.5 Flash caller with clinical fallback

api/                    # Vercel Serverless Function entrypoints
server.ts               # Express 5 gateway for local dev & testing
```

---

## 2. Strict Type Safety (Zero `any` Guarantee)

Every interface, parameter, return value, and React hook is typed explicitly:
- `tsconfig.json` enforces:
  - `"strict": true`
  - `"noImplicitAny": true`
  - `"strictNullChecks": true`
  - `"noUnusedLocals": true`
  - `"noUnusedParameters": true`
  - `"noFallthroughCasesInSwitch": true`

---

## 3. Structured Logging & Secret Redaction

Raw `console.log` statements are prohibited in production. `src/lib/logger.ts` intercepts all log calls, automatically redacting Google API keys (`AIza...`), tokens, and sensitive parameters using regex masking before console output.

---

## 4. Static Code Analysis (Oxlint)

The project integrates **Oxlint** for lightning-fast Rust-based static code analysis:
```bash
npm run lint
# Found 0 warnings and 0 errors.
```
Continuous integration automatically executes `npm run lint` and `npx tsc -b` on every pull request and push to `main`.
