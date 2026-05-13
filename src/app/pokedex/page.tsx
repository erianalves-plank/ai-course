import Link from "next/link";
import { PokedexGridCard } from "../_components/PokedexGridCard";
import { fetchPokemonGrid, getAllGen1Ids } from "../lib/pokeapi";

export const metadata = {
  title: "Pokédex — Pokémon GO PVP Analysis",
  description: "Browse all Gen 1 Pokémon with types and artwork.",
};

const POKEBALL_RED = "#DC0A2D";
const CREAM = "#F7EFDF";
const POKEMON_NAVY = "#1E3A8A";

export default async function PokedexIndex() {
  const ids = getAllGen1Ids();
  const pokemons = await Promise.all(ids.map((id) => fetchPokemonGrid(id)));

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <header className="border-b border-zinc-200/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: POKEMON_NAVY }}
          >
            ← Back home
          </Link>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
            style={{ backgroundColor: POKEBALL_RED }}
          >
            pokédex
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-col gap-2">
          <p
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: POKEBALL_RED }}
          >
            Generation I
          </p>
          <h1
            className="text-4xl font-black tracking-tight sm:text-5xl"
            style={{ color: POKEMON_NAVY }}
          >
            The Pokédex
          </h1>
          <p className="max-w-xl text-sm text-zinc-600">
            All {pokemons.length} Pokémon from the original region. Tap a card
            for stats, abilities, and lore.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {pokemons.map((p) => (
            <li key={p.id}>
              <PokedexGridCard pokemon={p} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
