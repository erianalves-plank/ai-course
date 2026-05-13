export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type PokemonCardData = {
  id: number;
  name: string;
  types: PokemonType[];
  heightM: number;
  weightKg: number;
  abilityName: string;
  genus: string;
  artworkUrl: string;
};

type PokemonResource = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: PokemonType } }[];
  abilities: { ability: { name: string }; is_hidden: boolean; slot: number }[];
  sprites: {
    other: {
      "official-artwork": { front_default: string | null };
    };
  };
};

type SpeciesResource = {
  genera: { genus: string; language: { name: string } }[];
};

const POKEAPI = "https://pokeapi.co/api/v2";
const POOL_SIZE = 151;

export async function fetchRandomPokemon(count: number): Promise<PokemonCardData[]> {
  const ids = sampleUniqueIds(count, POOL_SIZE);
  return Promise.all(ids.map(fetchPokemonCard));
}

async function fetchPokemonCard(id: number): Promise<PokemonCardData> {
  const [pokemon, species] = await Promise.all([
    fetch(`${POKEAPI}/pokemon/${id}`, { cache: "force-cache" }).then(
      (r) => r.json() as Promise<PokemonResource>,
    ),
    fetch(`${POKEAPI}/pokemon-species/${id}`, { cache: "force-cache" }).then(
      (r) => r.json() as Promise<SpeciesResource>,
    ),
  ]);

  const primaryAbility = pokemon.abilities.sort((a, b) => a.slot - b.slot)[0];
  const englishGenus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "Pokémon";

  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map((t) => t.type.name),
    heightM: pokemon.height / 10,
    weightKg: pokemon.weight / 10,
    abilityName: primaryAbility?.ability.name ?? "—",
    genus: englishGenus,
    artworkUrl:
      pokemon.sprites.other["official-artwork"].front_default ??
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
  };
}

function sampleUniqueIds(count: number, max: number): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(1 + Math.floor(Math.random() * max));
  }
  return Array.from(set);
}

export const TYPE_COLORS: Record<PokemonType, { bg: string; pill: string; text: string }> = {
  normal: { bg: "#C6C6A7", pill: "#A8A77A", text: "#3C3C20" },
  fire: { bg: "#F5AC78", pill: "#EE8130", text: "#5A2A00" },
  water: { bg: "#9DB7F5", pill: "#6390F0", text: "#0E2A6B" },
  electric: { bg: "#FAE078", pill: "#F7D02C", text: "#5A4A00" },
  grass: { bg: "#A7DB8D", pill: "#7AC74C", text: "#1F4D14" },
  ice: { bg: "#BCE6E6", pill: "#96D9D6", text: "#0E4747" },
  fighting: { bg: "#D67873", pill: "#C22E28", text: "#5A0F0B" },
  poison: { bg: "#C183C1", pill: "#A33EA1", text: "#3A1238" },
  ground: { bg: "#EBD69D", pill: "#E2BF65", text: "#4D3A0E" },
  flying: { bg: "#C6B7F5", pill: "#A98FF3", text: "#2E1F66" },
  psychic: { bg: "#FA92B2", pill: "#F95587", text: "#5A0B2E" },
  bug: { bg: "#C6D16E", pill: "#A6B91A", text: "#3D470B" },
  rock: { bg: "#D1C17D", pill: "#B6A136", text: "#473C0F" },
  ghost: { bg: "#A292BC", pill: "#735797", text: "#241632" },
  dragon: { bg: "#A27DFA", pill: "#6F35FC", text: "#1F0A52" },
  dark: { bg: "#A29288", pill: "#705746", text: "#241914" },
  steel: { bg: "#D1D1E0", pill: "#B7B7CE", text: "#3A3A4A" },
  fairy: { bg: "#F4BDC9", pill: "#D685AD", text: "#52123A" },
};

export function titleCase(s: string): string {
  return s
    .split(/[-\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatId(id: number): string {
  return `N°${id.toString().padStart(3, "0")}`;
}
