#!/usr/bin/env node
// Crawls assets/AA/*.txt and renders each drink as a standalone PNG (light
// + dark) into assets/AA_Gallery/, named {id}-{light|dark}-{version}.png.
// Also rewrites assets/AA_Gallery/README.md with a grid of the results.
//
// Usage: node tools/build-aa-gallery.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";
import { parseYaml } from "./lib/yaml.mjs";
import { render } from "./lib/template.mjs";
import { parseDrinkFile, renderDrink } from "./lib/drink.mjs";
import { renderTitlebar, renderPromptbar } from "./lib/panel.mjs";
import { measureTermSize, PROBE_SIZE } from "./lib/measure.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rp = (...p) => path.join(root, ...p);

async function screenshot(browser, svgAbsPath, width, height, scheme, outPath) {
  const bg = scheme === "dark" ? "#0d1117" : "#ffffff";
  const html = `<!doctype html><html><body style="margin:0;background:${bg}"><img src="file:///${svgAbsPath.replace(/\\/g, "/")}" width="${width}" height="${height}" /></body></html>`;
  const htmlPath = svgAbsPath.replace(/\.svg$/, `.${scheme}.html`);
  writeFileSync(htmlPath, html, "utf8");
  const page = await browser.newPage({ viewport: { width, height }, colorScheme: scheme });
  await page.goto("file:///" + htmlPath.replace(/\\/g, "/"));
  await page.screenshot({ path: outPath });
  await page.close();
  unlinkSync(htmlPath);
}

async function main() {
  const doc = parseYaml(readFileSync(rp("README.yml"), "utf8"));
  const cfg = doc.Config;

  const templatesDir = rp(cfg.ImageTemplatesDir);
  const tplDir = path.join(templatesDir, "images");
  const sharedStyles = readFileSync(path.join(tplDir, "shared.css"), "utf8");
  const drinksDir = rp(cfg.DrinksPresetDir);
  const galleryDir = rp("assets/AA_Gallery");
  mkdirSync(galleryDir, { recursive: true });

  const template = readFileSync(path.join(tplDir, "aa-card.svg.tpl"), "utf8");
  const drinkFiles = readdirSync(drinksDir).filter((f) => f.endsWith(".txt"));

  const tmpDir = rp("assets/AA_Gallery/.tmp");
  mkdirSync(tmpDir, { recursive: true });

  const browser = await chromium.launch();
  const entries = [];
  try {
    for (const file of drinkFiles) {
      const id = file.replace(/\.txt$/, "");
      const drink = parseDrinkFile(readFileSync(path.join(drinksDir, file), "utf8"));
      const { aa, drinkColorDark, drinkAccentDark, drinkColorLight, drinkAccentLight } = renderDrink(drink);
      const vars = {
        sharedStyles,
        titlebar: renderTitlebar(id),
        promptbar: renderPromptbar(id),
        aa,
        drinkColorDark,
        drinkAccentDark,
        drinkColorLight,
        drinkAccentLight,
      };

      // Pass 1: render at a generous probe size and measure the card's real
      // shrink-to-fit box (no character-width guessing).
      const probeSvg = render(template, { ...vars, width: String(PROBE_SIZE), height: String(PROBE_SIZE) });
      const { width, height } = await measureTermSize(browser, probeSvg);

      // Pass 2: render for real at that exact size.
      const svg = render(template, { ...vars, width: String(width), height: String(height) });
      const svgPath = path.join(tmpDir, `${id}.svg`);
      writeFileSync(svgPath, svg, "utf8");

      // Stale versioned PNGs for this id (old AA-version), cleaned up before
      // writing the current ones.
      for (const existing of readdirSync(galleryDir)) {
        if (existing.startsWith(`${id}-`) && existing.endsWith(".png") && !existing.endsWith(`-${drink.aaVersion}.png`)) {
          unlinkSync(path.join(galleryDir, existing));
        }
      }

      const names = {};
      for (const scheme of ["light", "dark"]) {
        const fileName = `${id}-${scheme}-${drink.aaVersion}.png`;
        names[scheme] = fileName;
        await screenshot(browser, svgPath, width, height, scheme, path.join(galleryDir, fileName));
        console.log(`compiled drink "${id}" (${scheme}) -> assets/AA_Gallery/${fileName}`);
      }
      entries.push({ id, caption: drink.caption, light: names.light, dark: names.dark });
    }
  } finally {
    await browser.close();
    rmSync(tmpDir, { recursive: true, force: true });
  }

  const rows = entries
    .map(
      ({ id, caption, light, dark }) => `### ${id}

${caption}

<table>
<tr><th>Light</th><th>Dark</th></tr>
<tr>
<td><img src="./${light}" alt="${id} ASCII art (light)" /></td>
<td><img src="./${dark}" alt="${id} ASCII art (dark)" /></td>
</tr>
</table>
`,
    )
    .join("\n");

  const readme = `# AA Gallery

A collection of every ASCII-art drink used by the \`now\` panel (see \`assets/AA/*.txt\`). Each one renders theme-aware in the profile README — this page just shows them all together. Regenerate with \`node tools/build-aa-gallery.mjs\` (or \`npm run build\`, which runs it after \`build-readme.mjs\`).

${rows}`;

  writeFileSync(path.join(galleryDir, "README.md"), readme, "utf8");
  console.log("assembled assets/AA_Gallery/README.md");
}

main();
