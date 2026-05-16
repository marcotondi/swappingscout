# SwappingScout — AGENTS.md

## Project Overview

SwappingScout is a barter management application for scout markets (mercatini scout). It manages inventory and runs a matching algorithm to assign objects to participants based on their expressed preferences.

**Status:** Local-First architecture — 100% client-side SPA (SvelteKit + TypeScript + Dexie.js + PWA).

**Legacy** (LoopBack 3 + AngularJS) archived in a dedicated git branch.

## Architecture (ADR-001)

- **Frontend:** SvelteKit with `adapter-static` (100% client-side SPA), TypeScript, Tailwind CSS
- **Persistence:** Dexie.js over IndexedDB (browser-native database)
- **CSV:** PapaParse for import/export
- **PWA:** Installable, works offline (Vite PWA Plugin)
- **Backend:** None — fully local-first, no server required
- **Deploy:** GitHub Pages

## Key Source Files

| File | Purpose |
|---|---|
| `src/lib/algorithm.ts` | **Core matching algorithm** — the most critical logic file |
| `src/lib/db.ts` | Dexie.js schema and CRUD operations |
| `src/lib/csv.ts` | CSV import/export with PapaParse |
| `src/lib/stores.ts` | Svelte stores for global state |
| `src/lib/types.ts` | TypeScript interfaces and types |
| `src/routes/+layout.svelte` | App layout with navbar |
| `src/routes/+page.svelte` | Home page |
| `src/routes/consumatori/+page.svelte` | Consumer management page |
| `src/routes/magazzino/+page.svelte` | Inventory management page |
| `src/routes/scambio/+page.svelte` | Swap execution and results |
| `tests/algorithm.test.ts` | Algorithm unit tests |
| `docs/adr/adr-001-local-first-architecture.md` | Architecture Decision Record |

## Core Algorithm (`src/lib/algorithm.ts`)

The matching algorithm assigns objects to consumers using a **betting system**:

- 1st choice: bet = 15
- 2nd choice: bet = 10
- 3rd choice: bet = 5

**Scoring:**
```
point = bet / (number_of_choices + already_assigned_count)
```

This favours users who expressed fewer preferences (more "hungry") and those who already received fewer objects.

**Assignment flow:**

1. **`runSwap`** — Entry point. Loads consumers and objects, builds desirability map, sorts objects, iterates over each object calling `startAlgo`.
2. **`searchObj`** — Finds all consumers wanting an object, computes points.
3. **`maxMap`** — Finds the consumer(s) with the highest point.
4. **`startAlgo`** — Core assignment with **corrected recursive tie-breaking**:
   - Single winner → assign via `assignObject`
   - Tie → `searchObjKey` finds an alternative object (using `for` loop, not `forEach` — bug fix from legacy). Recursive `startAlgo` on the alternative, then `reviewUsersID` eliminates the loser from the tie list. Repeat until one candidate remains.
   - If no alternative object found → fallback to `chooseKey`
5. **`chooseKey`** — Final tie-break: consumer with fewer assignments wins (random if still tied).
6. **`assignObject`** — Marks object assigned, increments `countAss` for winner. If `oneObj` mode, clears all preferences for the winner. Filters assigned objects from all consumers.
7. **`sortObjects`** — Sorts objects by desirability count (ascending or descending).

**Bug fixes from legacy (`server/swapping.js`):**

| # | Function | Legacy Bug | Fix |
|---|---|---|---|
| 1 | `searchObjKey` | `return` inside `forEach` never escaped the outer function | Replaced `forEach` with `for` loop |
| 2 | `reviewUsersID` | `evens.length > 1` was always false when removing 1 element | Changed to return `true` when at least 1 element removed |
| 3 | `startAlgo` recursive | `oneObj` not passed in recursive call | Now passes `oneObj` to recursive calls |
| 4 | Overall recursion | Dead code — never executed meaningfully | **Correctly implemented:** recursion resolves ties, the loser is eliminated, winner receives the original object |

## Coding Conventions

- **Language:** TypeScript (strict mode enabled)
- **Framework:** SvelteKit with `adapter-static` (Svelte 5)
- **Style:** Functional, pure functions where possible
- **Naming:** camelCase for variables and functions; interfaces use PascalCase
- **Indentation:** tabs
- **Strings:** Double quotes (`"`) in Svelte templates, single quotes (`'`) in TypeScript
- **Components:** `<script lang="ts">` in `.svelte` files
- **Imports:** ES modules, no default exports

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Production build (outputs to build/)
npm run preview    # Preview production build
npm test           # Run vitest tests
npm run check      # TypeScript / Svelte type checking
```

## Git Workflow

- Branch from `main`
- Prefer [Conventional Commits](https://www.conventionalcommits.org/) format
- No commit hooks configured
- No push — the user handles remote operations
