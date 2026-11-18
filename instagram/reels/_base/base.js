/* Base commune des reels CRTV.
   La page définit window.REEL = {
     scenes: { idScene: [entrée, sortie], ... },
     hits: [temps des flashs],
     sweeps: [temps des reflets],
     logo: { in: t, dock: t } (facultatif : logo central puis rangé en haut),
     cta: { in: t, type: t0, word: "DEVIS" } (facultatif : zone commentaire),
     custom(t) { ...animations propres au reel... }
   } avant de charger ce fichier. */
const $ = (s) => document.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t, a, b) => clamp((t - a) / (b - a));
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const pop = (el, t, s, dx = 0, dy = 0, from = 0.7) => {
  const x = p(t, s - 0.05, s + 0.3);
  el.style.opacity = eOut(x).toFixed(3);
  el.style.transform = `translate(${((1 - eBack(x)) * dx).toFixed(1)}px, ${((1 - eBack(x)) * dy).toFixed(1)}px) scale(${lerp(from, 1, eBack(x)).toFixed(3)})`;
  return x;
};

(function () {
  const stage = $("#stage");
  const back = document.createElement("div");
  back.innerHTML = '<div class="blob" id="b1"></div><div class="blob" id="b2"></div><div class="blob" id="b3"></div><div id="grid"></div><div id="sweep"></div><div id="flash"></div>';
  while (back.lastChild) stage.prepend(back.lastChild);
  const front = document.createElement("div");
  front.innerHTML =
    '<div id="logo"><img src="../../../../public/assets/logo-blanc.svg" alt=""></div><div id="logoshine"><i id="shineBar"></i></div>' +
    '<div id="dock"><img src="../../../../public/assets/logo-blanc.svg" alt=""></div><div id="dockrefl"><img src="../../../../public/assets/logo-blanc.svg" alt=""></div>' +
    '<canvas id="grain" width="540" height="960"></canvas><div id="vignette"></div>';
  while (front.firstChild) stage.appendChild(front.firstChild);
})();

const grainCv = $("#grain"), gctx = grainCv.getContext("2d");
const grainFrames = [];
for (let k = 0; k < 6; k++) {
  const img = gctx.createImageData(540, 960);
  let seed = 1234 + k * 999;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647; const v = seed % 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  grainFrames.push(img);
}
const words = [...document.querySelectorAll(".w")].map((el) => ({ el, s: parseFloat(el.dataset.s) }));

function sceneAlpha([a, b], t) {
  return Math.min(eOut(p(t, a - 0.02, a + 0.18)), 1 - eInOut(p(t, b - 0.14, b + 0.06)));
}

function render(t) {
  const R = window.REEL;
  $("#b1").style.transform = `translate(${-450 + Math.sin(t * .35) * 160}px, ${-420 + Math.cos(t * .27) * 140}px)`;
  $("#b2").style.transform = `translate(${250 + Math.cos(t * .3) * 140}px, ${900 + Math.sin(t * .22) * 160}px)`;
  $("#b3").style.transform = `translate(${280 + Math.sin(t * .4 + 1) * 220}px, ${320 + Math.cos(t * .33) * 260}px)`;
  $("#grid").style.transform = `perspective(900px) rotateX(58deg) translateY(${(((t * 60) % 90) + 90) % 90}px) translateZ(-200px)`;
  gctx.putImageData(grainFrames[((Math.floor(t * 30) % 6) + 6) % 6], 0, 0);

  let fl = 0;
  for (const h of R.hits || []) if (t >= h) fl = Math.max(fl, 1 - p(t, h, h + 0.35));
  $("#flash").style.opacity = (fl * 0.5).toFixed(3);
  let sw = 0;
  for (const s of R.sweeps || []) { const x = p(t, s, s + 0.9); if (x > 0 && x < 1) sw = x; }
  $("#sweep").style.opacity = Math.sin(Math.PI * sw).toFixed(3);
  $("#sweep").style.left = `${lerp(-600, 1500, eInOut(sw))}px`;

  for (const id in R.scenes) $("#" + id).style.opacity = sceneAlpha(R.scenes[id], t).toFixed(3);

  for (const { el, s } of words) {
    const x = p(t, s - 0.04, s + 0.22);
    el.style.opacity = eOut(x).toFixed(3);
    el.style.transform = `translateY(${((1 - eBack(x)) * 60).toFixed(1)}px) scale(${lerp(0.86, 1, eOut(x)).toFixed(3)})`;
    el.style.filter = x < 1 ? `blur(${((1 - x) * 10).toFixed(1)}px)` : "none";
  }

  if (R.logo) {
    const { in: li, dock: ld } = R.logo;
    const lgIn = eBack(p(t, li, li + 0.45)), lgDock = eInOut(p(t, ld, ld + 0.5));
    const sc = lerp(0.6, 1, lgIn) * lerp(1, 120 / 520, lgDock);
    const ty = lerp(-80, 250 + 62 - 960, lgDock);
    $("#logo").style.opacity = (t < li ? 0 : eOut(p(t, li, li + 0.2)) * (1 - p(t, ld + 0.4, ld + 0.5))).toFixed(3);
    $("#logo").style.transform = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(4)})`;
    $("#logoshine").style.opacity = (t < li ? 0 : 1 - p(t, ld, ld + 0.1)).toFixed(3);
    $("#logoshine").style.transform = $("#logo").style.transform;
    $("#shineBar").style.left = `${lerp(-60, 130, eInOut(p(t, li + 0.2, li + 0.9)))}%`;
    const dk = t >= ld + 0.45 ? 1 : 0;
    $("#dock").style.opacity = dk; $("#dockrefl").style.opacity = dk;
  }

  if (R.cta && $("#comment")) {
    const { in: ci, type: ty, word } = R.cta;
    $("#comment").style.opacity = eOut(p(t, ci, ci + 0.35)).toFixed(3);
    $("#comment").style.transform = `translateY(${((1 - eBack(p(t, ci, ci + 0.45))) * 80).toFixed(1)}px)`;
    const n = Math.round(clamp(p(t, ty, ty + 0.1 * word.length)) * word.length);
    $("#typed").textContent = word.slice(0, n);
    $("#caret").style.opacity = (Math.floor(t * 3) % 2 === 0 || n < word.length) ? 1 : 0;
    const done = ty + 0.1 * word.length;
    $("#send").style.color = t > done + 0.05 ? "#ffffff" : "#8f8cff";
    $("#send").style.transform = `scale(${(1 + Math.sin(Math.PI * p(t, done + 0.1, done + 0.5)) * 0.25).toFixed(3)})`;
  }

  if (R.custom) R.custom(t);
}

function fitLines() {
  for (const el of document.querySelectorAll(".line")) {
    let fs = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth + 1 && fs > 20) { fs *= 0.97; el.style.fontSize = fs + "px"; }
  }
}
window.render = render;
window.ready = document.fonts.ready.then(fitLines).then(() => Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => 0) : 0))));
render(0);
