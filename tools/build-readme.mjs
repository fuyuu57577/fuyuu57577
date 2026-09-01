#!/usr/bin/env node
// Single entrypoint: renders every panel in README.yml into
// Config.OutputImagesDir and assembles Config.OutputMDFile.
//
// Usage: node tools/build-readme.mjs [--preview]

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { parseYaml, idAndRest } from "./lib/yaml.mjs";
import { render, escapeXhtml } from "./lib/template.mjs";
import { parseDrinkFile, renderDrink } from "./lib/drink.mjs";
import { renderTitlebar, renderPromptbar } from "./lib/panel.mjs";
import { measureTermSize, PROBE_SIZE } from "./lib/measure.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rp = (...p) => path.join(root, ...p);

const FOOTER = `<!--
**fuyuu57577/fuyuu57577** is a ✨ _special_ ✨ repository because its \`README.md\` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
`;

// ---------- panel renderers: each returns { svg, mobileSvg } ----------

// aboutme/now/badge render twice: once at DESKTOP_WIDTH (aligns with the
// other panels in the README grid) and once at MOBILE_WIDTH with a stacked
// layout (`.term.mobile` overrides in the template's own CSS — see
// assets/templates/README.md). The two files are swapped via a <picture>
// element at MOBILE_BREAKPOINT, so no in-SVG media query is needed. Height
// always depends on content and is measured per-variant, since the stacked
// mobile layout is a different height than desktop.
const DESKTOP_WIDTH = 880;
const MOBILE_WIDTH = 400;
const MOBILE_BREAKPOINT = 600;

async function renderWithMeasuredHeight(browser, template, vars, width) {
  const probeSvg = render(template, { ...vars, width: String(width), height: String(PROBE_SIZE) });
  const { height } = await measureTermSize(browser, probeSvg, { freeWidth: false });
  return render(template, { ...vars, width: String(width), height: String(height) });
}

async function renderAboutmePanel(browser, panel, tplDir, sharedStyles) {
  const template = readFileSync(path.join(tplDir, "aboutme.svg.tpl"), "utf8");
  const avatarB64 = readFileSync(rp(panel.profileImage)).toString("base64");

  const row = (label, valueHtml) =>
    `          <xhtml:div class="row"><xhtml:div class="label">${escapeXhtml(label)}</xhtml:div><xhtml:div class="value">${valueHtml}</xhtml:div></xhtml:div>`;

  const certsHtml = panel.certs
    .map((c) => `${escapeXhtml(c.name)} <xhtml:b>${escapeXhtml(c.date)}</xhtml:b>`)
    .join(", ");

  const rows = [
    row("Nickname", escapeXhtml(panel.nickname)),
    row("Univ", escapeXhtml(panel.univ)),
    row("Mission", escapeXhtml(panel.mission)),
    row("Languages", escapeXhtml(panel.languages.join(", "))),
    row("Frameworks", escapeXhtml(panel.frameworks.join(", "))),
    row("Tools", escapeXhtml(panel.tools.join(", "))),
    row("Certs", certsHtml),
    row("Socials", escapeXhtml(panel.socials.join(", "))),
    row("Contact", escapeXhtml(panel.contact)),
  ].join("\n");

  const baseVars = {
    sharedStyles,
    titlebar: renderTitlebar("aboutme"),
    promptbar: renderPromptbar("aboutme"),
    avatar: `data:image/jpeg;base64,${avatarB64}`,
    rows,
  };
  const svg = await renderWithMeasuredHeight(browser, template, { ...baseVars, termClass: "term" }, DESKTOP_WIDTH);
  const mobileSvg = await renderWithMeasuredHeight(browser, template, { ...baseVars, termClass: "term mobile" }, MOBILE_WIDTH);
  return { svg, mobileSvg };
}

function renderBadgePanel(panel, tplDir, sharedStyles) {
  const template = readFileSync(path.join(tplDir, "badge.svg.tpl"), "utf8");
  const icon = readFileSync(path.join(tplDir, "..", "icons", `${panel.icon}.svg`), "utf8").trim();
  const baseVars = {
    sharedStyles,
    promptbar: renderPromptbar(panel.command),
    handle: panel.handle,
    url: panel.url,
    icon,
    height: "130",
  };
  const svg = render(template, { ...baseVars, termClass: "term", width: String(DESKTOP_WIDTH) });
  const mobileSvg = render(template, { ...baseVars, termClass: "term mobile", width: String(MOBILE_WIDTH) });
  return { svg, mobileSvg };
}

async function renderNowPanel(browser, panel, tplDir, drinksDir, sharedStyles) {
  const template = readFileSync(path.join(tplDir, "now.svg.tpl"), "utf8");

  const column = (title, items) => {
    const lis = items
      .map((item) => `              <xhtml:li><xhtml:span class="bullet">-</xhtml:span><xhtml:b>${escapeXhtml(item)}</xhtml:b></xhtml:li>`)
      .join("\n");
    return [
      `          <xhtml:div class="col">`,
      `            <xhtml:p class="col-title">${escapeXhtml(title)}</xhtml:p>`,
      `            <xhtml:ul>`,
      lis,
      `            </xhtml:ul>`,
      `          </xhtml:div>`,
    ].join("\n");
  };
  const columns = [column("Interests", panel.interests), column("Building", panel.building)].join("\n");

  const drink = parseDrinkFile(readFileSync(path.join(drinksDir, `${panel.drink}.txt`), "utf8"));
  const { aa, drinkColorDark, drinkAccentDark, drinkColorLight, drinkAccentLight } = renderDrink(drink);

  const baseVars = {
    sharedStyles,
    promptbar: renderPromptbar("now"),
    columns,
    aa,
    drinkColorDark,
    drinkAccentDark,
    drinkColorLight,
    drinkAccentLight,
    copyright: escapeXhtml(drink.copyright),
    drinkName: escapeXhtml(panel.drink),
  };
  const svg = await renderWithMeasuredHeight(browser, template, { ...baseVars, termClass: "term" }, DESKTOP_WIDTH);
  const mobileSvg = await renderWithMeasuredHeight(browser, template, { ...baseVars, termClass: "term mobile" }, MOBILE_WIDTH);
  return { svg, mobileSvg };
}

// ---------- main ----------

async function main() {
  const yamlText = readFileSync(rp("README.yml"), "utf8");
  const doc = parseYaml(yamlText);
  const cfg = doc.Config;
  if (!doc.version) throw new Error("README.yml is missing a top-level `version:` field");

  const templatesDir = rp(cfg.ImageTemplatesDir);
  const tplDir = path.join(templatesDir, "images");
  const sharedStyles = readFileSync(path.join(tplDir, "shared.css"), "utf8");
  const drinksDir = rp(cfg.DrinksPresetDir);
  const imagesDir = rp(cfg.OutputImagesDir);
  mkdirSync(imagesDir, { recursive: true });

  const bodyParts = [];
  let pendingImages = [];

  const flushImages = () => {
    if (pendingImages.length === 0) return;
    bodyParts.push(`<div align="center">\n\n${pendingImages.join("\n")}\n\n</div>`);
    pendingImages = [];
  };

  const browser = await chromium.launch();
  try {
    for (const item of doc.Panels) {
      const { id, panel } = idAndRest(item);

      if (panel.type === "aboutme" || panel.type === "badge" || panel.type === "now") {
        const { svg, mobileSvg } =
          panel.type === "aboutme"
            ? await renderAboutmePanel(browser, panel, tplDir, sharedStyles)
            : panel.type === "badge"
              ? renderBadgePanel(panel, tplDir, sharedStyles)
              : await renderNowPanel(browser, panel, tplDir, drinksDir, sharedStyles);

        // Version the filenames themselves (not just a comment) so the
        // <img>/<source> src actually changes and GitHub's camo proxy can't
        // serve a stale cache. Two files per panel: a desktop layout and a
        // narrower, stacked mobile layout, swapped via <picture> below.
        const fileName = `${id}-${doc.version}.svg`;
        const mobileFileName = `${id}-mobile-${doc.version}.svg`;
        for (const stale of readdirSync(imagesDir)) {
          if (stale.startsWith(`${id}-`) && stale.endsWith(".svg") && stale !== fileName && stale !== mobileFileName) {
            unlinkSync(path.join(imagesDir, stale));
          }
        }
        writeFileSync(path.join(imagesDir, fileName), svg, "utf8");
        writeFileSync(path.join(imagesDir, mobileFileName), mobileSvg, "utf8");
        const relSrc = "./" + path.posix.join(cfg.OutputImagesDir.replace(/^\.\//, ""), fileName);
        const relMobileSrc = "./" + path.posix.join(cfg.OutputImagesDir.replace(/^\.\//, ""), mobileFileName);
        const alt = `fuyuu57577 ${id} panel`;

        // No width attribute: each variant's own intrinsic SVG width (plus
        // GitHub's `max-width: 100%` on markdown images) is what sizes it —
        // forcing width="880" here would stretch the narrower mobile source
        // back up to desktop size and defeat the whole swap.
        const imgTag = [
          `<picture>`,
          `  <source media="(max-width: ${MOBILE_BREAKPOINT}px)" srcset="${relMobileSrc}">`,
          `  <img src="${relSrc}" alt="${escapeXhtml(alt)}" />`,
          `</picture>`,
        ].join("\n");
        const anchored =
          panel.type === "badge"
            ? `<a href="${panel.href}">${imgTag}</a>`
            : `<a id="card-${id}" href="#card-${id}">${imgTag}</a>`;
        pendingImages.push(anchored);
        console.log(`compiled panel "${id}" (${panel.type}) -> ${relSrc} (+ mobile variant)`);
      } else if (panel.type === "md") {
        flushImages();
        bodyParts.push(panel.value);
      } else if (panel.type === "mdfile") {
        flushImages();
        bodyParts.push(readFileSync(rp(panel.path), "utf8").trimEnd());
      } else {
        throw new Error(`panel "${id}" has unknown type "${panel.type}"`);
      }
    }
  } finally {
    await browser.close();
  }
  flushImages();

  // --preview: rebuild images and body as usual, but keep the previous
  // version/hash header line so trial edits don't bump the public
  // cache-busting marker until you're happy with them.
  const preview = process.argv.includes("--preview");
  let headerLine = `<!-- version: ${doc.version} (config-hash: ${createHash("sha256").update(yamlText).digest("hex").slice(0, 12)}) -->`;
  if (preview) {
    try {
      const existing = readFileSync(rp(cfg.OutputMDFile), "utf8");
      const m = existing.match(/^<!-- version: .+ \(config-hash: [0-9a-f]+\) -->$/m);
      if (m) headerLine = m[0];
    } catch {
      // no existing README.md yet — fall back to the freshly computed header.
    }
  }

  const md = [
    `<!-- generated by tools/build-readme.mjs from README.yml — do not edit by hand -->`,
    headerLine,
    ``,
    bodyParts.join("\n\n"),
    ``,
    FOOTER,
  ].join("\n");

  writeFileSync(rp(cfg.OutputMDFile), md, "utf8");
  console.log(`assembled ${cfg.OutputMDFile}${preview ? " (preview: header kept unchanged)" : ""}`);
}

main();
