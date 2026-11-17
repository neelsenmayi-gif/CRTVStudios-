/* CRTV Studios — comportements de la page (sans dépendance).
   - mouvement : logo qui se range dans l'en-tête, mots qui s'allument, révélations,
     reflets qui suivent le pointeur (tout est coupé si l'utilisateur réduit les animations)
   - sélection d'une offre depuis les cartes de prix
   - formulaire de devis : contrôle des champs, envoi, confirmation
   - vidéos : chargement différé, lecture au clic
   - barre d'action mobile, événements de statistiques (Plausible, si activé) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) root.classList.add("motion");

  var MAIL = "contact@crtvstudios.fr"; // adresse pro (confirmée le 17/11)

  function track(name, props) {
    try { if (typeof window.plausible === "function") window.plausible(name, props ? { props: props } : undefined); } catch (e) { /* stats facultatives */ }
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* =========================================================
     Mouvement lié au défilement
     ========================================================= */
  var header = document.getElementById("top");
  var fly = document.querySelector(".fly");
  var flyReflect = fly && fly.querySelector(".reflect");
  var heroMark = document.querySelector("#hero-logo .mark-wrap");
  var brand = document.querySelector(".brand");
  var geo = null;

  /* Logo volant.
     1) Navigateurs récents (iOS 26, Chrome, Edge) : l'animation est confiée au navigateur via
        ScrollTimeline. Elle suit le défilement sur la carte graphique, sans JavaScript à chaque
        image : aucun retard ni saccade, même pendant l'inertie du défilement au doigt.
     2) Autres navigateurs : repli en JavaScript, calé sur le défilement. */
  var hasTimeline = typeof window.ScrollTimeline === "function" && fly && typeof fly.animate === "function";
  var flyAnims = [];
  var lastW = 0, lastH = 0, lastDoc = 0;

  function flyState(y) {
    var dist = Math.max(1, geo.top0 + geo.h0 * 0.55 - geo.top1);
    var p = clamp(y / dist), e = ease(p);
    return {
      x: lerp(geo.left0, geo.left1, e),
      t: lerp(geo.top0 - y, geo.top1, e),
      k: lerp(geo.w0, geo.w1, e) / geo.w0,
      o: Math.max(0, .32 * (1 - p * 2.5)),
      dist: dist
    };
  }
  function tf(st) { return "translate3d(" + st.x.toFixed(2) + "px," + st.t.toFixed(2) + "px,0) scale(" + st.k.toFixed(4) + ")"; }

  function buildTimeline() {
    flyAnims.forEach(function (an) { an.cancel(); });
    flyAnims = [];
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var dist = flyState(0).dist;
    if (maxScroll <= dist + 1) return false;
    var frames = [], fades = [], N = 32;
    for (var i = 0; i <= N; i++) {
      var y = dist * i / N, st = flyState(y), off = y / maxScroll;
      frames.push({ offset: off, transform: tf(st) });
      fades.push({ offset: off, opacity: st.o });
    }
    var end = flyState(dist);
    frames.push({ offset: 1, transform: tf(end) });
    fades.push({ offset: 1, opacity: 0 });
    var timeline = new window.ScrollTimeline({ source: document.documentElement, axis: "block" });
    flyAnims.push(fly.animate(frames, { timeline: timeline, fill: "both", easing: "linear" }));
    if (flyReflect) flyAnims.push(flyReflect.animate(fades, { timeline: timeline, fill: "both", easing: "linear" }));
    fly.style.transform = "";
    return true;
  }

  function measure(force) {
    if (!fly || !heroMark || !brand || reduce) return;
    var w = window.innerWidth, h = window.innerHeight, doc = document.documentElement.scrollHeight;
    // Sur iPhone, la barre d'adresse qui se replie change la hauteur pendant le défilement :
    // on ne recalcule pas pour si peu, sinon l'animation serait reconstruite en plein geste.
    if (!force && w === lastW && Math.abs(h - lastH) < 160 && Math.abs(doc - lastDoc) < 2) return;
    lastW = w; lastH = h; lastDoc = doc;
    var y = window.scrollY;
    var a = heroMark.getBoundingClientRect();
    var b = brand.getBoundingClientRect();
    geo = {
      left0: a.left, top0: a.top + y, w0: a.width, h0: a.width * 963 / 935,
      left1: b.left, top1: b.top, w1: b.width
    };
    fly.style.width = geo.w0 + "px";
    if (!(hasTimeline && buildTimeline())) {
      hasTimeline = false;
      drawFly();
    }
  }
  function drawFly() {
    if (!geo || hasTimeline) return;
    var st = flyState(window.scrollY);
    fly.style.transform = tf(st);
    if (flyReflect) flyReflect.style.opacity = st.o.toFixed(3);
  }

  // Manifeste : découpe en mots
  var manifest = document.querySelector("[data-words]");
  var words = [];
  if (manifest) {
    var walk = function (node, hot) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement("span");
            s.className = "w" + (hot ? " hot" : "");
            s.textContent = part;
            words.push(s);
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child, hot || child.tagName === "EM");
        }
      });
    };
    walk(manifest, false);
    if (reduce) words.forEach(function (w) { w.classList.add("on"); });
  }

  var scrollers = Array.prototype.slice.call(document.querySelectorAll("[data-scroll]"));

  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;

    if (header) header.classList.toggle("is-solid", y > vh * 0.55);

    drawFly();

    if (words.length && !reduce) {
      var r = manifest.getBoundingClientRect();
      if (r.bottom > -vh && r.top < vh * 2) {
      var prog = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      var lit = Math.round(prog * words.length);
      for (var i = 0; i < words.length; i++) {
        var on = i < lit;
        if (words[i]._on !== on) { words[i]._on = on; words[i].classList.toggle("on", on); }
      }
      }
    }

    if (!reduce) {
      scrollers.forEach(function (el) {
        var rr = el.getBoundingClientRect();
        if (rr.bottom < -50 || rr.top > vh + 50) return; // hors écran : rien à recalculer
        var v = el.classList.contains("steps")
          ? clamp((vh * 0.8 - rr.top) / (rr.height + vh * 0.2))
          : clamp((vh - rr.top) / (vh + rr.height));
        var val = v.toFixed(3);
        if (el._p !== val) { el._p = val; el.style.setProperty("--p", val); }
      });
    }
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  // Le reflet du logo se met en pause pendant le défilement (moins de travail graphique).
  var scrollIdle = null;
  function onScrollState() {
    if (!root.classList.contains("is-scrolling")) root.classList.add("is-scrolling");
    clearTimeout(scrollIdle);
    scrollIdle = setTimeout(function () { root.classList.remove("is-scrolling"); }, 180);
  }

  measure(true);
  frame();
  window.addEventListener("scroll", function () { onScroll(); if (!reduce) onScrollState(); }, { passive: true });
  window.addEventListener("resize", function () { measure(false); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(true); onScroll(); });
  window.addEventListener("load", function () { measure(true); onScroll(); });
  // La hauteur de la page change quand les images différées arrivent : on recale l'animation.
  if ("ResizeObserver" in window) new ResizeObserver(function () { measure(false); }).observe(document.body);

  // Révélations à l'entrée dans l'écran
  var reveals = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rio.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Reflet qui suit le pointeur sur les cartes
  if (!reduce) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (ev) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (ev.clientX - r.left) + "px");
        card.style.setProperty("--my", (ev.clientY - r.top) + "px");
      });
    });
  }

  /* =========================================================
     Offre présélectionnée
     ========================================================= */
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
    if (link.getAttribute("href") === "#devis" && offre) {
      var target = document.getElementById("f-nom");
      if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
    }
  });

  /* =========================================================
     Formulaire
     ========================================================= */
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
      var sc = document.createElement("script");
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      sc.async = true; sc.defer = true;
      document.head.appendChild(sc);
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
        var isValidation = err && err.message === "validation";
        status.className = "form-status is-error";
        status.textContent = isValidation
          ? "Certains champs ne sont pas valides. Vérifiez-les et réessayez."
          : "L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez-nous directement : ";
        if (!isValidation) {
          var subject = encodeURIComponent("Demande de devis — " + (data.nom || ""));
          var bodyTxt = encodeURIComponent("Offre : " + (data.besoin || "") + "\nRéseau : " + (data.reseau || "") + "\n\n" + (data.message || ""));
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
    p.textContent = "Merci " + (data.nom || "") + ". Nous vous répondons sous 24 à 48 h à l'adresse " + (data.email || "indiquée") + ". Pensez à vérifier vos courriers indésirables.";
    var a = document.createElement("a");
    a.className = "btn ghost"; a.href = "#offres"; a.textContent = "Revoir les offres";
    box.appendChild(h); box.appendChild(p); box.appendChild(a);
    zone.appendChild(box);
    h.focus();
  }

  /* =========================================================
     Vidéos
     ========================================================= */
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
      var pr = video.play();
      if (pr && pr.catch) pr.catch(function () { /* lecture bloquée : les contrôles restent visibles */ });
      video.focus();
      track("Lecture vidéo", { video: btn.getAttribute("aria-label") || "" });
    });
  });
  var posters = document.querySelectorAll("video[data-poster]");
  if (posters.length) {
    var setPoster = function (v) { v.setAttribute("poster", v.getAttribute("data-poster")); v.removeAttribute("data-poster"); };
    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { setPoster(en.target); pio.unobserve(en.target); } });
      }, { rootMargin: "400px" });
      posters.forEach(function (v) { pio.observe(v); });
    } else {
      posters.forEach(setPoster);
    }
  }

  /* =========================================================
     Barre d'action mobile
     ========================================================= */
  var sticky = document.getElementById("sticky-cta");
  var devis = document.getElementById("devis");
  var footer = document.querySelector("footer");
  var heroCta = document.querySelector(".hero .cta");
  if (sticky && devis && "IntersectionObserver" in window) {
    var visible = new Set();
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
      sticky.hidden = visible.size > 0;
    });
    sio.observe(devis);
    if (footer) sio.observe(footer);
    if (heroCta) sio.observe(heroCta);
  }
})();
