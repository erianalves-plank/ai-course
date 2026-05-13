import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  type PokemonCardData,
  TYPE_COLORS,
  formatId,
  titleCase,
} from "../lib/pokeapi";

type Props = {
  pokemon: PokemonCardData;
};

export function PokemonCard({ pokemon }: Props) {
  const primaryType = pokemon.types[0];
  const palette = TYPE_COLORS[primaryType];
  const styleVars = { "--type-shadow": palette.pill } as CSSProperties;

  return (
    <Link
      href={`/pokedex/${pokemon.id}`}
      style={styleVars}
      className="group relative block w-[280px] shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2 sm:w-[300px]"
      aria-label={`View ${titleCase(pokemon.name)}`}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-200 group-hover:-translate-y-2 group-hover:shadow-[0_28px_40px_-12px_var(--type-shadow)]">
        <div
          className="relative h-[220px]"
          style={{ backgroundColor: palette.bg }}
        >
          <span className="absolute right-4 top-3 text-xs font-semibold text-white/70">
            {formatId(pokemon.id)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-xl font-black tracking-tight text-zinc-900">
              {titleCase(pokemon.name)}
            </h3>
            <p className="text-xs font-medium text-zinc-500">{pokemon.genus}</p>
          </div>

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

          <dl className="mt-auto grid grid-cols-2 gap-2 text-[11px]">
            <Stat label="Weight" value={`${pokemon.weightKg.toFixed(1)} kg`} />
            <Stat label="Height" value={`${pokemon.heightM.toFixed(1)} m`} />
            <Stat label="Ability" value={titleCase(pokemon.abilityName)} />
            <Stat label="Type" value={titleCase(primaryType)} />
          </dl>
        </div>
      </div>

      <Image
        src={pokemon.artworkUrl}
        alt={titleCase(pokemon.name)}
        width={200}
        height={200}
        className="pointer-events-none absolute left-1/2 top-[110px] z-10 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.3)] transition-all duration-200 group-hover:scale-[1.2] group-hover:-translate-y-[70%] group-hover:drop-shadow-[0_22px_24px_rgba(0,0,0,0.4)]"
        unoptimized
      />
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </dt>
      <dd className="truncate text-xs font-bold text-zinc-800">{value}</dd>
    </div>
  );
}
