import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchPokemonDetail,
  formatId,
  GEN_1_MAX,
  getAllGen1Ids,
  titleCase,
  TYPE_COLORS,
  type StatLine,
} from "../../lib/pokeapi";

const POKEBALL_RED = "#DC0A2D";
const CREAM = "#F7EFDF";
const POKEMON_NAVY = "#1E3A8A";
const POKEMON_YELLOW = "#FFCB05";

export async function generateStaticParams() {
  return getAllGen1Ids().map((id) => ({ id: id.toString() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId < 1 || parsedId > GEN_1_MAX) {
    return { title: "Not found" };
  }
  const pokemon = await fetchPokemonDetail(parsedId);
  return {
    title: `${titleCase(pokemon.name)} — Pokédex`,
    description: pokemon.description,
  };
}

export default async function PokemonDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId < 1 || parsedId > GEN_1_MAX) {
    notFound();
  }

  const pokemon = await fetchPokemonDetail(parsedId);
  const palette = TYPE_COLORS[pokemon.types[0]];
  const prevId = parsedId > 1 ? parsedId - 1 : null;
  const nextId = parsedId < GEN_1_MAX ? parsedId + 1 : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <header className="border-b border-zinc-200/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/pokedex"
            className="text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: POKEMON_NAVY }}
          >
            ← Pokédex
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {prevId && (
              <Link
                href={`/pokedex/${prevId}`}
                className="rounded-full px-3 py-1 transition-colors hover:bg-zinc-100"
                style={{ color: POKEMON_NAVY }}
              >
                ← {formatId(prevId)}
              </Link>
            )}
            {nextId && (
              <Link
                href={`/pokedex/${nextId}`}
                className="rounded-full px-3 py-1 transition-colors hover:bg-zinc-100"
                style={{ color: POKEMON_NAVY }}
              >
                {formatId(nextId)} →
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200/70">
          {/* Hero artwork */}
          <div
            className="relative flex h-72 items-center justify-center sm:h-96"
            style={{ backgroundColor: palette.bg }}
          >
            <span
              className="absolute right-6 top-5 rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: POKEMON_YELLOW, color: POKEMON_NAVY }}
            >
              {formatId(pokemon.id)}
            </span>
            <Image
              src={pokemon.artworkUrl}
              alt={titleCase(pokemon.name)}
              width={320}
              height={320}
              className="relative z-10 h-60 w-60 object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.25)] sm:h-80 sm:w-80"
              priority
              unoptimized
            />
          </div>

          {/* Info */}
          <div
            className="flex flex-col gap-6 p-6 sm:p-10"
            style={{ color: POKEMON_NAVY }}
          >
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {titleCase(pokemon.name)}
              </h1>
              <p className="text-sm font-medium text-zinc-500">{pokemon.genus}</p>
              <div className="flex flex-wrap gap-2">
                {pokemon.types.map((type) => {
                  const c = TYPE_COLORS[type];
                  return (
                    <span
                      key={type}
                      className="rounded-full px-3 py-1 text-xs font-semibold capitalize text-white shadow-sm"
                      style={{ backgroundColor: c.pill }}
                    >
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>

            {pokemon.description && (
              <p className="text-sm leading-relaxed text-zinc-700 sm:text-base">
                {pokemon.description}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fact label="Weight" value={`${pokemon.weightKg.toFixed(1)} kg`} />
              <Fact label="Height" value={`${pokemon.heightM.toFixed(1)} m`} />
              <Fact
                label="Ability"
                value={titleCase(pokemon.abilities[0]?.name ?? pokemon.abilityName)}
              />
              <Fact
                label="Hidden ability"
                value={
                  titleCase(
                    pokemon.abilities.find((a) => a.isHidden)?.name ?? "—",
                  ) || "—"
                }
              />
            </dl>

            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                Base stats
              </h2>
              <div className="flex flex-col gap-2">
                {pokemon.stats.map((stat) => (
                  <StatBar key={stat.name} stat={stat} accent={palette.pill} />
                ))}
              </div>
            </section>

            <Link
              href="/pokedex"
              className="inline-flex h-11 w-fit items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: POKEBALL_RED }}
            >
              Back to the Pokédex
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border border-zinc-200 px-4 py-3"
      style={{ color: POKEMON_NAVY }}
    >
      <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-bold">{value}</dd>
    </div>
  );
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function StatBar({ stat, accent }: { stat: StatLine; accent: string }) {
  const pct = Math.min(100, Math.round((stat.value / 200) * 100));
  return (
    <div className="grid grid-cols-[110px_40px_1fr] items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {STAT_LABELS[stat.name] ?? stat.name}
      </span>
      <span
        className="text-right text-sm font-bold tabular-nums"
        style={{ color: POKEMON_NAVY }}
      >
        {stat.value}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}
