/* CRTV Studios — comportements de la page (sans dépendance).
   - sélection d'une offre depuis la grille de prix
   - formulaire de devis : contrôle des champs, envoi, confirmation
   - vidéos : chargement différé, lecture au clic
   - barre d'action mobile masquée quand le formulaire est à l'écran
   - événements de statistiques (Plausible, si activé) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var MAIL = "contact@crtvstudios.fr"; // TODO mail pro : garder en phase avec index.html

  function track(name, props) {
    try { if (typeof window.plausible === "function") window.plausible(name, props ? { props: props } : undefined); } catch (e) { /* stats facultatives */ }
  }

  /* ---------- Offre présélectionnée ---------- */
  var select = document.getElementById("f-besoin");
  document.addEventListener("click", function (ev) {
    var link = ev.target.closest && ev.target.closest("[data-offre], [data-cta]");
    if (!link) return;
    var offre = link.getAttribute("data-offre");
    if (offre && select) {
      select.value = offre;
      clearError(select);
      track("Choix offre", { offre: offre });
    }
    var cta = link.getAttribute("data-cta");
    if (cta) track("Clic CTA", { position: cta });
    // Placer le focus dans le formulaire après le défilement vers #devis
    if (link.getAttribute("href") === "#devis") {
      var target = offre ? document.getElementById("f-nom") : null;
      if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
    }
  });

  /* ---------- Formulaire ---------- */
  var form = document.getElementById("devis-form");
  var status = document.getElementById("form-status");
  var startedAt = Date.now();

  var messages = {
    nom: { valueMissing: "Indiquez votre nom ou celui de votre marque." },
    email: { valueMissing: "Indiquez votre adresse mail.", typeMismatch: "Cette adresse mail ne semble pas valide (exemple : nom@domaine.fr)." },
    besoin: { valueMissing: "Choisissez une offre, ou « Je ne sais pas encore »." },
    message: { valueMissing: "Décrivez votre besoin en quelques mots.", tooShort: "Un peu plus de détails, s'il vous plaît (10 caractères minimum)." }
  };

  function errorEl(field) { return document.getElementById("e-" + field.name); }
  function clearError(field) {
    var el = errorEl(field);
    if (el) el.textContent = "";
    field.removeAttribute("aria-invalid");
  }
  function check(field) {
    var m = messages[field.name];
    if (!m) return true;
    var v = field.validity, text = "";
    if (v.valueMissing || (field.required && !field.value.trim())) text = m.valueMissing;
    else if (v.typeMismatch || (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim()))) text = m.typeMismatch;
    else if (v.tooShort || (field.minLength > 0 && field.value.trim().length < field.minLength)) text = m.tooShort;
    var el = errorEl(field);
    if (text) {
      field.setAttribute("aria-invalid", "true");
      if (el) el.textContent = text;
      return false;
    }
    clearError(field);
    return true;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input[required], select[required], textarea[required]"));
    fields.forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value) check(f); });
      f.addEventListener("input", function () { if (f.getAttribute("aria-invalid")) check(f); });
      f.addEventListener("change", function () { if (f.getAttribute("aria-invalid")) check(f); });
    });

    // Cloudflare Turnstile, seulement si une clé de site est renseignée sur le formulaire.
    var sitekey = form.getAttribute("data-turnstile-sitekey");
    if (sitekey) {
      var holder = document.getElementById("turnstile");
      holder.className = "cf-turnstile turnstile";
      holder.setAttribute("data-sitekey", sitekey);
      holder.setAttribute("data-language", "fr");
      holder.setAttribute("data-theme", "dark");
      var s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      status.textContent = ""; status.className = "form-status";
      var firstInvalid = null;
      fields.forEach(function (f) { if (!check(f) && !firstInvalid) firstInvalid = f; });
      if (firstInvalid) { firstInvalid.focus(); return; }

      form.elements.t.value = String(Date.now() - startedAt);
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = typeof value === "string" ? value.trim() : value; });

      var button = form.querySelector('button[type="submit"]');
      button.disabled = true; button.textContent = "Envoi en cours…";

      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; });
      }).then(function (r) {
        if (!r.ok) throw new Error((r.body && r.body.error) || "envoi");
        track("Devis envoyé", { offre: data.besoin || "inconnue" });
        showSuccess(data);
      }).catch(function (err) {
        button.disabled = false; button.textContent = "Envoyer ma demande";
        var subject = encodeURIComponent("Demande de devis — " + (data.nom || ""));
        var bodyTxt = encodeURIComponent("Offre : " + (data.besoin || "") + "\nRéseau : " + (data.reseau || "") + "\n\n" + (data.message || ""));
        var msg = err && err.message === "validation"
          ? "Certains champs ne sont pas valides. Vérifiez-les et réessayez."
          : "L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-nous directement : ";
        status.className = "form-status is-error";
        status.textContent = msg;
        if (!(err && err.message === "validation")) {
          var a = document.createElement("a");
          a.href = "mailto:" + MAIL + "?subject=" + subject + "&body=" + bodyTxt;
          a.textContent = MAIL;
          status.appendChild(a);
          status.appendChild(document.createTextNode("."));
        }
        if (window.turnstile && typeof window.turnstile.reset === "function") window.turnstile.reset();
      });
    });
  }

  function showSuccess(data) {
    var zone = document.getElementById("devis-zone");
    zone.innerHTML = "";
    var box = document.createElement("div");
    box.className = "success";
    box.setAttribute("role", "status");
    var h = document.createElement("h3");
    h.textContent = "Demande reçue.";
    h.tabIndex = -1;
    var p = document.createElement("p");
    p.textContent = "Merci " + (data.nom || "") + ". Nous vous répondons sous 24 h à l'adresse " + (data.email || "indiquée") + ". Pensez à vérifier vos courriers indésirables.";
    var a = document.createElement("a");
    a.className = "btn ghost"; a.href = "#offres"; a.textContent = "Revoir les offres";
    box.appendChild(h); box.appendChild(p); box.appendChild(a);
    zone.appendChild(box);
    h.focus();
  }

  /* ---------- Vidéos ---------- */
  var reels = Array.prototype.slice.call(document.querySelectorAll(".reel video"));
  reels.forEach(function (video) {
    video.removeAttribute("controls"); // le bouton lecture remplace les contrôles jusqu'au premier clic
    var card = video.closest(".reel");
    var btn = card && card.querySelector(".play");
    if (!btn) { video.setAttribute("controls", ""); return; }
    btn.addEventListener("click", function () {
      reels.forEach(function (other) { if (other !== video && !other.paused) other.pause(); });
      video.setAttribute("controls", "");
      card.classList.add("is-playing");
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* lecture bloquée : les contrôles restent visibles */ });
      video.focus();
      track("Lecture vidéo", { video: btn.getAttribute("aria-label") || "" });
    });
  });
  // Affiches chargées seulement à l'approche de la section
  var posters = document.querySelectorAll("video[data-poster]");
  if (posters.length) {
    var setPoster = function (v) { v.setAttribute("poster", v.getAttribute("data-poster")); v.removeAttribute("data-poster"); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { setPoster(e.target); io.unobserve(e.target); } });
      }, { rootMargin: "400px" });
      posters.forEach(function (v) { io.observe(v); });
    } else {
      posters.forEach(setPoster);
    }
  }

  /* ---------- Barre d'action mobile ---------- */
  var sticky = document.getElementById("sticky-cta");
  var devis = document.getElementById("devis");
  var footer = document.querySelector("footer");
  if (sticky && devis && "IntersectionObserver" in window) {
    var visible = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      sticky.hidden = visible.size > 0;
    });
    obs.observe(devis);
    if (footer) obs.observe(footer);
    var heroCta = document.querySelector(".hero .cta");
    if (heroCta) obs.observe(heroCta); // pas de doublon : la barre apparaît une fois le bouton du haut dépassé
  }
})();
