import Link from "next/link";
import { TeamBuilder, type PokemonEntry } from "../_components/TeamBuilder";
import data from "../../../data/great-league.json";
import type { PokemonType } from "../lib/pokeapi";
import { fetchArtworkUrl } from "../lib/pokebase-artwork";

export const metadata = {
  title: "Team builder — Pokémon GO PVP Analysis",
  description:
    "Pick three Pokémon from the Great League meta and see your team's type coverage instantly.",
};

const POKEBALL_RED = "#DC0A2D";
const CREAM = "#F7EFDF";
const POKEMON_NAVY = "#1E3A8A";

const TIER_ORDER = ["S", "A+", "A", "B+", "B", "C"];

export default async function TeamPage() {
  const baseEntries = data.pokemon.map((p) => ({
    slug: p.slug,
    name: p.name,
    types: p.types as PokemonType[],
    tier: p.tier,
    rank: p.rank,
  }));

  // Resolve PokéAPI artwork URLs at build time. Each fetch is cached, so
  // overlaps with the pokédex grid don't double-charge.
  const artworkUrls = await Promise.all(
    baseEntries.map((p) => fetchArtworkUrl(p.slug)),
  );

  const pokemon: PokemonEntry[] = baseEntries
    .map((p, i) => ({ ...p, imageUrl: artworkUrls[i] }))
    .sort((a, b) => {
      const ta = TIER_ORDER.indexOf(a.tier);
      const tb = TIER_ORDER.indexOf(b.tier);
      if (ta !== tb) return ta - tb;
      return a.rank - b.rank;
    });

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <header className="border-b border-zinc-200/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
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
            team builder
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="mb-8 flex flex-col gap-2">
          <p
            className="text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: POKEBALL_RED }}
          >
            Great League
          </p>
          <h1
            className="text-4xl font-black tracking-tight sm:text-5xl"
            style={{ color: POKEMON_NAVY }}
          >
            Build a team. Find the gaps.
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600">
            Pick three Pokémon from the current Great League meta. We&rsquo;ll
            map out which types beat your team, which weaknesses you have
            covered, and where your roster is exposed.
          </p>
        </div>

        <TeamBuilder pokemon={pokemon} />
      </main>
    </div>
  );
}
