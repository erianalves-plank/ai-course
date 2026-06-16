# Cypress Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a learning-focused Cypress test suite to the ai-course Next.js 16 project, covering E2E and component tests with hybrid PokéAPI handling (real local, stubbed CI), code coverage, and GitHub Actions.

**Architecture:** Cypress 13+ with both E2E and component modes. Server-side fetches are redirected to a local fixture server in stub mode via `NEXT_PUBLIC_POKEAPI_BASE`. Client-side fetches (if any) use `cy.intercept`. Code coverage uses `babel-plugin-istanbul` toggled by `COVERAGE=1`, falling back to plain SWC otherwise.

**Tech Stack:** Cypress, `@cypress/code-coverage`, `babel-plugin-istanbul`, `nyc`, `start-server-and-test`, `concurrently`, GitHub Actions.

**Spec reference:** [`docs/superpowers/specs/2026-06-15-cypress-testing-design.md`](../specs/2026-06-15-cypress-testing-design.md)

---

## File map

**Created:**
- `cypress.config.ts`
- `cypress/support/e2e.ts`
- `cypress/support/component.ts`
- `cypress/support/commands.ts`
- `cypress/support/index.d.ts`
- `cypress/fixture-server.ts`
- `cypress/fixtures/pokemon/{1..151}.json` (generated)
- `cypress/fixtures/species/{1..151}.json` (generated)
- `cypress/e2e/home.cy.ts`
- `cypress/e2e/pokedex-grid.cy.ts`
- `cypress/e2e/pokedex-detail.cy.ts`
- `cypress/e2e/team-builder.cy.ts`
- `cypress/component/PokedexGridCard.cy.tsx`
- `cypress/component/PokemonCarousel.cy.tsx`
- `cypress/component/TeamBuilder.cy.tsx`
- `cypress/tsconfig.json`
- `scripts/capture-pokeapi-fixtures.ts`
- `scripts/with-coverage.ts`
- `.github/workflows/cypress.yml`

**Modified:**
- `src/app/lib/pokeapi.ts` (line 71: env-var hook)
- `package.json` (devDeps + scripts)
- `tsconfig.json` (exclude cypress)
- `.gitignore` (cypress outputs)
- `README.md` (testing section)

---

## Task 1: Install Cypress and create base config

**Files:**
- Create: `cypress.config.ts`, `cypress/support/e2e.ts`, `cypress/tsconfig.json`
- Modify: `package.json`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Install Cypress and helpers**

```bash
npm install --save-dev cypress start-server-and-test
```

Expected: packages added under `devDependencies`, no errors.

- [ ] **Step 2: Create `cypress.config.ts`**

```ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
  },
});
```

- [ ] **Step 3: Create `cypress/support/e2e.ts`**

```ts
// E2E support file — runs before each spec.
// Reserved for global hooks and command imports.
export {};
```

- [ ] **Step 4: Create `cypress/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "esnext"],
    "types": ["cypress", "node"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

- [ ] **Step 5: Exclude `cypress/` from the app's `tsconfig.json`**

In `tsconfig.json`, change `"exclude": ["node_modules"]` to:

```json
"exclude": ["node_modules", "cypress"]
```

- [ ] **Step 6: Add Cypress outputs to `.gitignore`**

Append:

```
# Cypress
cypress/videos
cypress/screenshots
cypress/downloads
.nyc_output
coverage
```

- [ ] **Step 7: Add base npm scripts to `package.json`**

Under `"scripts"`, add:

```jsonc
"cy:open": "cypress open",
"cy:run":  "cypress run"
```

- [ ] **Step 8: Smoke test — open Cypress, close it**

Run: `npx cypress verify`
Expected: `Verified Cypress!` message, no errors.

- [ ] **Step 9: Commit**

```bash
git add cypress.config.ts cypress/support/e2e.ts cypress/tsconfig.json tsconfig.json .gitignore package.json package-lock.json
git commit -m "Add Cypress base config and tsconfig"
```

---

## Task 2: Add `NEXT_PUBLIC_POKEAPI_BASE` env hook to PokéAPI client

**Files:**
- Modify: `src/app/lib/pokeapi.ts:71`

- [ ] **Step 1: Replace the hard-coded `POKEAPI` constant**

In `src/app/lib/pokeapi.ts` line 71, replace:

```ts
const POKEAPI = "https://pokeapi.co/api/v2";
```

with:

```ts
const POKEAPI =
  process.env.NEXT_PUBLIC_POKEAPI_BASE ?? "https://pokeapi.co/api/v2";
```

- [ ] **Step 2: Verify the app still builds**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Verify dev server still works against real API**

Run: `npm run dev`
Open `http://localhost:3000` in a browser. Expected: home page renders with 6 Pokémon cards.
Stop the server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add src/app/lib/pokeapi.ts
git commit -m "Allow PokéAPI base URL override via NEXT_PUBLIC_POKEAPI_BASE"
```

---

## Task 3: Write the home E2E spec against real API

**Files:**
- Create: `cypress/e2e/home.cy.ts`

- [ ] **Step 1: Create `cypress/e2e/home.cy.ts`**

```ts
describe("Home page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the hero headline and CTAs", () => {
    cy.contains("h1", "Who").should("be.visible");
    cy.contains("a", "Open the Pokédex").should("have.attr", "href", "/pokedex");
    cy.contains("a", "Build a team").should("have.attr", "href", "/team");
  });

  it("renders six carousel cards from the API", () => {
    cy.get("[data-carousel-card]").should("have.length", 6);
  });

  it("right arrow scrolls the carousel forward", () => {
    cy.get('button[aria-label="Next Pokémon"]').click();
    // After scrolling forward, the left arrow should be enabled.
    cy.get('button[aria-label="Previous Pokémon"]').should("not.be.disabled");
  });
});
```

- [ ] **Step 2: Run dev server in one terminal**

```bash
npm run dev
```

- [ ] **Step 3: Run the spec headless in another terminal**

```bash
npx cypress run --spec cypress/e2e/home.cy.ts
```

Expected: `3 passing`.

- [ ] **Step 4: Stop the dev server (Ctrl+C)**

- [ ] **Step 5: Commit**

```bash
git add cypress/e2e/home.cy.ts
git commit -m "Add home E2E spec covering hero, CTAs, and carousel"
```

---

## Task 4: Capture PokéAPI fixtures for all 151 Gen 1 IDs

**Files:**
- Create: `scripts/capture-pokeapi-fixtures.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/capture-pokeapi-fixtures.ts`**

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://pokeapi.co/api/v2";
const OUT = join(process.cwd(), "cypress/fixtures");
const COUNT = 151;

async function dump(path: string, file: string) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  const json = await res.json();
  writeFileSync(file, JSON.stringify(json));
}

async function main() {
  mkdirSync(join(OUT, "pokemon"), { recursive: true });
  mkdirSync(join(OUT, "species"), { recursive: true });

  for (let id = 1; id <= COUNT; id++) {
    console.log(`Capturing ${id}/${COUNT}`);
    await dump(`/pokemon/${id}`, join(OUT, "pokemon", `${id}.json`));
    await dump(`/pokemon-species/${id}`, join(OUT, "species", `${id}.json`));
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the `cy:capture` script**

In `package.json` under `"scripts"`:

```jsonc
"cy:capture": "tsx scripts/capture-pokeapi-fixtures.ts"
```

- [ ] **Step 3: Run it**

```bash
npm run cy:capture
```

Expected: 302 files written under `cypress/fixtures/pokemon/` and `cypress/fixtures/species/`. Takes ~1–2 minutes.

- [ ] **Step 4: Verify a sample**

Run: `cat cypress/fixtures/pokemon/1.json | head -c 200`
Expected: JSON starting with `{"abilities":...` for Bulbasaur.

- [ ] **Step 5: Commit**

```bash
git add scripts/capture-pokeapi-fixtures.ts package.json package-lock.json cypress/fixtures
git commit -m "Add PokéAPI fixture capture script and snapshot all 151 Gen 1 responses"
```

---

## Task 5: Build the fixture HTTP server

**Files:**
- Create: `cypress/fixture-server.ts`
- Modify: `package.json`

- [ ] **Step 1: Install `concurrently`**

```bash
npm install --save-dev concurrently
```

- [ ] **Step 2: Create `cypress/fixture-server.ts`**

```ts
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PORT = 4000;
const ROOT = join(process.cwd(), "cypress/fixtures");

const server = createServer((req, res) => {
  // URL shape: /api/v2/pokemon/:id  or  /api/v2/pokemon-species/:id
  const match = req.url?.match(/^\/api\/v2\/(pokemon|pokemon-species)\/(\d+)\/?$/);
  if (!match) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not a fixture route");
    return;
  }

  const kind = match[1] === "pokemon" ? "pokemon" : "species";
  const id = match[2];
  const file = join(ROOT, kind, `${id}.json`);

  if (!existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end(`no fixture for ${kind}/${id}`);
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(readFileSync(file));
});

server.listen(PORT, () => {
  console.log(`Fixture server listening on http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Add the `dev:stub` script**

In `package.json` under `"scripts"`:

```jsonc
"dev:stub": "CYPRESS_MODE=stub NEXT_PUBLIC_POKEAPI_BASE=http://localhost:4000/api/v2 concurrently \"tsx cypress/fixture-server.ts\" \"next dev\""
```

- [ ] **Step 4: Sanity check the fixture server alone**

```bash
npx tsx cypress/fixture-server.ts &
sleep 1
curl -s http://localhost:4000/api/v2/pokemon/1 | head -c 80
kill %1
```

Expected: JSON starting with `{"abilities":...`.

- [ ] **Step 5: Commit**

```bash
git add cypress/fixture-server.ts package.json package-lock.json
git commit -m "Add fixture HTTP server and dev:stub script"
```

---

## Task 6: Add `cy:run:stub` and verify home spec passes in stub mode

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the `cy:run:stub` script**

```jsonc
"cy:run:stub": "start-server-and-test dev:stub http://localhost:3000 'cypress run'"
```

- [ ] **Step 2: Run the home spec in stub mode**

```bash
npx start-server-and-test dev:stub http://localhost:3000 'cypress run --spec cypress/e2e/home.cy.ts'
```

Expected: `3 passing`. No external network calls to pokeapi.co.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Add cy:run:stub script"
```

---

## Task 7: Write the Pokédex grid E2E spec

**Files:**
- Create: `cypress/e2e/pokedex-grid.cy.ts`

- [ ] **Step 1: Create the spec**

```ts
describe("Pokédex grid", () => {
  beforeEach(() => {
    cy.visit("/pokedex");
  });

  it("renders all 151 Gen 1 Pokémon cards", () => {
    cy.get("main ul > li").should("have.length", 151);
  });

  it("shows the page title and Gen 1 label", () => {
    cy.contains("h1", "The Pokédex").should("be.visible");
    cy.contains("Generation I").should("be.visible");
  });

  it("first card links to /pokedex/1", () => {
    cy.get("main ul > li a").first().should("have.attr", "href", "/pokedex/1");
  });

  it("navigating to a card opens the detail page", () => {
    cy.get("main ul > li a").first().click();
    cy.location("pathname").should("eq", "/pokedex/1");
  });
});
```

- [ ] **Step 2: Run in stub mode**

```bash
npx start-server-and-test dev:stub http://localhost:3000 'cypress run --spec cypress/e2e/pokedex-grid.cy.ts'
```

Expected: `4 passing`.

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/pokedex-grid.cy.ts
git commit -m "Add Pokédex grid E2E spec"
```

---

## Task 8: Write the Pokédex detail E2E spec

**Files:**
- Create: `cypress/e2e/pokedex-detail.cy.ts`

- [ ] **Step 1: Create the spec**

```ts
describe("Pokédex detail", () => {
  it("renders Bulbasaur's name, genus, and stats", () => {
    cy.visit("/pokedex/1");
    cy.contains("h1", "Bulbasaur").should("be.visible");
    cy.contains("Seed Pokémon").should("be.visible");
    cy.contains("Base stats").should("be.visible");
    cy.contains("HP").should("be.visible");
  });

  it("shows next button on first page and navigates", () => {
    cy.visit("/pokedex/1");
    cy.contains("a", "N°002").click();
    cy.location("pathname").should("eq", "/pokedex/2");
    cy.contains("h1", "Ivysaur").should("be.visible");
  });

  it("renders 404 for out-of-range id", () => {
    cy.request({ url: "/pokedex/9999", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });

  it("renders 404 for non-numeric id", () => {
    cy.request({ url: "/pokedex/abc", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });
});
```

- [ ] **Step 2: Run**

```bash
npx start-server-and-test dev:stub http://localhost:3000 'cypress run --spec cypress/e2e/pokedex-detail.cy.ts'
```

Expected: `4 passing`.

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/pokedex-detail.cy.ts
git commit -m "Add Pokédex detail E2E spec including 404 paths"
```

---

## Task 9: Write the team-builder E2E spec

**Files:**
- Create: `cypress/e2e/team-builder.cy.ts`

`/team` loads local JSON — no API stubbing needed. This is a long spec because the journey is the point.

- [ ] **Step 1: Create the spec**

```ts
describe("Team builder", () => {
  beforeEach(() => {
    cy.visit("/team");
  });

  it("renders the team section with empty slots", () => {
    cy.get("section").contains("Your team").should("be.visible");
    cy.contains("Empty slot").should("be.visible");
  });

  it("clicking a picker fills the first empty slot", () => {
    cy.get("ul.grid > li button").first().click();
    cy.get('button[aria-label^="Remove"]').should("exist");
  });

  it("shows analysis once three Pokémon are picked", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("Coverage analysis").should("be.visible");
    cy.contains(/Covered|Exposed|Stacked/).should("be.visible");
  });

  it("clear button empties all slots and hides analysis", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("button", "clear").click();
    cy.contains("Coverage analysis").should("not.exist");
    cy.get('button[aria-label^="Remove"]').should("not.exist");
  });

  it("search filter narrows the picker", () => {
    cy.get('input[type="search"]').type("azumarill");
    cy.get("ul.grid > li").should("have.length.at.most", 5);
  });

  it("random button fills three slots and shows analysis", () => {
    cy.contains("button", "random").click();
    cy.contains("Coverage analysis").should("be.visible");
  });
});
```

- [ ] **Step 2: Run**

```bash
npx start-server-and-test dev:stub http://localhost:3000 'cypress run --spec cypress/e2e/team-builder.cy.ts'
```

Expected: `6 passing`.

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/team-builder.cy.ts
git commit -m "Add team-builder E2E spec covering the full journey"
```

---

## Task 10: Add component-testing config

**Files:**
- Create: `cypress/support/component.ts`, `cypress/support/index.d.ts`
- Modify: `cypress.config.ts`, `package.json`

- [ ] **Step 1: Install React adapter**

```bash
npm install --save-dev @cypress/react webpack html-webpack-plugin
```

- [ ] **Step 2: Replace `cypress.config.ts` with E2E + component config**

```ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.tsx",
    supportFile: "cypress/support/component.ts",
    video: false,
  },
});
```

- [ ] **Step 3: Create `cypress/support/component.ts`**

```ts
import { mount } from "cypress/react";
import "../../src/app/globals.css";

// Ignore noise from next/image when running in the component test harness.
Cypress.on("uncaught:exception", () => false);

Cypress.Commands.add("mount", mount);
```

- [ ] **Step 4: Create `cypress/support/index.d.ts` for `cy.mount` typings**

```ts
import type { mount } from "cypress/react";

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

export {};
```

- [ ] **Step 5: Add component-mode npm scripts**

In `package.json`:

```jsonc
"cy:open:ct": "cypress open --component",
"cy:run:ct":  "cypress run --component"
```

- [ ] **Step 6: Sanity check — list config**

```bash
npx cypress verify
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add cypress.config.ts cypress/support/component.ts cypress/support/index.d.ts package.json package-lock.json
git commit -m "Add Cypress component-testing config"
```

---

## Task 11: Write `PokedexGridCard` component spec

**Files:**
- Create: `cypress/component/PokedexGridCard.cy.tsx`

- [ ] **Step 1: Create the spec**

```tsx
import { PokedexGridCard } from "../../src/app/_components/PokedexGridCard";
import type { PokemonGridData } from "../../src/app/lib/pokeapi";

const PIKACHU: PokemonGridData = {
  id: 25,
  name: "pikachu",
  types: ["electric"],
  artworkUrl: "https://example.com/pikachu.png",
};

describe("<PokedexGridCard />", () => {
  it("renders the title-cased name", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.contains("Pikachu").should("be.visible");
  });

  it("renders the formatted dex id", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.contains("N°025").should("be.visible");
  });

  it("renders a type pill for each type", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.contains("span", "electric").should("be.visible");
  });

  it("links to the detail route", () => {
    cy.mount(<PokedexGridCard pokemon={PIKACHU} />);
    cy.get("a").should("have.attr", "href", "/pokedex/25");
  });

  it("renders dual types", () => {
    const bulbasaur: PokemonGridData = {
      id: 1,
      name: "bulbasaur",
      types: ["grass", "poison"],
      artworkUrl: "https://example.com/bulba.png",
    };
    cy.mount(<PokedexGridCard pokemon={bulbasaur} />);
    cy.contains("span", "grass");
    cy.contains("span", "poison");
  });
});
```

- [ ] **Step 2: Run**

```bash
npx cypress run --component --spec cypress/component/PokedexGridCard.cy.tsx
```

Expected: `5 passing`.

- [ ] **Step 3: Commit**

```bash
git add cypress/component/PokedexGridCard.cy.tsx
git commit -m "Add PokedexGridCard component spec"
```

---

## Task 12: Write `PokemonCarousel` component spec

**Files:**
- Create: `cypress/component/PokemonCarousel.cy.tsx`

- [ ] **Step 1: Create the spec**

```tsx
import { PokemonCarousel } from "../../src/app/_components/PokemonCarousel";
import type { PokemonCardData } from "../../src/app/lib/pokeapi";

const SAMPLE: PokemonCardData[] = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `mon-${i + 1}`,
  types: ["normal"],
  heightM: 1,
  weightKg: 10,
  abilityName: "blaze",
  genus: "Test Pokémon",
  artworkUrl: "https://example.com/x.png",
}));

describe("<PokemonCarousel />", () => {
  it("renders a card per item", () => {
    cy.mount(<PokemonCarousel pokemons={SAMPLE} />);
    cy.get("[data-carousel-card]").should("have.length", 4);
  });

  it("left arrow starts disabled, right arrow enabled", () => {
    cy.mount(<PokemonCarousel pokemons={SAMPLE} />);
    cy.get('button[aria-label="Previous Pokémon"]').should("be.disabled");
    cy.get('button[aria-label="Next Pokémon"]').should("not.be.disabled");
  });

  it("clicking next scrolls the track", () => {
    cy.mount(<PokemonCarousel pokemons={SAMPLE} />);
    cy.get('button[aria-label="Next Pokémon"]').click();
    cy.get('button[aria-label="Previous Pokémon"]', { timeout: 2000 })
      .should("not.be.disabled");
  });
});
```

- [ ] **Step 2: Run**

```bash
npx cypress run --component --spec cypress/component/PokemonCarousel.cy.tsx
```

Expected: `3 passing`.

- [ ] **Step 3: Commit**

```bash
git add cypress/component/PokemonCarousel.cy.tsx
git commit -m "Add PokemonCarousel component spec"
```

---

## Task 13: Write `TeamBuilder` component spec

**Files:**
- Create: `cypress/component/TeamBuilder.cy.tsx`

- [ ] **Step 1: Create the spec**

```tsx
import { TeamBuilder, type PokemonEntry } from "../../src/app/_components/TeamBuilder";

const SAMPLE: PokemonEntry[] = [
  { slug: "azumarill", name: "azumarill", types: ["water", "fairy"], tier: "S", rank: 1 },
  { slug: "altaria",   name: "altaria",   types: ["dragon", "flying"], tier: "S", rank: 2 },
  { slug: "registeel", name: "registeel", types: ["steel"], tier: "A+", rank: 3 },
  { slug: "medicham",  name: "medicham",  types: ["fighting", "psychic"], tier: "A", rank: 4 },
  { slug: "swampert",  name: "swampert",  types: ["water", "ground"], tier: "S", rank: 5 },
];

describe("<TeamBuilder />", () => {
  beforeEach(() => {
    cy.mount(<TeamBuilder pokemon={SAMPLE} />);
  });

  it("starts empty and shows no analysis", () => {
    cy.contains("Empty slot").should("be.visible");
    cy.contains("Coverage analysis").should("not.exist");
  });

  it("search filter narrows the picker", () => {
    cy.get('input[type="search"]').type("altaria");
    cy.get("ul.grid > li").should("have.length", 1);
    cy.contains("Altaria");
  });

  it("type filter narrows the picker", () => {
    cy.get("select").select("water");
    cy.get("ul.grid > li").each(($li) => {
      cy.wrap($li).find("span").should("contain.text", "water");
    });
  });

  it("clicking a picker fills the first empty slot and disables the picker item", () => {
    cy.get("ul.grid > li").first().find("button").click();
    cy.get("ul.grid > li").first().find("button").should("be.disabled");
  });

  it("removing a slot frees it", () => {
    cy.get("ul.grid > li").first().find("button").click();
    cy.get('button[aria-label^="Remove"]').first().click();
    cy.get('button[aria-label^="Remove"]').should("not.exist");
  });

  it("filling three slots shows the analysis", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("Coverage analysis").should("be.visible");
  });

  it("clear button empties all slots", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("ul.grid > li button:not(:disabled)").first().click();
    }
    cy.contains("button", "clear").click();
    cy.contains("Coverage analysis").should("not.exist");
  });

  it("random fills three slots", () => {
    cy.contains("button", "random").click();
    cy.contains("Coverage analysis").should("be.visible");
  });
});
```

- [ ] **Step 2: Run**

```bash
npx cypress run --component --spec cypress/component/TeamBuilder.cy.tsx
```

Expected: `8 passing`.

- [ ] **Step 3: Commit**

```bash
git add cypress/component/TeamBuilder.cy.tsx
git commit -m "Add TeamBuilder component spec covering picker, slots, analysis"
```

---

## Task 14: Wire `@cypress/code-coverage`

**Files:**
- Create: `scripts/with-coverage.ts`
- Modify: `cypress.config.ts`, `cypress/support/e2e.ts`, `cypress/support/component.ts`, `package.json`

- [ ] **Step 1: Install coverage deps**

```bash
npm install --save-dev @cypress/code-coverage babel-plugin-istanbul nyc
```

- [ ] **Step 2: Create `scripts/with-coverage.ts`**

```ts
import { spawn } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

const BABEL_PATH = join(process.cwd(), "babel.config.js");

const BABEL_CONFIG = `
module.exports = {
  presets: ["next/babel"],
  plugins: ["istanbul"],
};
`.trim();

writeFileSync(BABEL_PATH, BABEL_CONFIG);
console.log("[with-coverage] wrote babel.config.js");

const child = spawn("next", ["dev"], { stdio: "inherit" });

function cleanup() {
  if (existsSync(BABEL_PATH)) {
    unlinkSync(BABEL_PATH);
    console.log("[with-coverage] removed babel.config.js");
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  child.kill("SIGINT");
  cleanup();
  process.exit(0);
});

child.on("exit", (code) => {
  cleanup();
  process.exit(code ?? 0);
});
```

- [ ] **Step 3: Update `cypress.config.ts` `setupNodeEvents`**

Replace the `e2e` block with:

```ts
e2e: {
  baseUrl: "http://localhost:3000",
  specPattern: "cypress/e2e/**/*.cy.ts",
  supportFile: "cypress/support/e2e.ts",
  video: false,
  setupNodeEvents(on, config) {
    require("@cypress/code-coverage/task")(on, config);
    return config;
  },
},
```

And add the same `setupNodeEvents` to the `component` block.

- [ ] **Step 4: Import coverage in support files**

Prepend `cypress/support/e2e.ts`:

```ts
import "@cypress/code-coverage/support";
```

Prepend `cypress/support/component.ts` (before the existing imports):

```ts
import "@cypress/code-coverage/support";
```

- [ ] **Step 5: Add coverage scripts to `package.json`**

```jsonc
"dev:coverage":      "COVERAGE=1 tsx scripts/with-coverage.ts",
"dev:stub:coverage": "CYPRESS_MODE=stub NEXT_PUBLIC_POKEAPI_BASE=http://localhost:4000/api/v2 COVERAGE=1 concurrently \"tsx cypress/fixture-server.ts\" \"tsx scripts/with-coverage.ts\""
```

- [ ] **Step 6: Run E2E with coverage locally**

```bash
COVERAGE=1 npx start-server-and-test dev:stub:coverage http://localhost:3000 'cypress run'
```

Expected: all E2E specs pass. `.nyc_output/` populated.

- [ ] **Step 7: Generate the HTML report**

```bash
npx nyc report --reporter=html --reporter=lcov
```

Expected: `coverage/lcov-report/index.html` exists. Open it; verify `src/app/lib/team-analysis.ts` and route files show coverage.

- [ ] **Step 8: Commit**

```bash
git add scripts/with-coverage.ts cypress.config.ts cypress/support/e2e.ts cypress/support/component.ts package.json package-lock.json
git commit -m "Wire @cypress/code-coverage with Babel istanbul instrumentation"
```

**Fallback if Step 6 fails after ~1 hour debugging:** drop server-side coverage and instrument only client bundles via a `next.config.ts` webpack hook. Skip Task 14 if blocked and proceed to Task 15.

---

## Task 15: Add GitHub Actions workflow

**Files:**
- Create: `.github/workflows/cypress.yml`

- [ ] **Step 1: Create the workflow**

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

- [ ] **Step 2: Validate YAML syntax locally**

```bash
node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/cypress.yml','utf8'))" && echo OK
```

Expected: `OK`. (`js-yaml` ships transitively via `eslint`'s deps in this project — if the require fails, run `npm i --save-dev js-yaml` first.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/cypress.yml
git commit -m "Add GitHub Actions workflow for Cypress E2E and component tests"
```

---

## Task 16: Document the testing setup in README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append a testing section to `README.md`**

Append the following at the end of the file:

````markdown

## Testing

Cypress covers both E2E (full routes via the dev server) and component tests (mounted React components in isolation).

```bash
# Author E2E tests interactively against the real PokéAPI
npm run dev          # in one terminal
npm run cy:open      # in another

# Run the full stubbed suite locally (mirrors CI — no network)
npm run cy:run:stub

# Component tests
npm run cy:open:ct          # interactive
npm run cy:run:ct           # headless

# Refresh fixtures from the real PokéAPI
npm run cy:capture
```

### Modes

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_POKEAPI_BASE` | Overrides the PokéAPI base URL. Set automatically by `dev:stub`. |
| `COVERAGE=1` | Routes `next dev` through Babel + istanbul to collect coverage. |

### Coverage

```bash
COVERAGE=1 npm run cy:run:stub  # uses dev:stub:coverage internally
npx nyc report --reporter=html
open coverage/lcov-report/index.html
```

### CI

`.github/workflows/cypress.yml` runs both suites against the fixture server on every push and PR, uploads the coverage HTML report, and captures screenshots on failure.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Document Cypress testing setup in README"
```

---

## Final verification

- [ ] **Step 1: Run the full suite end-to-end in stub mode**

```bash
npm run cy:run:stub
```

Expected: 17 E2E tests pass.

- [ ] **Step 2: Run all component specs**

```bash
npm run cy:run:ct
```

Expected: 16 component tests pass.

- [ ] **Step 3: Push the branch and open a PR**

```bash
git push -u origin feature/cypress-testing-spec
gh pr create --title "Add Cypress test suite with E2E, component, coverage, and CI" --body "Implements the spec in docs/superpowers/specs/2026-06-15-cypress-testing-design.md"
```
