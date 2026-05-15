import type { PokemonType } from "./pokeapi";

/**
 * Pokémon GO effectiveness multipliers. They differ from the mainline games
 * (2× / 0.5× / 0×) because GO has no immunities — what's immune in mainline
 * becomes a second tier of resistance instead.
 */
export const GO_MULTIPLIERS = {
  SUPER_EFFECTIVE: 1.6,
  NEUTRAL: 1,
  NOT_VERY_EFFECTIVE: 0.625,
  DOUBLE_RESIST: 0.390625,
} as const;

type MainlineMultiplier = 0 | 0.5 | 1 | 2;

const ALL_TYPES: readonly PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

// Mainline effectiveness chart: MAINLINE_CHART[attacker][defender]
// Kept private — consumers should call the helper functions below.
const MAINLINE_CHART: Record<PokemonType, Record<PokemonType, MainlineMultiplier>> = {
  normal: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  fire: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5, dark: 1, steel: 2, fairy: 1 },
  water: { normal: 1, fire: 2, water: 0.5, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  electric: { normal: 1, fire: 1, water: 2, electric: 0.5, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5, dark: 1, steel: 1, fairy: 1 },
  grass: { normal: 1, fire: 0.5, water: 2, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5, dark: 1, steel: 0.5, fairy: 1 },
  ice: { normal: 1, fire: 0.5, water: 0.5, electric: 1, grass: 2, ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 1 },
  fighting: { normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, dark: 2, steel: 2, fairy: 0.5 },
  poison: { normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1, psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1, dark: 1, steel: 0, fairy: 2 },
  ground: { normal: 1, fire: 2, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 2, fairy: 1 },
  flying: { normal: 1, fire: 1, water: 1, electric: 0.5, grass: 2, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  psychic: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1, psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 0, steel: 0.5, fairy: 1 },
  bug: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 2, ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5, psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { normal: 1, fire: 2, water: 1, electric: 1, grass: 1, ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 1 },
  ghost: { normal: 0, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 1 },
  dragon: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1, steel: 0.5, fairy: 0 },
  dark: { normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 0.5, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 0.5, steel: 1, fairy: 0.5 },
  steel: { normal: 1, fire: 0.5, water: 0.5, electric: 0.5, grass: 1, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1, steel: 0.5, fairy: 2 },
  fairy: { normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 0.5, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 2, steel: 0.5, fairy: 1 },
};

function mainlineToGo(m: MainlineMultiplier): number {
  switch (m) {
    case 2: return GO_MULTIPLIERS.SUPER_EFFECTIVE;
    case 1: return GO_MULTIPLIERS.NEUTRAL;
    case 0.5: return GO_MULTIPLIERS.NOT_VERY_EFFECTIVE;
    case 0: return GO_MULTIPLIERS.DOUBLE_RESIST;
  }
}

/**
 * Effectiveness of `attacker` type against a Pokémon whose typing is
 * `defenderTypes`. For dual types the multipliers compound: super-effective
 * × resisted comes out neutral, super-effective × super-effective is doubly
 * weak, etc.
 */
export function getEffectivenessMultiplier(
  attacker: PokemonType,
  defenderTypes: readonly PokemonType[],
): number {
  return defenderTypes.reduce(
    (acc, t) => acc * mainlineToGo(MAINLINE_CHART[attacker][t]),
    1,
  );
}

export type EffectivenessTier =
  | "double-weak"
  | "weak"
  | "neutral"
  | "resist"
  | "double-resist";

/**
 * Bucket a numeric multiplier into a human-friendly tier. Tolerances are wide
 * enough to absorb floating-point noise from compounding 1.6 × 0.625, which
 * isn't exactly 1.0 in IEEE-754.
 */
export function classifyMultiplier(m: number): EffectivenessTier {
  if (m > 1.7) return "double-weak";
  if (m > 1.05) return "weak";
  if (m > 0.95) return "neutral";
  if (m > 0.5) return "resist";
  return "double-resist";
}

export type EffectivenessEntry = {
  type: PokemonType;
  multiplier: number;
  tier: EffectivenessTier;
};

function buildEntries(defenderTypes: readonly PokemonType[]): EffectivenessEntry[] {
  return ALL_TYPES.map((attacker) => {
    const multiplier = getEffectivenessMultiplier(attacker, defenderTypes);
    return { type: attacker, multiplier, tier: classifyMultiplier(multiplier) };
  });
}

/** Types that beat the given defender, strongest first. */
export function getWeaknesses(
  defenderTypes: readonly PokemonType[],
): EffectivenessEntry[] {
  return buildEntries(defenderTypes)
    .filter((e) => e.tier === "weak" || e.tier === "double-weak")
    .sort((a, b) => b.multiplier - a.multiplier);
}

/** Types the given defender resists, strongest resistance first. */
export function getResistances(
  defenderTypes: readonly PokemonType[],
): EffectivenessEntry[] {
  return buildEntries(defenderTypes)
    .filter((e) => e.tier === "resist" || e.tier === "double-resist")
    .sort((a, b) => a.multiplier - b.multiplier);
}
