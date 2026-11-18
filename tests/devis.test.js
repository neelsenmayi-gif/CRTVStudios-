// Tests de la fonction /api/devis, sans dépendance : `npm test` (Node 18+).
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { onRequestPost, validate } from "../functions/api/devis.js";

const ENV = { BREVO_API_KEY: "test-key", CONTACT_TO_EMAIL: "pro@example.com", SENDER_EMAIL: "site@example.com", BREVO_LIST_ID: "3", BREVO_NEWSLETTER_LIST_ID: "4" };
const GOOD = { nom: "Studio Test", email: "Client@Example.com", reseau: "@test", besoin: "clipping-15", message: "Bonjour, je lance ma chaîne.", t: "8000", site_web: "" };

let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return new Response("{}", { status: 201 }); };
});

function req(body, headers = {}) {
  return new Request("https://crtvstudios.fr/api/devis", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Origin: "https://crtvstudios.fr", ...headers },
    body: JSON.stringify(body),
  });
}
const run = (body, env = ENV, headers) => onRequestPost({ request: req(body, headers), env });

test("demande valide : e-mail envoyé puis contact ajouté", async () => {
  const res = await run(GOOD);
  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(calls[0].body.to[0].email, "pro@example.com");
  assert.equal(calls[0].body.replyTo.email, "client@example.com");
  assert.match(calls[0].body.subject, /Clipping 15/);
  assert.equal(calls[1].url, "https://api.brevo.com/v3/contacts");
  assert.deepEqual(calls[1].body.listIds, [3]);
});

test("consentement newsletter : ajout à la seconde liste", async () => {
  await run({ ...GOOD, newsletter: "oui" });
  assert.deepEqual(calls[1].body.listIds, [3, 4]);
});

test("le HTML du message est échappé", async () => {
  await run({ ...GOOD, message: "<script>alert(1)</script> bonjour" });
  assert.ok(!calls[0].body.htmlContent.includes("<script>"));
});

test("champ piège rempli : réponse OK, rien n'est envoyé", async () => {
  const res = await run({ ...GOOD, site_web: "http://spam" });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test("formulaire rempli trop vite : ignoré", async () => {
  const res = await run({ ...GOOD, t: "900" });
  assert.equal(res.status, 200);
  assert.equal(calls.length, 0);
});

test("origine étrangère refusée", async () => {
  const res = await run(GOOD, ENV, { Origin: "https://evil.example" });
  assert.equal(res.status, 403);
});

test("champs invalides : 400 avec la liste", async () => {
  const res = await run({ ...GOOD, email: "pas-un-mail", besoin: "inconnu", message: "court" });
  assert.equal(res.status, 400);
  assert.deepEqual((await res.json()).fields, ["email", "besoin", "message"]);
});

test("sans clé Brevo : 503 not_configured", async () => {
  const res = await run(GOOD, {});
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error, "not_configured");
  assert.equal(body.status, "BREVO_API_KEY,CONTACT_TO_EMAIL,SENDER_EMAIL");
});

test("échec Brevo : 502", async () => {
  globalThis.fetch = async () => new Response("err", { status: 401 });
  const res = await run(GOOD);
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: "send_failed", status: "401" });
});

test("échec de l'ajout du contact : la demande reste acceptée", async () => {
  let n = 0;
  globalThis.fetch = async () => new Response("{}", { status: n++ === 0 ? 201 : 400 });
  const res = await run(GOOD);
  assert.equal(res.status, 200);
});

test("envoi sans JavaScript : redirection vers merci.html", async () => {
  const body = new URLSearchParams({ ...GOOD, t: "" });
  const r = new Request("https://crtvstudios.fr/api/devis", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const res = await onRequestPost({ request: r, env: ENV });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("Location"), "/merci.html");
});

test("copie cachée de la notification si NOTIFY_CC est rempli", async () => {
  await run(GOOD, { ...ENV, NOTIFY_CC: "copie@example.com, pas-un-mail, PRO@example.com" });
  assert.deepEqual(calls[0].body.bcc, [{ email: "copie@example.com" }]);
  assert.equal(calls[0].body.cc, undefined);
});

test("pas de copie par défaut", async () => {
  await run(GOOD);
  assert.equal(calls[0].body.cc, undefined);
  assert.equal(calls[0].body.bcc, undefined);
});

test("refus 400 de Brevo : nouvel essai minimal, la demande arrive", async () => {
  let n = 0;
  globalThis.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); n++; return n === 1 ? new Response('{"code":"invalid_parameter"}', { status: 400 }) : new Response("{}", { status: 201 }); };
  const res = await run(GOOD);
  assert.equal(res.status, 200);
  assert.equal(calls[1].body.replyTo, undefined);
  assert.equal(calls[1].body.to[0].email, "pro@example.com");
});

test("variables avec espaces ou guillemets : nettoyées", async () => {
  await run(GOOD, { ...ENV, SENDER_EMAIL: '  "site@example.com" \n', CONTACT_TO_EMAIL: " PRO@example.com " });
  assert.equal(calls[0].body.sender.email, "site@example.com");
  assert.equal(calls[0].body.to[0].email, "pro@example.com");
});

test("validate : nom vide refusé", () => {
  assert.deepEqual(validate({ ...GOOD, nom: "  " }).errors, ["nom"]);
});
