/**
 * Resolve an "official artwork" URL from PokéAPI given a Pokébase slug.
 *
 * Pokébase slugs differ from PokéAPI names: pokébase uses prefixes like
 * `shadow-`, `alolan-`, `galarian-`; PokéAPI strips shadow forms entirely
 * and represents regional variants as suffixes (`marowak-alola`).
 *
 * This helper normalizes the slug, then falls back to the base species
 * name if the form-specific URL 404s (PokéAPI doesn't track every form
 * variant pokébase mentions — e.g. `gastrodon-west-sea`). Shadow forms
 * intentionally render their base-form artwork, which is acceptable for
 * the team picker.
 */

const REGION_PREFIX_TO_SUFFIX: Record<string, string> = {
  alolan: "alola",
  galarian: "galar",
  hisuian: "hisui",
  paldean: "paldea",
};

function normalizeForPokeApi(slug: string): string {
  let s = slug.toLowerCase().replace(/-+$/, ""); // strip trailing dash (clodsire-)
  s = s.replace(/^shadow-/, ""); // no shadow forms in PokéAPI

  for (const [prefix, suffix] of Object.entries(REGION_PREFIX_TO_SUFFIX)) {
    if (s.startsWith(`${prefix}-`)) {
      s = `${s.slice(prefix.length + 1)}-${suffix}`;
      break;
    }
  }

  s = s.replace(/---/g, "-"); // pokébase form separator → standard hyphen
  s = s.replace(/-forme$/, ""); // giratina-altered-forme → giratina-altered
  s = s.replace(/-style$/, ""); // urshifu-single-strike-style → -single-strike
  return s;
}

function baseSpecies(slug: string): string {
  const s = slug
    .toLowerCase()
    .replace(/-+$/, "")
    .replace(/^shadow-/, "")
    .replace(/^(alolan|galarian|hisuian|paldean|mega)-/, "");
  // First segment before any hyphen — works for "gastrodon-west-sea" → "gastrodon".
  return s.split("-")[0];
}

type PokeApiResponse = {
  sprites: {
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
};

export async function fetchArtworkUrl(slug: string): Promise<string | null> {
  const candidates = Array.from(
    new Set([normalizeForPokeApi(slug), baseSpecies(slug)]),
  );

  for (const name of candidates) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
        cache: "force-cache",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as PokeApiResponse;
      const art = data.sprites?.other?.["official-artwork"]?.front_default;
      if (art) return art;
    } catch {
      // try next candidate
    }
  }
  return null;
}
