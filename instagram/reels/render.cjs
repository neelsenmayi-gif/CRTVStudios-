// Rendu d'un reel motion design : page HTML animée (window.render(t)) -> MP4 1080x1920.
// Usage :
//   node instagram/reels/render.cjs <dossier-du-reel> [--stills 0.3,2.5,...] [--fps 30] [--duration 24]
// Le dossier contient motion/reel.html et voix.mp3. Sortie : <dossier>/reel.mp4
// (ou des images PNG dans <dossier>/apercu/ avec --stills).
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const dir = path.resolve(args[0] || ".");
const opt = (name, def) => {
  const i = args.indexOf("--" + name);
  return i >= 0 ? args[i + 1] : def;
};
const fps = Number(opt("fps", 30));
const duration = Number(opt("duration", 24));
const stills = opt("stills", null);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(dir, "motion", "reel.html"));
  await page.evaluate(() => window.ready);

  if (stills) {
    const out = path.join(dir, "apercu");
    fs.mkdirSync(out, { recursive: true });
    for (const s of stills.split(",").map(Number)) {
      await page.evaluate((t) => window.render(t), s);
      await page.screenshot({ path: path.join(out, `t${s.toFixed(2)}.png`) });
    }
    await browser.close();
    return;
  }

  const voice = path.join(dir, "voix.mp3");
  const output = path.join(dir, "reel.mp4");
  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-i", voice,
    "-filter_complex", "[1:a]adelay=200|200,apad[a]",
    "-map", "0:v", "-map", "[a]",
    "-t", String(duration),
    "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-r", String(fps),
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
    "-movflags", "+faststart",
    output,
  ], { stdio: ["pipe", "inherit", "inherit"] });

  const total = Math.round(duration * fps);
  // La voix est décalée de 0,2 s (adelay) : l'animation suit le même décalage.
  const offset = 0.2;
  for (let i = 0; i < total; i++) {
    const t = i / fps - offset;
    await page.evaluate((x) => window.render(x), t);
    const buf = await page.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 60 === 0) process.stdout.write(`image ${i}/${total}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  console.log("OK", output);
})();
