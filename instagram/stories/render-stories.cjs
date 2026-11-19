// Exporte chaque écran de stories.html en PNG 1080x1920.
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.goto("file://" + path.join(__dirname, "stories.html"));
  await pg.evaluate(() => document.fonts.ready);
  const ids = await pg.$$eval(".f", (els) => els.map((e) => e.id));
  for (const id of ids) await (await pg.$("#" + id)).screenshot({ path: path.join(__dirname, "png", id + ".png") });
  await b.close();
  console.log(ids.join(" "));
})();
