/**
 * Scrape the Pokébase Great League tier list and per-Pokémon detail pages
 * into a single JSON file at data/great-league.json.
 *
 * Run with: npx tsx scripts/scrape-pokebase.ts
 */
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const BASE_URL = "https://pokebase.app";
const TIER_LIST_URL = `${BASE_URL}/pokemon-go/tier-lists/great-league-tier-list`;
const USER_AGENT =
  "AICourse-PVPAnalysis/0.1 (+https://github.com/erianalves-plank/ai-course)";
const DELAY_MS = 800;
const CACHE_DIR = ".cache/pokebase";
const OUT_FILE = "data/great-league.json";

const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
] as const;
type PokemonType = (typeof POKEMON_TYPES)[number];

type MoveCategory = "fast" | "charged";

type Move = {
  slug: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
};

type TierListEntry = {
  slug: string;
  name: string;
  types: PokemonType[];
  tier: string;
  rank: number;
};

type PokemonEntry = TierListEntry & {
  url: string;
  fastMoves: Move[];
  chargedMoves: Move[];
};

type ScrapeOutput = {
  scrapedAt: string;
  source: string;
  league: "great";
  pokemon: PokemonEntry[];
};

async function fetchCached(url: string): Promise<string> {
  const cacheKey = url.replace(/[^a-z0-9-]/gi, "_") + ".html";
  const cachePath = join(CACHE_DIR, cacheKey);
  try {
    return await readFile(cachePath, "utf-8");
  } catch {
    /* not cached, fetch fresh */
  }

  await new Promise((r) => setTimeout(r, DELAY_MS));
  process.stdout.write(`  fetching ${url}\n`);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const html = await res.text();
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, html, "utf-8");
  return html;
}

function isPokemonType(s: string): s is PokemonType {
  return (POKEMON_TYPES as readonly string[]).includes(s);
}

function typeFromIconSrc(src: string | undefined): PokemonType | null {
  if (!src) return null;
  const m = src.match(/Pokemon_Type_Icon_([A-Za-z]+)\.svg/);
  if (!m) return null;
  const lower = m[1].toLowerCase();
  return isPokemonType(lower) ? lower : null;
}

function titleCase(s: string): string {
  return s
    .split(/[-\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function parseTierList(html: string): TierListEntry[] {
  const $ = cheerio.load(html);
  const entries: TierListEntry[] = [];
  const tierCounts = new Map<string, number>();
  let currentTier: string | null = null;

  // Walk every span and pokemon link in document order. A "<X Tier>" span
  // resets the active tier; each link that follows belongs to it.
  $('span, a[href^="/pokemon-go/pokemon/"]').each((_, el) => {
    const $el = $(el);
    if (el.tagName === "span") {
      const text = $el.text().trim();
      const m = text.match(/^([SABCDF]\+?)\s+Tier$/i);
      if (m) currentTier = m[1].toUpperCase();
      return;
    }
    if (!currentTier) return;
    const href = $el.attr("href");
    if (!href) return;
    const m = href.match(/^\/pokemon-go\/pokemon\/([a-z0-9-]+)$/);
    if (!m) return;
    const slug = m[1];
    if (entries.some((e) => e.slug === slug && e.tier === currentTier)) return;
    const types: PokemonType[] = [];
    $el.find('img[src*="Pokemon_Type_Icon_"]').each((_, img) => {
      const t = typeFromIconSrc($(img).attr("src"));
      if (t && !types.includes(t)) types.push(t);
    });
    const rawName = $el
      .find('img[alt]:not([src*="Pokemon_Type_Icon_"])')
      .first()
      .attr("alt");
    const name = (rawName ?? titleCase(slug)).trim();
    const tier = currentTier;
    const rank = (tierCounts.get(tier) ?? 0) + 1;
    tierCounts.set(tier, rank);
    entries.push({ slug, name, types, tier, rank });
  });

  return entries;
}

function parseDetailMoves(html: string): {
  fastMoves: Move[];
  chargedMoves: Move[];
} {
  const $ = cheerio.load(html);
  const fastMoves: Move[] = [];
  const chargedMoves: Move[] = [];
  const seen = new Set<string>();

  // The detail page can contain separate "Best Movesets" blocks for PvE and
  // PvP — each is preceded by its own label badge ("PvE" / "PvP"). We only
  // care about the PvP block; if it isn't present (some Pokémon are PvE-only
  // on Pokébase), the movesets are left empty per the data contract.
  const pvpLabel = $("div.font-logo").filter(
    (_, el) => $(el).text().trim() === "PvP",
  );
  if (pvpLabel.length === 0) {
    return { fastMoves, chargedMoves };
  }
  const $pvpBlock = pvpLabel.first().parent();
  collectFromRows($, $pvpBlock, fastMoves, chargedMoves, seen);

  return { fastMoves, chargedMoves };
}

function collectFromRows(
  $: cheerio.CheerioAPI,
  $container: cheerio.Cheerio<AnyNode>,
  fastMoves: Move[],
  chargedMoves: Move[],
  seen: Set<string>,
) {
  $container.find("div").each((_, row) => {
    const $row = $(row);
    const cls = $row.attr("class") ?? "";
    if (!/\bflex items-center gap-2 p-3\b/.test(cls)) return;
    const isCharged = /\bpl-5\b/.test(cls);
    const category: MoveCategory = isCharged ? "charged" : "fast";
    const target = isCharged ? chargedMoves : fastMoves;

    $row.find('a[href^="/pokemon-go/moves/"]').each((_, a) => {
      const $a = $(a);
      const m = $a.attr("href")?.match(/^\/pokemon-go\/moves\/([a-z0-9-]+)$/);
      if (!m) return;
      const slug = m[1];
      const $icon = $a.find('img[src*="Pokemon_Type_Icon_"]').first();
      const type = typeFromIconSrc($icon.attr("src"));
      if (!type) return;
      const name = ($icon.attr("alt") ?? titleCase(slug)).trim();

      const dedupKey = `${slug}:${category}`;
      if (seen.has(dedupKey)) return;
      seen.add(dedupKey);
      target.push({ slug, name, type, category });
    });
  });
}

async function main() {
  console.log("Pokébase Great League scraper");
  console.log(`source: ${TIER_LIST_URL}`);
  console.log("");

  console.log("step 1 — fetching tier list");
  const tierListHtml = await fetchCached(TIER_LIST_URL);
  const tierEntries = parseTierList(tierListHtml);
  console.log(`  parsed ${tierEntries.length} Pokémon across tiers`);
  const tierBreakdown = tierEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.tier] = (acc[e.tier] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`  breakdown: ${JSON.stringify(tierBreakdown)}`);

  console.log("");
  console.log(`step 2 — fetching ${tierEntries.length} detail pages`);
  const out: PokemonEntry[] = [];
  for (let i = 0; i < tierEntries.length; i++) {
    const entry = tierEntries[i];
    const url = `${BASE_URL}/pokemon-go/pokemon/${entry.slug}`;
    process.stdout.write(
      `  [${i + 1}/${tierEntries.length}] ${entry.name} (${entry.tier})\n`,
    );
    let detailHtml: string;
    try {
      detailHtml = await fetchCached(url);
    } catch (err) {
      console.warn(`    skipping — ${(err as Error).message}`);
      continue;
    }
    const { fastMoves, chargedMoves } = parseDetailMoves(detailHtml);
    out.push({
      ...entry,
      url,
      fastMoves,
      chargedMoves,
    });
  }

  const output: ScrapeOutput = {
    scrapedAt: new Date().toISOString(),
    source: TIER_LIST_URL,
    league: "great",
    pokemon: out,
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log("");
  console.log(`wrote ${OUT_FILE} — ${out.length} entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
