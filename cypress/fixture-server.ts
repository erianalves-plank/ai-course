import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PORT = 4000;
const ROOT = join(process.cwd(), "cypress/fixtures");

const server = createServer((req, res) => {
  const match = req.url?.match(/^\/api\/v2\/(pokemon|pokemon-species)\/(\d+)\/?$/);
  if (!match) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not a fixture route");
    return;
  }

  const kind = match[1] === "pokemon" ? "pokemon" : "species";
  const id = match[2];
  const file = join(ROOT, kind, `${id}.json`);

  if (!existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end(`no fixture for ${kind}/${id}`);
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(readFileSync(file));
});

server.listen(PORT, () => {
  console.log(`Fixture server listening on http://localhost:${PORT}`);
});
