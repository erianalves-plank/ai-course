import type { PokemonType } from "./pokeapi";
import {
  classifyMultiplier,
  type EffectivenessEntry,
  getEffectivenessMultiplier,
  getResistances,
  getWeaknesses,
} from "./types-chart";

export type TeamMemberInput = {
  slug: string;
  name: string;
  types: PokemonType[];
};

export type TeamMember = TeamMemberInput & {
  weakTo: EffectivenessEntry[];
  resistantTo: EffectivenessEntry[];
};

export type CoverageStatus = "covered" | "exposed" | "stacked-exposed";

export type ThreatAnalysis = {
  type: PokemonType;
  /** Slugs of team members weak (or double-weak) to this type. */
  weakMembers: string[];
  /** Subset of weakMembers that are doubly weak. */
  doubleWeakMembers: string[];
  /** Slugs whose own typing is super-effective against this threat type
   *  (a proxy for STAB offensive coverage). */
  offensiveCounters: string[];
  /** Slugs whose typing resists this threat type. */
  defensiveCounters: string[];
  status: CoverageStatus;
};

export type TeamAnalysis = {
  members: TeamMember[];
  threats: ThreatAnalysis[];
  /** Subset of `threats` with status `exposed` or `stacked-exposed`. */
  gaps: ThreatAnalysis[];
  /** Subset of `threats` where two or more members share the weakness. */
  stackedWeaknesses: ThreatAnalysis[];
  /** Types resisted by two or more members, count descending. */
  teamResistances: { type: PokemonType; count: number }[];
};

const SEVERITY_ORDER: Record<CoverageStatus, number> = {
  "stacked-exposed": 0,
  exposed: 1,
  covered: 2,
};

/**
 * Compute coverage analysis for an arbitrary-sized team (typically three).
 * Pure function — no I/O, fully deterministic given the chart in types-chart.ts.
 *
 * Offensive coverage is approximated from a teammate's *typing*, on the
 * assumption that PVP Pokémon usually carry a STAB move. Move-aware analysis
 * could be layered on top by passing in `fastMoves` / `chargedMoves` and
 * checking those move types instead — kept out of v1 for simplicity.
 */
export function analyzeTeam(input: TeamMemberInput[]): TeamAnalysis {
  const members: TeamMember[] = input.map((m) => ({
    ...m,
    weakTo: getWeaknesses(m.types),
    resistantTo: getResistances(m.types),
  }));

  const threatTypes = new Set<PokemonType>();
  for (const m of members) {
    for (const w of m.weakTo) threatTypes.add(w.type);
  }

  const threats: ThreatAnalysis[] = [];
  for (const threat of threatTypes) {
    const weakMembers: string[] = [];
    const doubleWeakMembers: string[] = [];
    const offensiveCounters = new Set<string>();
    const defensiveCounters = new Set<string>();

    for (const m of members) {
      const incomingTier = classifyMultiplier(
        getEffectivenessMultiplier(threat, m.types),
      );
      if (incomingTier === "weak" || incomingTier === "double-weak") {
        weakMembers.push(m.slug);
        if (incomingTier === "double-weak") doubleWeakMembers.push(m.slug);
      } else if (incomingTier === "resist" || incomingTier === "double-resist") {
        defensiveCounters.add(m.slug);
      }

      for (const t of m.types) {
        const outTier = classifyMultiplier(getEffectivenessMultiplier(t, [threat]));
        if (outTier === "weak" || outTier === "double-weak") {
          offensiveCounters.add(m.slug);
          break;
        }
      }
    }

    const hasCounter = offensiveCounters.size > 0 || defensiveCounters.size > 0;
    const status: CoverageStatus = hasCounter
      ? "covered"
      : weakMembers.length >= 2
        ? "stacked-exposed"
        : "exposed";

    threats.push({
      type: threat,
      weakMembers,
      doubleWeakMembers,
      offensiveCounters: Array.from(offensiveCounters),
      defensiveCounters: Array.from(defensiveCounters),
      status,
    });
  }

  threats.sort((a, b) => {
    const dSev = SEVERITY_ORDER[a.status] - SEVERITY_ORDER[b.status];
    return dSev !== 0 ? dSev : a.type.localeCompare(b.type);
  });

  const gaps = threats.filter((t) => t.status !== "covered");
  const stackedWeaknesses = threats.filter((t) => t.weakMembers.length >= 2);

  const resistCounts = new Map<PokemonType, number>();
  for (const m of members) {
    for (const r of m.resistantTo) {
      resistCounts.set(r.type, (resistCounts.get(r.type) ?? 0) + 1);
    }
  }
  const teamResistances = Array.from(resistCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));

  return { members, threats, gaps, stackedWeaknesses, teamResistances };
}
