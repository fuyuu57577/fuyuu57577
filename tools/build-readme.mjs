#!/usr/bin/env node
// Single entrypoint: renders every panel in README.yml into
// Config.OutputImagesDir and assembles Config.OutputMDFile.
//
// Usage: node tools/build-readme.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseYaml, idAndRest } from "./lib/yaml.mjs";
import { render, escapeXhtml } from "./lib/template.mjs";
import { parseDrinkFile, renderDrink } from "./lib/drink.mjs";

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

// ---------- panel renderers: each returns { svg } ----------

function renderAboutmePanel(panel, templatesDir) {
  const template = readFileSync(path.join(templatesDir, "aboutme.svg.tpl"), "utf8");
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

  return { svg: render(template, { avatar: `data:image/jpeg;base64,${avatarB64}`, rows }) };
}

function renderBadgePanel(panel, templatesDir) {
  const template = readFileSync(path.join(templatesDir, "badge.svg.tpl"), "utf8");
  const icon = readFileSync(path.join(templatesDir, "icons", `${panel.icon}.svg`), "utf8").trim();
  return { svg: render(template, { command: panel.command, handle: panel.handle, url: panel.url, icon }) };
}

// Content-driven height for now.svg.tpl (width stays fixed at 880 to align
// with the other panels). Drinks vary a lot in line count, so a fixed
// height clips longer art/captions — compute it from what's actually there.
function heightForNow(maxColumnItems, artLineCount) {
  const PROMPTBAR = 14 /* padding-top */ + 15 /* prompt line */;
  const BODY_PADDING = 12 + 22;
  const BODY_GAPS = 20 * 2; // columns<->divider, divider<->coffee-row
  const COLUMNS = 14 * 1.2 + 8 /* col-title + margin */ + maxColumnItems * (14 * 1.9);
  const DIVIDER = 1;
  const COFFEE_ROW =
    14 * 1.2 /* title */ + 10 /* gap */ + artLineCount * (13 * 1.28) /* aa */ + 10 /* gap */ + 14 * 1.2; /* caption */
  const BUFFER = 16; // default line-height approximations vary slightly by font
  return Math.ceil(PROMPTBAR + BODY_PADDING + BODY_GAPS + COLUMNS + DIVIDER + COFFEE_ROW + BUFFER);
}

function renderNowPanel(panel, templatesDir, drinksDir) {
  const template = readFileSync(path.join(templatesDir, "now.svg.tpl"), "utf8");

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
  const { aa, drinkStyle } = renderDrink(drink);

  const maxColumnItems = Math.max(panel.interests.length, panel.building.length);
  const height = heightForNow(maxColumnItems, drink.artLines.length);

  return { svg: render(template, { height: String(height), columns, aa, drinkStyle }) };
}

// ---------- main ----------

function main() {
  const yamlText = readFileSync(rp("README.yml"), "utf8");
  const doc = parseYaml(yamlText);
  const cfg = doc.Config;
  if (!doc.version) throw new Error("README.yml is missing a top-level `version:` field");

  const templatesDir = rp(cfg.ImageTemplatesDir);
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

  for (const item of doc.Panels) {
    const { id, panel } = idAndRest(item);

    if (panel.type === "aboutme" || panel.type === "badge" || panel.type === "now") {
      const renderer = { aboutme: renderAboutmePanel, badge: renderBadgePanel, now: renderNowPanel };
      const { svg } =
        panel.type === "now"
          ? renderNowPanel(panel, templatesDir, drinksDir)
          : renderer[panel.type](panel, templatesDir);

      // Version the filename itself (not just a comment) so the <img> src
      // actually changes and GitHub's camo proxy can't serve a stale cache.
      const fileName = `${id}-${doc.version}.svg`;
      for (const stale of readdirSync(imagesDir)) {
        if (stale.startsWith(`${id}-`) && stale.endsWith(".svg") && stale !== fileName) {
          unlinkSync(path.join(imagesDir, stale));
        }
      }
      writeFileSync(path.join(imagesDir, fileName), svg, "utf8");
      const relSrc = "./" + path.posix.join(cfg.OutputImagesDir.replace(/^\.\//, ""), fileName);
      const alt = `fuyuu57577 ${id} panel`;

      const imgTag = `<img src="${relSrc}" alt="${escapeXhtml(alt)}" width="880" />`;
      const anchored =
        panel.type === "badge"
          ? `<a href="${panel.href}">${imgTag}</a>`
          : `<a id="card-${id}" href="#card-${id}">${imgTag}</a>`;
      pendingImages.push(anchored);
      console.log(`compiled panel "${id}" (${panel.type}) -> ${relSrc}`);
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
