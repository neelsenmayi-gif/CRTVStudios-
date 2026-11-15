// Aperçu local sans dépendance : `node scripts/serveur-local.js` puis http://localhost:8788
// Sert public/ et branche /api/devis sur la vraie fonction.
// Variables lues dans .dev.vars si présent. Avec SIMULER_BREVO=1, aucun appel réel à Brevo :
// les envois sont affichés dans le terminal.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { onRequestPost } from "../functions/api/devis.js";

const root = fileURLToPath(new URL("../public/", import.meta.url));
const port = Number(process.env.PORT || 8788);
const env = { ...process.env };
const vars = fileURLToPath(new URL("../.dev.vars", import.meta.url));
if (existsSync(vars)) {
  for (const line of readFileSync(vars, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] !== "") env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (process.env.SIMULER_BREVO === "1") {
  Object.assign(env, { BREVO_API_KEY: "simulation", CONTACT_TO_EMAIL: env.CONTACT_TO_EMAIL || "contact@crtvstudios.fr", SENDER_EMAIL: env.SENDER_EMAIL || "site@crtvstudios.fr", BREVO_LIST_ID: env.BREVO_LIST_ID || "1" });
  globalThis.fetch = async (url, init) => {
    console.log("[simulation Brevo]", url, init && init.body ? JSON.parse(init.body).subject || JSON.parse(init.body).email : "");
    return new Response("{}", { status: 201 });
  };
}

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".webmanifest": "application/manifest+json", ".mp4": "video/mp4", ".json": "application/json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === "/api/devis" && req.method === "POST") {
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: "POST", headers: req.headers, body: Buffer.concat(chunks) });
    const out = await onRequestPost({ request, env, waitUntil: () => {} });
    res.writeHead(out.status, Object.fromEntries(out.headers)); res.end(Buffer.from(await out.arrayBuffer()));
    return;
  }
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  if (path.endsWith("/")) path += "index.html";
  let file = join(root, path);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch { file = join(root, "404.html"); res.statusCode = 404; }
  try {
    const body = await readFile(file);
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(body);
  } catch { res.statusCode = 404; res.end("Introuvable"); }
}).listen(port, () => console.log(`Aperçu : http://localhost:${port}`));
