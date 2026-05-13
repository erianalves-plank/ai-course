# Data fetching: server vs. client

This project's home page fetches Pokémon from [PokéAPI](https://pokeapi.co) on the **server**. That's why you don't see `pokeapi.co` calls in the browser's network tab — by the time the HTML reaches the browser, the data is already in it.

This doc explains how that works, where the boundary between server and client actually is, and what it would take to flip it the other way.

## The mental model

A Next.js App Router page is a tree of React components. Each component is one of two flavors:

- **Server Component** (the default). Runs once per request on the Node.js server. Can use `async/await`, talk to databases, call HTTP APIs, read files. Its rendered output is HTML. **It never ships to the browser as JavaScript.**
- **Client Component** (opted-in with `"use client"`). Runs in the browser. Can use `useState`, `useEffect`, event handlers, browser APIs. Its source code is sent to the browser as a JS bundle.

A page can mix both: server components can render client components (passing them serializable props), but not the other way around.

The request flow for a server-rendered page roughly looks like:

```
Browser ──GET /──▶ Next.js server
                   │
                   │  runs Home() (a Server Component)
                   │    ├─ await connection()          ← marks the route dynamic
                   │    └─ await fetchRandomPokemon(6) ← talks to pokeapi.co from Node
                   │
                   │  renders the React tree to HTML, embedding the data
                   ▼
Browser ◀──HTML─── Next.js server
        (with carousel markup + Pokémon data baked in)

Browser then:
  • parses HTML
  • requests static assets (JS bundles, images)
  • hydrates Client Components (the carousel's arrow buttons)
```

So the *only* HTTP calls the browser makes are: the initial document request, the JS bundles, and the artwork images on `raw.githubusercontent.com`. The PokéAPI calls happen entirely server-side.

## How it works in this codebase

Three files matter:

### 1. The Server Component — [src/app/page.tsx](../src/app/page.tsx)

```tsx
import { connection } from "next/server";
import { PokemonCarousel } from "./_components/PokemonCarousel";
import { fetchRandomPokemon } from "./lib/pokeapi";

export default async function Home() {
  await connection();                          // opt into request-time dynamic
  const pokemons = await fetchRandomPokemon(6); // runs on the server

  return (
    // ... hero ...
    <PokemonCarousel pokemons={pokemons} />
  );
}
```

Key points:

- `async function Home()` — Server Components can be async and `await` data.
- `await connection()` — tells Next.js this render depends on the incoming request. Without it (and without other dynamic signals), Next would try to render once at build time and cache forever, which is wrong for "random per visit."
- `fetchRandomPokemon(6)` is awaited before the JSX returns, so the HTML can be assembled with the data already in place.

### 2. The data fetcher — [src/app/lib/pokeapi.ts](../src/app/lib/pokeapi.ts)

```ts
async function fetchPokemonCard(id: number): Promise<PokemonCardData> {
  const [pokemon, species] = await Promise.all([
    fetch(`${POKEAPI}/pokemon/${id}`, { cache: "force-cache" }).then(r => r.json()),
    fetch(`${POKEAPI}/pokemon-species/${id}`, { cache: "force-cache" }).then(r => r.json()),
  ]);
  // ... shape the data ...
}
```

This uses the **standard global `fetch`**, but because the file is imported by a Server Component, the calls execute in Node, not the browser. `cache: "force-cache"` tells Next to remember responses across requests — so if visit A samples Pokémon #25 and visit B samples #25 again, visit B doesn't actually call PokéAPI.

### 3. The Client Component — [src/app/\_components/PokemonCarousel.tsx](../src/app/_components/PokemonCarousel.tsx)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
// ...
export function PokemonCarousel({ pokemons }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  // arrow buttons, scroll handlers...
}
```

The `"use client"` directive flips this file into the browser. It receives `pokemons` as a prop from the server (which is why the data needs to be serializable — plain objects, no functions or class instances). The carousel itself only handles interactivity: arrow clicks, scroll position tracking. It never fetches data.

## Why server-side here?

Trade-offs that drove the choice:

| Concern | Server fetch | Client fetch |
|---|---|---|
| First paint contains data | Yes | No — needs a loading state |
| PokéAPI key/secret leaks | N/A (no key needed) | Would leak if there was one |
| Browser network tab shows the API | No | Yes |
| Per-request cache across users | Yes (`force-cache`) | No (each browser is alone) |
| Failure surface | Server returns an error page | Browser must handle network errors |
| JS bundle size | Smaller — fetch logic doesn't ship | Larger — fetch + parsing ships |

For a public, read-only API like PokéAPI, both work. The server path was chosen because it's simpler, faster to first paint, and lets the shared server cache absorb most of the traffic.

## What it would take to fetch on the client instead

If you wanted the PokéAPI requests to show up in the browser's network tab — e.g. for a real-time feature where the carousel re-rolls without a full page navigation — the structural changes are:

### Step 1: Move the fetch into the Client Component

The carousel becomes responsible for both UI **and** data. The Server Component just renders an empty shell.

```tsx
// src/app/_components/PokemonCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import { type PokemonCardData } from "../lib/pokeapi";

export function PokemonCarousel() {
  const [pokemons, setPokemons] = useState<PokemonCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/random-pokemon?count=6")
      .then(r => r.json())
      .then(data => { if (!cancelled) setPokemons(data); })
      .catch(e => { if (!cancelled) setError(String(e)); });
    return () => { cancelled = true; };
  }, []);

  if (error) return <p>Couldn't load Pokémon.</p>;
  if (!pokemons) return <CarouselSkeleton />;
  return <CarouselTrack pokemons={pokemons} />;
}
```

A few things shift:

- The component now needs a **loading state** (`CarouselSkeleton`) — the first render has no data.
- An **error state** is required — network calls in the browser are flaky.
- `useEffect` runs *after* hydration, so the data appears on the second render at the earliest.

### Step 2: Decide whether to call PokéAPI directly or proxy it

Two options for where the browser sends the request:

**Option A — call PokéAPI directly from the browser.**

```ts
fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
```

Pros: no backend code. Cons: every visitor's browser is a fresh client with no shared cache; you can't add an API key later without leaking it; CORS must be permissive on the upstream (PokéAPI happens to allow it, many APIs don't); rate limiting hits per-user instead of per-server.

**Option B — proxy through a Next.js Route Handler.**

```ts
// src/app/api/random-pokemon/route.ts
import { fetchRandomPokemon, GEN_1_MAX } from "@/app/lib/pokeapi";

const MAX_COUNT = Math.min(24, GEN_1_MAX);

export async function GET(req: Request) {
  const raw = Number(new URL(req.url).searchParams.get("count") ?? 6);
  if (!Number.isFinite(raw) || raw < 1) {
    return Response.json({ error: "count must be a positive integer" }, { status: 400 });
  }
  const count = Math.min(Math.floor(raw), MAX_COUNT);
  const data = await fetchRandomPokemon(count);
  return Response.json(data);
}
```

Note the clamp: `sampleUniqueIds(count, 151)` will hang forever if asked for more than 151 unique IDs from a pool of 151, since the loop can never grow the set past the pool size. Always validate untrusted input and cap it below the pool size — never trust `?count=` from the client.

The browser hits `/api/random-pokemon`, your server hits PokéAPI. This keeps the server-side cache, hides any future API key, and centralizes rate limiting. For most apps this is the right answer even when the *trigger* is client-side.

### Step 3: Remove the server fetch from the page

The home page no longer awaits data — it just renders the empty carousel shell.

```tsx
export default function Home() {
  return (
    // ... hero ...
    <PokemonCarousel /> {/* no props */}
  );
}
```

Now `Home` can go back to being a static page (`export const revalidate = false`); only the API route is dynamic.

### Step 4: Handle the things SSR gave you for free

- **Loading skeleton** — the carousel must not be jarring when it pops in.
- **Error UI** — what happens when the user's wifi blips?
- **Hydration mismatch** — make sure nothing in the carousel renders different content on server vs. client during the first paint.
- **SEO** — if you cared about Pokémon names being in the HTML for search engines or social-share previews, client fetching removes them. (Not a concern for this app, but it is for many.)

## When to pick which

A rough decision tree:

- **Render-once-per-request, no user interaction with the data → Server Component.** Faster first paint, smaller bundle, simpler code. Default to this.
- **Data depends on user interaction (search, filters, infinite scroll) → Client Component with a route handler.** Use server fetch for the *initial* page, client fetch for the *changes*.
- **Data depends on cookies, headers, or session that only exist at request time → Server Component with `connection()` / `cookies()` / `headers()`.** Stays server-side, still dynamic.
- **Real-time updates (chat, prices, presence) → Client Component, possibly with `EventSource` or a WebSocket.**

For the trending carousel as it exists today, server-side wins on every axis except "I want to see the request in DevTools." If the requirement changes — say, you add a "shuffle" button that re-rolls without a full navigation — that's when the client-side approach starts to pull its weight.
