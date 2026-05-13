import Link from "next/link";

const POKEBALL_RED = "#DC0A2D";
const CREAM = "#F7EFDF";
const POKEMON_YELLOW = "#FFCB05";

export const metadata = {
  title: "Work in progress — Pokémon GO PVP Analysis",
};

export default function WorkInProgress() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ backgroundColor: CREAM }}
    >
      <BackgroundPokeballs />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm"
          style={{ backgroundColor: POKEBALL_RED }}
        >
          <span
            className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold"
            style={{ backgroundColor: POKEMON_YELLOW, color: POKEBALL_RED }}
          >
            !
          </span>
          coming soon
        </span>

        <h1
          className="text-[18vw] font-black leading-none tracking-tight sm:text-[180px]"
          style={{
            color: POKEBALL_RED,
            WebkitTextStroke: `4px ${POKEMON_YELLOW}`,
          }}
        >
          WIP
        </h1>

        <p className="max-w-md text-sm text-zinc-700 sm:text-base">
          This trainer is still in training. We&rsquo;re putting the finishing
          touches on this part of the Pokédex — check back soon.
        </p>

        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full px-7 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: POKEBALL_RED }}
        >
          ← Back home
        </Link>
      </div>
    </div>
  );
}

function BackgroundPokeballs() {
  const balls = [
    { top: "8%", left: "6%", size: 140, rotate: -18 },
    { top: "72%", left: "10%", size: 90, rotate: 24 },
    { top: "18%", left: "82%", size: 110, rotate: 12 },
    { top: "68%", left: "84%", size: 160, rotate: -30 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {balls.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 200 200"
          width={b.size}
          height={b.size}
          className="absolute opacity-[0.10]"
          style={{
            top: b.top,
            left: b.left,
            transform: `rotate(${b.rotate}deg)`,
          }}
        >
          <circle cx="100" cy="100" r="92" fill="none" stroke={POKEBALL_RED} strokeWidth="6" />
          <path d="M8 100 H192" stroke={POKEBALL_RED} strokeWidth="6" />
          <circle cx="100" cy="100" r="22" fill="none" stroke={POKEBALL_RED} strokeWidth="6" />
        </svg>
      ))}
    </div>
  );
}
