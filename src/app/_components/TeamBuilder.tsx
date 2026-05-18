"use client";

import { useMemo, useState } from "react";
import type { PokemonType } from "../lib/pokeapi";
import { TYPE_COLORS, titleCase } from "../lib/pokeapi";
import {
  analyzeTeam,
  type CoverageStatus,
  type TeamAnalysis,
} from "../lib/team-analysis";

const POKEBALL_RED = "#DC0A2D";
const POKEMON_NAVY = "#1E3A8A";

export type PokemonEntry = {
  slug: string;
  name: string;
  types: PokemonType[];
  tier: string;
  rank: number;
};

const TEAM_SIZE = 3;

export function TeamBuilder({ pokemon }: { pokemon: PokemonEntry[] }) {
  const [team, setTeam] = useState<(PokemonEntry | null)[]>(
    Array(TEAM_SIZE).fill(null),
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PokemonType | "all">("all");

  const fullTeam = team.filter((m): m is PokemonEntry => m !== null);
  const analysis = useMemo<TeamAnalysis | null>(() => {
    if (fullTeam.length !== TEAM_SIZE) return null;
    return analyzeTeam(
      fullTeam.map((p) => ({ slug: p.slug, name: p.name, types: p.types })),
    );
  }, [fullTeam]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pokemon.filter((p) => {
      if (typeFilter !== "all" && !p.types.includes(typeFilter)) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.includes(q)) return false;
      return true;
    });
  }, [pokemon, search, typeFilter]);

  const usedSlugs = new Set(fullTeam.map((p) => p.slug));

  function addToTeam(p: PokemonEntry) {
    if (usedSlugs.has(p.slug)) return;
    const next = [...team];
    const i = next.findIndex((m) => m === null);
    if (i === -1) return;
    next[i] = p;
    setTeam(next);
  }

  function removeAt(i: number) {
    const next = [...team];
    next[i] = null;
    setTeam(next);
  }

  function pickRandom() {
    const pool = [...pokemon].sort(() => Math.random() - 0.5).slice(0, TEAM_SIZE);
    setTeam([...pool, ...Array(TEAM_SIZE - pool.length).fill(null)].slice(0, TEAM_SIZE));
  }

  function clear() {
    setTeam(Array(TEAM_SIZE).fill(null));
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Team slots */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: POKEMON_NAVY }}>
            Your team
          </h2>
          <div className="flex gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={pickRandom}
              className="rounded-full border border-zinc-300 px-3 py-1 transition-colors hover:bg-white"
              style={{ color: POKEMON_NAVY }}
            >
              🎲 random
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={fullTeam.length === 0}
              className="rounded-full border border-zinc-300 px-3 py-1 transition-colors hover:bg-white disabled:opacity-40"
              style={{ color: POKEMON_NAVY }}
            >
              clear
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {team.map((m, i) => (
            <TeamSlot key={i} member={m} onRemove={() => removeAt(i)} />
          ))}
        </div>
      </section>

      {/* Analysis */}
      {analysis && <AnalysisView analysis={analysis} />}

      {/* Picker */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: POKEMON_NAVY }}>
            {fullTeam.length === TEAM_SIZE ? "Roster" : "Pick a Pokémon"}
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="h-9 rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-[#1E3A8A]"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PokemonType | "all")}
              className="h-9 rounded-full border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-[#1E3A8A]"
            >
              <option value="all">All types</option>
              {(Object.keys(TYPE_COLORS) as PokemonType[]).sort().map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((p) => (
            <li key={p.slug}>
              <PickerItem
                pokemon={p}
                disabled={usedSlugs.has(p.slug) || fullTeam.length === TEAM_SIZE}
                onPick={() => addToTeam(p)}
              />
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">
            No Pokémon match those filters.
          </p>
        )}
      </section>
    </div>
  );
}

function TeamSlot({
  member,
  onRemove,
}: {
  member: PokemonEntry | null;
  onRemove: () => void;
}) {
  if (!member) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-zinc-300 bg-white/40 text-xs text-zinc-400 sm:h-40">
        <span className="text-3xl">+</span>
        <span>Empty slot</span>
      </div>
    );
  }
  const palette = TYPE_COLORS[member.types[0]];
  return (
    <div
      className="relative flex h-32 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-zinc-200 sm:h-40"
      style={{ backgroundColor: palette.bg + "22" }}
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${member.name} from team`}
        className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/80 text-zinc-600 transition-colors hover:bg-white"
      >
        ×
      </button>
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        Tier {member.tier}
      </span>
      <span className="text-sm font-black tracking-tight" style={{ color: POKEMON_NAVY }}>
        {titleCase(member.name)}
      </span>
      <div className="flex flex-wrap justify-center gap-1">
        {member.types.map((t) => (
          <span
            key={t}
            className="rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize text-white"
            style={{ backgroundColor: TYPE_COLORS[t].pill }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function PickerItem({
  pokemon,
  disabled,
  onPick,
}: {
  pokemon: PokemonEntry;
  disabled: boolean;
  onPick: () => void;
}) {
  const palette = TYPE_COLORS[pokemon.types[0]];
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="flex w-full flex-col items-start gap-1.5 rounded-xl bg-white p-2.5 text-left shadow-sm ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
    >
      <div className="flex w-full items-center justify-between">
        <span className="truncate text-xs font-bold" style={{ color: POKEMON_NAVY }}>
          {titleCase(pokemon.name)}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-bold"
          style={{ backgroundColor: palette.pill + "33", color: palette.pill }}
        >
          {pokemon.tier}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {pokemon.types.map((t) => (
          <span
            key={t}
            className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold capitalize text-white"
            style={{ backgroundColor: TYPE_COLORS[t].pill }}
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

const STATUS_STYLES: Record<CoverageStatus, { bg: string; text: string; label: string }> = {
  "stacked-exposed": { bg: "#FEE2E2", text: "#991B1B", label: "Stacked exposure" },
  exposed: { bg: "#FEF3C7", text: "#92400E", label: "Exposed" },
  covered: { bg: "#DCFCE7", text: "#166534", label: "Covered" },
};

function AnalysisView({ analysis }: { analysis: TeamAnalysis }) {
  const stackedCount = analysis.stackedWeaknesses.filter((t) => t.status === "stacked-exposed").length;
  const exposedCount = analysis.gaps.filter((t) => t.status === "exposed").length;
  const coveredCount = analysis.threats.length - analysis.gaps.length;

  const headline = (() => {
    if (analysis.gaps.length === 0) {
      return "Every threat your team faces is answered by at least one teammate. Solid coverage.";
    }
    const parts: string[] = [];
    if (stackedCount > 0) {
      parts.push(
        `${stackedCount} stacked weakness${stackedCount > 1 ? "es" : ""} — two or more members weak to a type with no team answer`,
      );
    }
    if (exposedCount > 0) {
      parts.push(
        `${exposedCount} single exposed weakness${exposedCount > 1 ? "es" : ""}`,
      );
    }
    return `Your team has ${parts.join(" and ")}. ${coveredCount} other threat${coveredCount === 1 ? "" : "s"} ${coveredCount === 1 ? "is" : "are"} covered.`;
  })();

  return (
    <section
      className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-8"
      style={{ color: POKEMON_NAVY }}
    >
      <header className="flex flex-col gap-2">
        <p
          className="text-xs font-bold uppercase tracking-[0.25em]"
          style={{ color: POKEBALL_RED }}
        >
          Coverage analysis
        </p>
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          {headline.split(".")[0]}.
        </h2>
        {headline.split(".").slice(1).filter(Boolean).map((s, i) => (
          <p key={i} className="text-sm text-zinc-600">{s.trim()}.</p>
        ))}
      </header>

      <SummaryStrip
        stackedCount={stackedCount}
        exposedCount={exposedCount}
        coveredCount={coveredCount}
      />

      {analysis.gaps.length > 0 && (
        <ThreatList
          title="Gaps to address"
          subtitle="Threats no one on your team covers."
          threats={analysis.gaps}
          analysis={analysis}
        />
      )}

      <ThreatList
        title="Covered threats"
        subtitle="At least one teammate beats or resists these types."
        threats={analysis.threats.filter((t) => t.status === "covered")}
        analysis={analysis}
      />

      {analysis.teamResistances.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Shared resistances</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.teamResistances.map((r) => (
              <span
                key={r.type}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: TYPE_COLORS[r.type].pill }}
              >
                {titleCase(r.type)}
                <span
                  className="rounded-full bg-white/30 px-1.5 text-[10px]"
                >
                  {r.count}×
                </span>
              </span>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function SummaryStrip({
  stackedCount,
  exposedCount,
  coveredCount,
}: {
  stackedCount: number;
  exposedCount: number;
  coveredCount: number;
}) {
  const items: Array<{ label: string; count: number; status: CoverageStatus }> = [
    { label: "Stacked", count: stackedCount, status: "stacked-exposed" },
    { label: "Exposed", count: exposedCount, status: "exposed" },
    { label: "Covered", count: coveredCount, status: "covered" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {items.map((it) => {
        const s = STATUS_STYLES[it.status];
        return (
          <div
            key={it.label}
            className="flex flex-col items-start gap-1 rounded-2xl px-4 py-3"
            style={{ backgroundColor: s.bg }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.text }}>
              {it.label}
            </span>
            <span className="text-2xl font-black tabular-nums" style={{ color: s.text }}>
              {it.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ThreatList({
  title,
  subtitle,
  threats,
  analysis,
}: {
  title: string;
  subtitle: string;
  threats: TeamAnalysis["threats"];
  analysis: TeamAnalysis;
}) {
  if (threats.length === 0) return null;
  const nameBySlug = new Map(analysis.members.map((m) => [m.slug, m.name]));
  return (
    <section>
      <header className="mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </header>
      <ul className="flex flex-col gap-2">
        {threats.map((t) => {
          const s = STATUS_STYLES[t.status];
          const c = TYPE_COLORS[t.type];
          return (
            <li
              key={t.type}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold capitalize text-white"
                  style={{ backgroundColor: c.pill }}
                >
                  {t.type}
                </span>
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  {s.label}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-zinc-600 sm:flex-1">
                <span>
                  <strong className="font-semibold" style={{ color: POKEMON_NAVY }}>
                    Weak:
                  </strong>{" "}
                  {t.weakMembers
                    .map((slug) => titleCase(nameBySlug.get(slug) ?? slug))
                    .join(", ")}
                </span>
                {t.offensiveCounters.length > 0 && (
                  <span>
                    <strong className="font-semibold" style={{ color: POKEMON_NAVY }}>
                      Offensive answer:
                    </strong>{" "}
                    {t.offensiveCounters
                      .map((slug) => titleCase(nameBySlug.get(slug) ?? slug))
                      .join(", ")}
                  </span>
                )}
                {t.defensiveCounters.length > 0 && (
                  <span>
                    <strong className="font-semibold" style={{ color: POKEMON_NAVY }}>
                      Defensive answer:
                    </strong>{" "}
                    {t.defensiveCounters
                      .map((slug) => titleCase(nameBySlug.get(slug) ?? slug))
                      .join(", ")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

