import Link from "next/link";
import { connection } from "next/server";
import { PokemonCarousel } from "./_components/PokemonCarousel";
import { fetchRandomPokemon } from "./lib/pokeapi";

const POKEBALL_RED = "#DC0A2D";
const CREAM = "#F7EFDF";

type TypeIcon = {
  top: string;
  left: string;
  size: number;
  rotate: number;
  path: string;
};

const TYPE_ICONS: TypeIcon[] = [
  { top: "12%", left: "6%", size: 52, rotate: -12, path: "M12 2c1.5 3 5 5 5 9a5 5 0 1 1-10 0c0-4 3.5-6 5-9z" },
  { top: "22%", left: "88%", size: 44, rotate: 18, path: "M12 2c1.5 3 5 5 5 9a5 5 0 1 1-10 0c0-4 3.5-6 5-9z" },
  { top: "70%", left: "4%", size: 56, rotate: 8, path: "M13 2L4 14h6l-1 8 9-12h-6l1-8z" },
  { top: "78%", left: "92%", size: 44, rotate: -22, path: "M12 2c-3 4-9 5-9 11a9 9 0 0 0 18 0c0-6-6-7-9-11z" },
  { top: "44%", left: "2%", size: 36, rotate: 14, path: "M12 3l2.5 5 5.5.8-4 4 1 5.5L12 15.8 7 18.3l1-5.5-4-4 5.5-.8z" },
  { top: "36%", left: "94%", size: 32, rotate: -8, path: "M12 3l2.5 5 5.5.8-4 4 1 5.5L12 15.8 7 18.3l1-5.5-4-4 5.5-.8z" },
  { top: "16%", left: "44%", size: 24, rotate: 0, path: "M13 2L4 14h6l-1 8 9-12h-6l1-8z" },
];

export default async function Home() {
  await connection();
  const pokemons = await fetchRandomPokemon(6);

  return (
    <div className="flex flex-col" style={{ backgroundColor: CREAM }}>
      <section className="relative flex h-screen flex-col overflow-hidden">
        {/* Red hero panel — top 62% */}
      <section
        className="relative flex shrink-0 basis-[62%] flex-col text-white"
        style={{ backgroundColor: POKEBALL_RED }}
      >
        {/* Faint scattered type icons — only in red area */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {TYPE_ICONS.map((icon, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              width={icon.size}
              height={icon.size}
              className="absolute opacity-[0.08]"
              style={{
                top: icon.top,
                left: icon.left,
                transform: `rotate(${icon.rotate}deg)`,
              }}
            >
              <path d={icon.path} fill="white" />
            </svg>
          ))}
        </div>

        {/* Top bar */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-8 pt-5 sm:px-14 sm:pt-6">
          <PokemonWordmark />
          <p className="text-sm tracking-wide text-white/90 sm:text-base">
            Case Study <span className="mx-1">→</span>
            <span className="font-semibold">PVP</span>
            <span className="ml-1 font-light">Analysis</span>
          </p>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 pb-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-900 shadow-sm">
            <span
              className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: POKEBALL_RED }}
            >
              P
            </span>
            pokédex
          </span>

          <h1 className="max-w-5xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[64px]">
            Who&rsquo;s your winning matchup?
          </h1>

          <p className="max-w-2xl text-sm text-white/90 sm:text-base">
            The PVP companion for trainers who&rsquo;d rather win than guess.
          </p>
        </div>
      </section>

      {/* Cream panel — bottom 38% */}
      <section className="relative flex flex-1 flex-col items-center justify-end pb-10">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <Link
            href="/wip"
            className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold text-white shadow-md transition-colors"
            style={{ backgroundColor: POKEBALL_RED }}
          >
            Open the Pokédex
          </Link>
          <Link
            href="/wip"
            className="inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-zinc-700 underline-offset-4 hover:underline"
          >
            Browse the meta →
          </Link>
        </div>
      </section>

      {/* Pokéball straddling the boundary */}
      <div
        className="pointer-events-none absolute inset-x-0 z-20 flex justify-center"
        style={{ top: "62%", transform: "translateY(-50%)" }}
      >
        <div className="relative flex aspect-square w-[min(38vh,300px)] items-center justify-center">
          <ConcentricRings />
          <Sparkles />
          <Pokeball />
        </div>
      </div>

      {/* Bottom-left explore — sits on cream, use red ink */}
      <div
        className="absolute bottom-6 left-8 z-30 hidden flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] sm:flex"
        style={{ color: POKEBALL_RED }}
      >
        <span style={{ writingMode: "vertical-rl" }} className="rotate-180">
          explore
        </span>
        <span className="h-8 w-px" style={{ backgroundColor: POKEBALL_RED }} />
        <span aria-hidden>↓</span>
      </div>

      {/* Bottom-right pagination dots */}
      <div className="absolute bottom-6 right-10 z-30 hidden flex-col gap-2 sm:flex">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POKEBALL_RED }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `${POKEBALL_RED}66` }} />
      </div>
      </section>

      {/* Trending carousel */}
      <section className="px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col items-start gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.25em]"
                style={{ color: POKEBALL_RED }}
              >
                Trending now
              </p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                Top Pokémon of the moment
              </h2>
            </div>
            <p className="max-w-md text-sm text-zinc-600">
              A fresh handful pulled from the Pokédex on every visit. Use the
              arrows to browse.
            </p>
          </header>
          <PokemonCarousel pokemons={pokemons} />
        </div>
      </section>
    </div>
  );
}

function PokemonWordmark() {
  return (
    <svg
      viewBox="0 0 200 60"
      className="h-10 w-auto sm:h-12"
      aria-label="Pokémon"
    >
      <defs>
        <linearGradient id="wm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCB05" />
          <stop offset="100%" stopColor="#F2A900" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans)"
        fontWeight="900"
        fontSize="42"
        letterSpacing="-1"
        fill="url(#wm-fill)"
        stroke="#1E3A8A"
        strokeWidth="3"
        paintOrder="stroke"
        style={{ fontStyle: "italic" }}
      >
        Pokémon
      </text>
    </svg>
  );
}

function ConcentricRings() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center">
      {[0.4, 0.6, 0.78, 0.92].map((scale, i) => (
        <span
          key={i}
          className="absolute aspect-square rounded-full border border-white/15"
          style={{
            width: `${scale * 100}%`,
            backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function Sparkles() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 120"
      className="absolute left-1/2 top-[6%] w-[60%] -translate-x-1/2"
    >
      {[
        { cx: 60, cy: 60, r: 6 },
        { cx: 150, cy: 30, r: 8 },
        { cx: 240, cy: 70, r: 5 },
      ].map((s, i) => (
        <g key={i} transform={`translate(${s.cx} ${s.cy})`}>
          <path
            d={`M0 -${s.r * 2} L${s.r * 0.6} -${s.r * 0.6} L${s.r * 2} 0 L${s.r * 0.6} ${s.r * 0.6} L0 ${s.r * 2} L-${s.r * 0.6} ${s.r * 0.6} L-${s.r * 2} 0 L-${s.r * 0.6} -${s.r * 0.6} Z`}
            fill="#FFCB05"
          />
        </g>
      ))}
    </svg>
  );
}

function Pokeball() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="relative h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]"
      aria-label="Pokéball"
    >
      <defs>
        <radialGradient id="pb-top" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FF6B7A" />
          <stop offset="55%" stopColor="#E11D34" />
          <stop offset="100%" stopColor="#8A0A1C" />
        </radialGradient>
        <radialGradient id="pb-bottom" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E5E5E5" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="92" fill="url(#pb-bottom)" />
      <path
        d="M100 8 A92 92 0 0 1 192 100 H8 A92 92 0 0 1 100 8 Z"
        fill="url(#pb-top)"
      />
      <rect x="8" y="92" width="184" height="16" fill="#111" />
      <circle cx="100" cy="100" r="22" fill="#111" />
      <circle cx="100" cy="100" r="15" fill="#FFFFFF" />
      <circle cx="100" cy="100" r="8" fill="#E5E5E5" stroke="#111" strokeWidth="2" />
      <ellipse cx="70" cy="55" rx="22" ry="12" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}
