/**
 * POST /api/devis — réception du formulaire de devis (Cloudflare Pages Functions).
 *
 * 1. Contrôle anti-spam (champ piège, délai minimal, origine, Turnstile si configuré).
 * 2. Validation des champs.
 * 3. Envoi d'un e-mail à l'adresse pro via l'API transactionnelle Brevo (obligatoire).
 * 4. Ajout / mise à jour du contact dans Brevo (facultatif, n'empêche jamais la réponse).
 *
 * Aucune clé dans le code : tout passe par les variables d'environnement
 * (voir .env.example ; en local : fichier .dev.vars, jamais commité).
 */

export const OFFRES = {
  "short-solo": "Short Solo (65 € HT)",
  "pack-boost": "Pack Boost (250 € HT)",
  "pack-pro": "Pack Pro (480 € HT)",
  "clipping-15": "Clipping 15 (350 € HT)",
  "clipping-30": "Clipping 30 (520 € HT)",
  "youtube": "Vidéo YouTube (dès 240 € HT)",
  "graphisme": "Graphisme : logo, miniatures, photo, affiches (sur devis)",
  "sur-mesure": "Formats longs, tournages, contenus d'envergure (sur devis)",
  "conseil": "Ne sait pas encore, souhaite un conseil",
};

const MIN_FILL_MS = 3000; // en dessous : probablement un robot
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function onRequestPost(context) {
  const { request, env } = context;
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");

  // --- Lecture du corps (JSON depuis le site, ou formulaire classique sans JavaScript)
  let data;
  try {
    const type = request.headers.get("Content-Type") || "";
    if (type.includes("application/json")) {
      data = await request.json();
    } else {
      const fd = await request.formData();
      data = Object.fromEntries(fd.entries());
    }
  } catch {
    return reply(wantsJson, 400, { error: "validation" });
  }
  if (!data || typeof data !== "object") return reply(wantsJson, 400, { error: "validation" });

  // --- Origine : la requête doit venir du site lui-même
  const origin = request.headers.get("Origin");
  if (origin) {
    const allowed = new Set([new URL(request.url).origin, ...(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean)]);
    if (!allowed.has(origin)) return reply(wantsJson, 403, { error: "origin" });
  }

  // --- Anti-spam silencieux : on répond « OK » aux robots sans rien envoyer
  const honeypot = str(data.site_web);
  const elapsed = Number(data.t);
  if (honeypot || (data.t !== undefined && data.t !== "" && Number.isFinite(elapsed) && elapsed < MIN_FILL_MS)) {
    return reply(wantsJson, 200, { ok: true });
  }

  // --- Turnstile (si la clé secrète est configurée)
  if (env.TURNSTILE_SECRET_KEY) {
    const token = str(data["cf-turnstile-response"]);
    const okCaptcha = token && (await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, request.headers.get("CF-Connecting-IP")));
    if (!okCaptcha) return reply(wantsJson, 400, { error: "captcha" });
  }

  // --- Validation
  const v = validate(data);
  if (v.errors.length) return reply(wantsJson, 400, { error: "validation", fields: v.errors });
  const d = v.value;

  // --- Configuration
  const missing = ["BREVO_API_KEY", "CONTACT_TO_EMAIL", "SENDER_EMAIL"].filter((k) => !clean(env[k]));
  if (missing.length) {
    return reply(wantsJson, 503, { error: "not_configured", status: missing.join(",") });
  }

  // --- 1) E-mail à l'adresse pro (bloquant)
  const sent = await sendNotification(env, d);
  if (!sent.ok) return reply(wantsJson, 502, { error: "send_failed", status: sent.status });

  // --- 2) Contact Brevo + 3) accusé de réception au client (non bloquants)
  const sync = syncContact(env, d).catch((e) => console.error("Brevo contact:", e && e.message));
  const ack = sendConfirmation(env, d).catch((e) => console.error("Brevo confirmation:", e && e.message));
  const both = Promise.all([sync, ack]);
  if (context.waitUntil) context.waitUntil(both); else await both;

  return reply(wantsJson, 200, { ok: true });
}

export function validate(data) {
  const errors = [];
  const nom = str(data.nom).slice(0, 80);
  const email = str(data.email).toLowerCase().slice(0, 160);
  const reseau = str(data.reseau).slice(0, 200);
  const besoin = str(data.besoin);
  const message = str(data.message).slice(0, 3000);
  const newsletter = data.newsletter === "oui" || data.newsletter === true;

  if (!nom) errors.push("nom");
  if (!EMAIL_RE.test(email)) errors.push("email");
  if (!Object.prototype.hasOwnProperty.call(OFFRES, besoin)) errors.push("besoin");
  if (message.length < 10) errors.push("message");

  return { errors, value: { nom, email, reseau, besoin, offre: OFFRES[besoin], message, newsletter } };
}

async function sendNotification(env, d) {
  const lines = [
    ["Nom ou marque", d.nom],
    ["Adresse mail", d.email],
    ["Réseau ou chaîne", d.reseau || "—"],
    ["Besoin", d.offre],
    ["Actualités par e-mail", d.newsletter ? "oui (consentement donné)" : "non"],
  ];
  const text = lines.map(([k, val]) => `${k} : ${val}`).join("\n") + `\n\nMessage :\n${d.message}\n`;
  const html =
    `<h2 style="font-family:sans-serif">Nouvelle demande de devis</h2><table style="font-family:sans-serif;border-collapse:collapse">` +
    lines.map(([k, val]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(val)}</strong></td></tr>`).join("") +
    `</table><p style="font-family:sans-serif;white-space:pre-wrap;border-left:3px solid #2f2bff;padding-left:12px">${esc(d.message)}</p>` +
    `<p style="font-family:sans-serif;color:#555">Répondez directement à ce mail pour écrire au client.</p>`;

  const senderEmail = clean(env.SENDER_EMAIL).toLowerCase();
  const toEmail = clean(env.CONTACT_TO_EMAIL).toLowerCase();
  const full = {
    sender: { email: senderEmail, name: clean(env.SENDER_NAME) || "CRTV Studios" },
    to: [{ email: toEmail }],
    ...copies(env),
    replyTo: { email: d.email, name: d.nom },
    subject: `Devis — ${d.offre} — ${d.nom}`,
    textContent: text,
    htmlContent: html,
    tags: ["devis-site"],
  };
  let res = await brevoSend(env, full);
  let detail = "";
  if (res.status === 400) {
    // Brevo refuse un paramètre (souvent l'adresse saisie par le visiteur ou une copie) :
    // on renvoie une version minimale pour que la demande arrive quand même.
    detail = (await brevoErrorCode(res)) || "400";
    const minimal = { sender: { email: senderEmail, name: "CRTV Studios" }, to: [{ email: toEmail }], subject: full.subject, textContent: text, htmlContent: html };
    res = await brevoSend(env, minimal);
  }
  if (!res.ok) {
    const code = await brevoErrorCode(res);
    console.error("Brevo e-mail:", res.status, code);
    return { ok: false, status: [res.status, code || detail].filter(Boolean).join(" ") };
  }
  return { ok: true, status: res.status };
}

// Accusé de réception envoyé au client (désactivable avec SEND_CONFIRMATION=non).
export function confirmationContent(d) {
  const prenom = d.nom.split(/\s+/)[0];
  const subject = "Votre demande de devis a bien été reçue — CRTV Studios";
  const text =
    `Bonjour ${prenom},\n\n` +
    `Merci pour votre demande. Nous l'avons bien reçue et nous vous répondons sous 24 à 48 h.\n\n` +
    `Récapitulatif :\n- Besoin : ${d.offre}\n- Réseau ou chaîne : ${d.reseau || "—"}\n- Message : ${d.message}\n\n` +
    `Vous avez un autre besoin ou vous souhaitez préciser votre demande ? Répondez simplement à ce mail.\n\n` +
    `À très vite,\nL'équipe CRTV Studios\nhttps://crtvstudios.fr — Instagram : @crtvstudios_\n`;
  const row = (k, v) => `<tr><td style="padding:6px 14px 6px 0;color:#6b7194;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#0d0f1a">${esc(v)}</td></tr>`;
  const html =
    `<div style="background:#f3f4f8;padding:28px 12px;font-family:Helvetica,Arial,sans-serif">` +
    `<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden">` +
    `<div style="background:#ffffff;padding:26px 28px 0;text-align:center">` +
    `<img src="https://crtvstudios.fr/assets/email/logo-noir.png" width="96" height="99" alt="CRTV Studios" style="display:inline-block;width:96px;height:auto;border:0">` +
    `<div style="height:3px;width:56px;margin:16px auto 0;background:#ff2f8e;background:linear-gradient(90deg,#ff2f8e,#ff9c55);border-radius:2px"></div></div>` +
    `<div style="padding:28px">` +
    `<p style="margin:0 0 14px;font-size:16px;color:#0d0f1a">Bonjour ${esc(prenom)},</p>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#2a2e45">Merci pour votre demande. Nous l'avons bien reçue et nous vous répondons <strong>sous 24 à 48&nbsp;h</strong>.</p>` +
    `<table style="font-size:14px;border-collapse:collapse;margin:0 0 18px">${row("Besoin", d.offre)}${row("Réseau ou chaîne", d.reseau || "—")}${row("Message", d.message)}</table>` +
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#2a2e45">Vous avez un autre besoin ou vous souhaitez préciser votre demande&nbsp;? Répondez simplement à ce mail.</p>` +
    `<p style="margin:0;font-size:15px;color:#0d0f1a">À très vite,<br><strong>L'équipe CRTV Studios</strong></p>` +
    `</div><div style="padding:16px 28px;background:#f7f8fb;font-size:12px;color:#6b7194">` +
    `<a href="https://crtvstudios.fr" style="color:#2f2bff">crtvstudios.fr</a> · Instagram <a href="https://www.instagram.com/crtvstudios_/" style="color:#2f2bff">@crtvstudios_</a></div>` +
    `</div></div>`;
  return { subject, text, html };
}

async function sendConfirmation(env, d) {
  if (/^(non|no|false|0)$/i.test(clean(env.SEND_CONFIRMATION))) return;
  const senderEmail = clean(env.SENDER_EMAIL).toLowerCase();
  const c = confirmationContent(d);
  let res = await brevoSend(env, {
    sender: { email: senderEmail, name: clean(env.SENDER_NAME) || "CRTV Studios" },
    to: [{ email: d.email, name: d.nom }],
    replyTo: { email: clean(env.CONTACT_TO_EMAIL).toLowerCase() || senderEmail, name: "CRTV Studios" },
    subject: c.subject,
    textContent: c.text,
    htmlContent: c.html,
    tags: ["devis-confirmation"],
  });
  let first = "";
  if (!res.ok) {
    // Brevo refuse un paramètre : nouvel essai minimal (texte seul, sans réponse-à ni nom).
    first = `${res.status} ${await brevoErrorCode(res)}`.trim();
    res = await brevoSend(env, { sender: { email: senderEmail, name: "CRTV Studios" }, to: [{ email: d.email }], subject: c.subject, textContent: c.text });
  }
  if (!res.ok) {
    const code = `${res.status} ${await brevoErrorCode(res)}`.trim();
    console.error("Brevo confirmation:", first, "/", code);
    // Alerte interne : l'accusé de réception n'est pas parti, on prévient l'adresse pro.
    await brevoSend(env, {
      sender: { email: senderEmail, name: "CRTV Studios" },
      to: [{ email: clean(env.CONTACT_TO_EMAIL).toLowerCase() || senderEmail }],
      subject: `Accusé de réception non envoyé — ${d.nom}`,
      textContent: `L'accusé de réception automatique n'a pas pu être envoyé à ${d.email}.\nCode Brevo : ${first || "-"} / ${code}.\nLa demande elle-même est bien arrivée (mail « Devis — … »). Pensez à répondre au client.`,
      tags: ["devis-alerte"],
    }).catch(() => {});
    throw new Error(`HTTP ${first} / ${code}`);
  }
}

function brevoSend(env, payload) {
  return fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": clean(env.BREVO_API_KEY), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
}

// Code d'erreur Brevo (ex. « invalid_parameter »), jamais de donnée sensible.
async function brevoErrorCode(res) {
  try { const j = await res.clone().json(); return String(j.code || "").slice(0, 40); } catch { return ""; }
}

// Nettoie une variable d'environnement (espaces, guillemets, retours à la ligne collés par erreur).
function clean(v) {
  return String(v == null ? "" : v).trim().replace(/^["']|["']$/g, "").trim();
}

async function syncContact(env, d) {
  const listIds = [];
  const leads = parseInt(env.BREVO_LIST_ID, 10);
  const news = parseInt(env.BREVO_NEWSLETTER_LIST_ID, 10);
  if (Number.isFinite(leads)) listIds.push(leads);
  if (d.newsletter && Number.isFinite(news)) listIds.push(news);
  if (!listIds.length) return;

  const attributes = {};
  if (clean(env.BREVO_NAME_ATTRIBUTE)) attributes[clean(env.BREVO_NAME_ATTRIBUTE)] = d.nom;

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": clean(env.BREVO_API_KEY), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: d.email, attributes, listIds, updateEnabled: true }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await safeText(res)}`);
}

async function verifyTurnstile(secret, token, ip) {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const out = await res.json();
    return Boolean(out && out.success);
  } catch {
    return false;
  }
}

function reply(wantsJson, status, body) {
  if (wantsJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  // Formulaire envoyé sans JavaScript : redirection vers une page lisible
  const location = status === 200 ? "/merci.html" : "/erreur.html";
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
}

// Copies facultatives de la notification (ex. une boîte qui notifie bien sur téléphone).
// NOTIFY_CC = adresses séparées par des virgules. Envoyées en copie CACHÉE (bcc) :
// elles n'apparaissent pas dans le mail, donc « Répondre » ne s'adresse qu'au client.
function copies(env) {
  const list = String(env.NOTIFY_CC || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => EMAIL_RE.test(e) && e !== clean(env.CONTACT_TO_EMAIL).toLowerCase());
  return list.length ? { bcc: [...new Set(list)].map((email) => ({ email })) } : {};
}

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
async function safeText(res) {
  try { return (await res.text()).slice(0, 300); } catch { return ""; }
}
