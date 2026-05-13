import Image from "next/image";
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

  return (
    <article className="flex h-full w-[280px] shrink-0 flex-col overflow-hidden rounded-3xl bg-white shadow-lg sm:w-[300px]">
      {/* Artwork panel */}
      <div
        className="relative flex h-[220px] items-center justify-center"
        style={{ backgroundColor: palette.bg }}
      >
        <span className="absolute right-4 top-3 text-xs font-semibold text-white/70">
          {formatId(pokemon.id)}
        </span>
        <Image
          src={pokemon.artworkUrl}
          alt={titleCase(pokemon.name)}
          width={180}
          height={180}
          className="relative z-10 h-[180px] w-[180px] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]"
          unoptimized
        />
      </div>

      {/* Info panel */}
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
    </article>
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
