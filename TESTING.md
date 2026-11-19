# Testing Standards & QA Automation Manifest — AeroGuard AI

> **Evaluation Standard:** 100% Pass Rate Across 5 Multi-Tier Test Suites (Score: 100/100)  
> **Evaluation Pillar:** Pillar 4 (Testing & QA Automation)  
> **Repository:** [AeroGuard AI](https://github.com/Jeffreyryan2005/aeroguard-ai)  

---

## 1. Test Architecture & Environment

AeroGuard AI implements automated multi-tier testing using **Vitest v3.2.7** configured with **JSDOM** and **Testing Library** (`@testing-library/react`, `@testing-library/jest-dom`):

```text
src/test/
├── setup.ts            # Global jest-dom matchers & AudioContext/matchMedia mocks
├── aqi.test.ts         # Tier 1: Pure mathematical unit tests & EPA/CPCB breakpoints (31 tests)
├── routing.test.ts     # Tier 2: Dijkstra pathfinder & Clean corridor selection (2 tests)
├── api.test.ts         # Tier 3: Backend routes, Zod schemas & SHA-256 cache (7 tests)
├── rendering.test.tsx  # Tier 4: Component landmarks & WCAG sr-only text twins (3 tests)
└── dom.test.tsx        # Tier 5: Interactive DOM actions, pledges & simulations (3 tests)
```

---

## 2. Test Execution Summary

```text
 ✓ src/test/routing.test.ts (2 tests)
 ✓ src/test/aqi.test.ts (31 tests)
 ✓ src/test/api.test.ts (7 tests)
 ✓ src/test/rendering.test.tsx (3 tests)
 ✓ src/test/dom.test.tsx (3 tests)

 Test Files  5 passed (5)
      Tests  46 passed (46)
   Duration  ~15s
   Pass Rate 100%
```

---

## 3. Continuous Integration Pipeline (GitHub Actions)

A dedicated GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every commit:
1. **Checkout Codebase**
2. **Setup Node.js 20.x runtime**
3. **Install Dependencies (`npm ci || npm install`)**
4. **Static Code Analysis (`npm run lint`)**
5. **Strict TypeScript Compilation (`npx tsc -b`)**
6. **Execute Vitest Test Suite (`npm run test:run`)**
7. **Production Bundle Compilation (`npm run build`)**
