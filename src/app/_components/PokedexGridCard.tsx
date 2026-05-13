import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  type PokemonGridData,
  TYPE_COLORS,
  formatId,
  titleCase,
} from "../lib/pokeapi";

export function PokedexGridCard({ pokemon }: { pokemon: PokemonGridData }) {
  const palette = TYPE_COLORS[pokemon.types[0]];
  const styleVars = { "--type-shadow": palette.pill } as CSSProperties;

  return (
    <Link
      href={`/pokedex/${pokemon.id}`}
      style={styleVars}
      className="group relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2"
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/70 transition-all duration-200 group-hover:-translate-y-2 group-hover:shadow-[0_22px_30px_-12px_var(--type-shadow)]">
        <div
          className="relative h-32"
          style={{ backgroundColor: palette.bg }}
        >
          <span className="absolute right-3 top-2 text-[10px] font-bold text-white/70">
            {formatId(pokemon.id)}
          </span>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <h3 className="text-sm font-black tracking-tight text-[#1E3A8A]">
            {titleCase(pokemon.name)}
          </h3>
          <div className="flex flex-wrap gap-1">
            {pokemon.types.map((type) => {
              const c = TYPE_COLORS[type];
              return (
                <span
                  key={type}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize text-white"
                  style={{ backgroundColor: c.pill }}
                >
                  {type}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <Image
        src={pokemon.artworkUrl}
        alt={titleCase(pokemon.name)}
        width={140}
        height={140}
        className="pointer-events-none absolute left-1/2 top-16 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)] transition-all duration-200 group-hover:scale-[1.22] group-hover:-translate-y-[78%] group-hover:drop-shadow-[0_18px_18px_rgba(0,0,0,0.35)] sm:h-28 sm:w-28"
        unoptimized
        loading="lazy"
      />
    </Link>
  );
}
