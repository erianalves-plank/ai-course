import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://pokeapi.co/api/v2";
const OUT = join(process.cwd(), "cypress/fixtures");
const COUNT = 151;
const MAX_RETRIES = 5;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function dump(path: string, file: string) {
  if (existsSync(file)) return;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`);
      if (!res.ok) throw new Error(`${res.status} for ${path}`);
      const json = await res.json();
      writeFileSync(file, JSON.stringify(json));
      return;
    } catch (err) {
      lastErr = err;
      const backoff = 500 * attempt;
      console.warn(`  retry ${attempt}/${MAX_RETRIES} for ${path} after ${backoff}ms`);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

async function main() {
  mkdirSync(join(OUT, "pokemon"), { recursive: true });
  mkdirSync(join(OUT, "species"), { recursive: true });

  for (let id = 1; id <= COUNT; id++) {
    console.log(`Capturing ${id}/${COUNT}`);
    await dump(`/pokemon/${id}`, join(OUT, "pokemon", `${id}.json`));
    await dump(`/pokemon-species/${id}`, join(OUT, "species", `${id}.json`));
    await sleep(50);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
