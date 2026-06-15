# Cypress Testing Coverage — Design

**Date:** 2026-06-15
**Status:** Approved — ready for implementation plan
**Goal:** Learning-focused Cypress coverage for the ai-course project. Maximize exposure to canonical Cypress patterns (E2E, component, intercepts, fixtures, CI, code coverage).

## Project context

Next.js 16 (App Router) + React 19 + Tailwind v4. Four routes:

- `/` — server component, fetches 6 random Gen 1 Pokémon from PokéAPI, renders `PokemonCarousel`
- `/pokedex` — server component, fetches 151 Gen 1 Pokémon, grid of `PokedexGridCard`
- `/pokedex/[id]` — server component, detail page (stats, abilities, description), `notFound()` on out-of-range IDs
- `/team` — server component loading `data/great-league.json`, renders interactive `TeamBuilder` client component

Pure logic lives in `src/app/lib/team-analysis.ts` and `src/app/lib/types-chart.ts`. All PokéAPI fetches go through `src/app/lib/pokeapi.ts`.

No test runner is configured yet.

## Decisions

| Question | Choice |
|---|---|
| Primary goal | Learning — maximize Cypress pattern exposure |
| Scope | Both E2E **and** component tests |
| External API handling | Hybrid — real PokéAPI locally, stubbed in CI |
| CI | GitHub Actions, stubbed mode |
| Extras | `@cypress/code-coverage` (no a11y plugin for v1) |
| Suite organization | One E2E spec per route, one component spec per interactive client component |

## Architecture

### 1. Tooling

Dev dependencies to add (npm):

- `cypress` — runner, includes E2E and component modes
- `@cypress/code-coverage` — coverage plugin
- `babel-plugin-istanbul` — instruments the Next bundle when `COVERAGE=1`
- `nyc` — coverage reporter CLI (HTML + lcov)
- `start-server-and-test` — boots `next dev` and waits for `localhost:3000` before running Cypress
- `concurrently` — runs the fixture server alongside `next dev` in stub mode

No MSW/nock — the hybrid strategy uses `cy.intercept` (client-side) plus a Cypress-managed env var to redirect server-side `fetch` to a small fixture server.

### 2. Folder structure

```
cypress/
  e2e/
    home.cy.ts
    pokedex-grid.cy.ts
    pokedex-detail.cy.ts
    team-builder.cy.ts
  component/
    TeamBuilder.cy.tsx
    PokemonCarousel.cy.tsx
    PokedexGridCard.cy.tsx
  fixtures/
    pokemon/
      1.json … 6.json          # captured /pokemon/:id responses
      species/1.json … 6.json   # captured /pokemon-species/:id
    great-league.sample.json    # tiny subset for component tests
  support/
    commands.ts                 # custom commands (cy.pickTeam, cy.stubPokeApi)
    e2e.ts                      # E2E global hooks
    component.ts                # cy.mount wrapper + global CSS
  fixture-server.ts             # tiny Node server serving fixtures/
cypress.config.ts
scripts/
  capture-pokeapi-fixtures.ts   # one-time fixture generator
  with-coverage.ts              # toggles Babel istanbul, runs next dev
```

### 3. Spec inventory

Each spec is chosen for a distinct Cypress learning surface; coverage is incidental.

| Spec | Primary mechanic |
|---|---|
| `home.cy.ts` | `cy.intercept` for carousel fetch, `cy.visit` with stubs |
| `pokedex-grid.cy.ts` | Bulk fixture wiring (151 cards), assertion on counts |
| `pokedex-detail.cy.ts` | Dynamic route params, error path (`/pokedex/999` → 404) |
| `team-builder.cy.ts` | Full user journey: pick 3 → see analysis → swap → clear |
| `TeamBuilder.cy.tsx` | `cy.mount` with props, picker filter, slot interactions in isolation |
| `PokemonCarousel.cy.tsx` | Arrow navigation, first/last state |
| `PokedexGridCard.cy.tsx` | Type-badge rendering, link href |

`team-analysis.ts` and `types-chart.ts` are pure functions; we do **not** unit-test them directly. The `TeamBuilder.cy.tsx` component spec verifies their output via rendered status pills ("Stacked", "Exposed", "Covered") and the threat list.

### 4. Hybrid API strategy

Server components fetch PokéAPI server-side. `cy.intercept` only catches client-side requests, so we use an env-var swap for the server side.

**Single change to `src/app/lib/pokeapi.ts`:**

```ts
const POKEAPI =
  process.env.NEXT_PUBLIC_POKEAPI_BASE ?? "https://pokeapi.co/api/v2";
```

**Mode matrix:**

| Run | Mode | `NEXT_PUBLIC_POKEAPI_BASE` | Fixture server running? |
|---|---|---|---|
| `npm run dev` (normal dev) | real | unset | no |
| `npm run cy:open` (local authoring) | real | unset | no |
| `npm run cy:run` (local headless) | real | unset | no |
| `npm run cy:run:stub` (local stubbed) | stub | `http://localhost:4000/api/v2` | yes |
| GH Actions CI | stub | `http://localhost:4000/api/v2` | yes |

**Fixture server** (`cypress/fixture-server.ts`): a ~30-line Node script reading from `cypress/fixtures/pokemon/` and serving the matching URLs. Started by `concurrently` alongside `next dev` in stub mode.

**Fixture generation** (`scripts/capture-pokeapi-fixtures.ts`): one-time script that hits the real PokéAPI for the IDs needed by tests (Gen 1, plus the carousel sample) and writes responses to `cypress/fixtures/`. Run once with `npm run cy:capture`; commit the result.

**Client-side stubs:** any client-side fetch added later (or `PokemonCarousel` if it refetches) gets stubbed with `cy.intercept('GET', '**/pokemon/*', { fixture: 'pokemon/1.json' })`. The pattern is taught in `home.cy.ts`.

### 5. Component test mount

**`cypress.config.ts` component block:**

```ts
component: {
  devServer: {
    framework: "next",
    bundler: "webpack",
  },
  specPattern: "cypress/component/**/*.cy.tsx",
}
```

Cypress's built-in Next.js adapter spins up a small webpack dev server just for mounting — separate from the app's `next dev`.

**`cypress/support/component.ts`:**

```ts
import { mount } from "cypress/react";
import "../../src/app/globals.css";  // Tailwind classes resolve in mounted components

Cypress.Commands.add("mount", mount);
```

**Sample data for component tests** (inline in spec):

```ts
const SAMPLE: PokemonEntry[] = [
  { slug: "azumarill", name: "azumarill", types: ["water","fairy"],    tier: "S",  rank: 1 },
  { slug: "altaria",   name: "altaria",   types: ["dragon","flying"],  tier: "S",  rank: 2 },
  { slug: "registeel", name: "registeel", types: ["steel"],            tier: "A+", rank: 3 },
  { slug: "medicham",  name: "medicham",  types: ["fighting","psychic"],tier:"A",  rank: 4 },
];
```

Component specs use this small fixture, not the full meta list.

**Assertions per component spec:**

- `TeamBuilder.cy.tsx`
  - Search filter narrows picker list
  - Type filter narrows picker list
  - Clicking a picker item fills the first empty slot
  - "×" button empties a slot
  - Analysis panel only appears at 3 members
  - "Random" fills all 3 slots
  - Picker items disable when their slug is already on the team
- `PokemonCarousel.cy.tsx`
  - Arrow buttons cycle visible card
  - First/last button disabled state
- `PokedexGridCard.cy.tsx`
  - Renders pokemon name, `formatId` output, type pills with correct colors
  - Link href is `/pokedex/:id`

**`next/image` handling:** add `Cypress.on('uncaught:exception', () => false)` in mount support; assert on `src` only, never on rendered dimensions.

### 6. Code coverage wiring

Next 16 defaults to Turbopack/SWC; `@cypress/code-coverage` needs Istanbul (Babel plugin). We conditionally swap compilers via an env switch.

**`scripts/with-coverage.ts`:**

1. Write `babel.config.js` with `presets: ["next/babel"]` and `plugins: ["istanbul"]`
2. Spawn `next dev` (which auto-detects Babel and disables SWC)
3. On exit, delete `babel.config.js`

Result: `npm run dev` stays on Turbopack; only `COVERAGE=1` runs take the SWC→Babel hit.

**`cypress.config.ts` plugin wiring:**

```ts
setupNodeEvents(on, config) {
  require("@cypress/code-coverage/task")(on, config);
  return config;
}
```

**Support files** (`support/e2e.ts` and `support/component.ts`):

```ts
import "@cypress/code-coverage/support";
```

**Output:**

- `coverage/lcov-report/index.html` — browsable HTML
- `coverage/lcov.info` — for CI uploaders

**Coverage target:** no hard gate in v1. Soft target of 70% lines/branches across `src/app/**` once the suite lands; ratchet later.

**Fallback plan:** if the Babel-swap approach eats more than ~1 hour debugging, drop server-side coverage and instrument only client bundles via a `next.config.ts` webpack hook adding `istanbul-loader` to `.tsx` files. Lower coverage scope, simpler wiring.

### 7. CI workflow

**`.github/workflows/cypress.yml`:**

```yaml
name: cypress
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: E2E (stubbed, with coverage)
        uses: cypress-io/github-action@v6
        env:
          COVERAGE: "1"
        with:
          start: npm run dev:stub:coverage
          wait-on: "http://localhost:3000"
          browser: chrome
          spec: cypress/e2e/**/*.cy.ts
      - name: Component tests (with coverage)
        uses: cypress-io/github-action@v6
        env:
          COVERAGE: "1"
        with:
          install: false
          component: true
      - name: Generate coverage report
        run: npx nyc report --reporter=lcov --reporter=html
      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/lcov-report
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

`cypress-io/github-action` handles the Cypress binary cache. E2E and component are separate steps so failures are isolated.

### 8. npm scripts

Add to `package.json`:

```jsonc
{
  "scripts": {
    "dev:stub":           "CYPRESS_MODE=stub NEXT_PUBLIC_POKEAPI_BASE=http://localhost:4000/api/v2 concurrently \"tsx cypress/fixture-server.ts\" \"next dev\"",
    "dev:stub:coverage":  "CYPRESS_MODE=stub NEXT_PUBLIC_POKEAPI_BASE=http://localhost:4000/api/v2 COVERAGE=1 concurrently \"tsx cypress/fixture-server.ts\" \"tsx scripts/with-coverage.ts\"",
    "dev:coverage":       "COVERAGE=1 tsx scripts/with-coverage.ts",
    "cy:open":       "cypress open",
    "cy:run":        "cypress run",
    "cy:run:stub":   "start-server-and-test dev:stub http://localhost:3000 'cypress run'",
    "cy:capture":    "tsx scripts/capture-pokeapi-fixtures.ts",
    "test":          "npm run cy:run:stub && cypress run --component"
  }
}
```

### 9. Day-to-day usage

| Task | Command |
|---|---|
| Author tests against real PokéAPI | `npm run dev` + `npm run cy:open` |
| Run full stubbed suite locally (mirrors CI) | `npm run cy:run:stub` |
| Component tests only | `cypress open --component` |
| Coverage report | `COVERAGE=1 npm run cy:run:stub` → open `coverage/lcov-report/index.html` |
| Refresh fixtures from real API | `npm run cy:capture` |

## Out of scope (v1)

- Accessibility tests (`cypress-axe`) — defer; can be added later as a single line per page test
- Visual regression (Percy/Chromatic)
- Cypress Cloud dashboard / parallelization
- BDD / Gherkin layer
- Unit tests for pure functions (`team-analysis.ts`, `types-chart.ts`) — exercised via component spec instead
- `/wip` route — placeholder, no behavior to test
- Hard coverage gate — soft target only

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Istanbul/Babel/Next 16 wiring eats too much time | Fallback to client-only instrumentation via webpack loader (Section 6) |
| `next/image` causes spurious errors in component tests | `uncaught:exception` handler in support; assert on `src` only |
| Server components can't be mounted | Only client components have component specs (TeamBuilder, PokemonCarousel, PokedexGridCard); confirmed all three are client components |
| Fixture drift from real API | `npm run cy:capture` regenerates from real PokéAPI on demand |
| Local dev requires PokéAPI online | `cy:run:stub` works offline; documented in Section 9 |

## Implementation order (rough)

1. Install deps, scaffold `cypress.config.ts`, get a hello-world E2E spec passing against `npm run dev`
2. Write `home.cy.ts` E2E against real API
3. Add fixture server + capture script; wire `dev:stub`; get `home.cy.ts` passing in stub mode
4. Add remaining E2E specs (`pokedex-grid`, `pokedex-detail`, `team-builder`)
5. Configure component mode; write `PokedexGridCard.cy.tsx` (simplest), then `PokemonCarousel.cy.tsx`, then `TeamBuilder.cy.tsx`
6. Wire `@cypress/code-coverage` + `with-coverage.ts`
7. Add GH Actions workflow
8. Document in `README.md`

Detailed step-by-step plan to be produced by the writing-plans skill once this design is approved.
