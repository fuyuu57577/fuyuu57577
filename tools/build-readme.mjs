#!/usr/bin/env node
// Single entrypoint: renders every panel in README.yml into
// Config.OutputImagesDir and assembles Config.OutputMDFile.
//
// Usage: node tools/build-readme.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { parseYaml, idAndRest } from "./lib/yaml.mjs";
import { render, escapeXhtml } from "./lib/template.mjs";

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

function escapeAaInline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Windows/JP-locale Chromium renders literal U+005C as ¥ even with
    // lang="en" on an <img>-embedded SVG — mirror a slash instead.
    .replace(/\\/g, '<xhtml:span class="mirror">/</xhtml:span>');
}

const BRACE_OPEN = "";
const BRACE_CLOSE = "";

// \{ and \} are literal braces (protected from accent-wrap detection below).
function protectEscapedBraces(line) {
  return line.replace(/\\\{/g, BRACE_OPEN).replace(/\\\}/g, BRACE_CLOSE);
}
function restoreEscapedBraces(text) {
  return text.replaceAll(BRACE_OPEN, "{").replaceAll(BRACE_CLOSE, "}");
}

// {...} spans anywhere in the line (not just the whole line) get wrapped in
// an accent-colored <span>; any number per line, no nesting.
function escapeAaLine(rawLine) {
  const line = protectEscapedBraces(rawLine);
  const spanRe = /\{([^{}]*)\}/g;
  let out = "";
  let lastIndex = 0;
  let m;
  while ((m = spanRe.exec(line))) {
    out += escapeAaInline(line.slice(lastIndex, m.index));
    out += `<xhtml:span class="accent">${escapeAaInline(m[1])}</xhtml:span>`;
    lastIndex = spanRe.lastIndex;
  }
  out += escapeAaInline(line.slice(lastIndex));
  return restoreEscapedBraces(out);
}

// Format (see assets/AA/AA.txt.tpl):
//   caption: <text>
//   color: <hex>
//   accent: <hex>
//   AA:
//   <art lines, rendered verbatim; {...} = accent highlight, \{ \} = literal>
//
//   Sketch:
//   <ignored — scratch space for drafts>
function parseDrinkFile(text) {
  const lines = text.split(/\r?\n/);

  const field = (name) => {
    const line = lines.find((l) => l.startsWith(`${name}:`));
    if (!line) throw new Error(`drink file is missing a \`${name}:\` line`);
    return line.slice(name.length + 1).trim();
  };
  const caption = field("caption");
  const color = field("color");
  const accent = field("accent");

  const aaIdx = lines.findIndex((l) => l.trim() === "AA:");
  if (aaIdx === -1) throw new Error("drink file is missing an `AA:` line");
  let artStart = aaIdx + 1;
  let artEnd = lines.findIndex((l, i) => i > aaIdx && l.trim() === "Sketch:");
  if (artEnd === -1) artEnd = lines.length;
  while (artEnd > artStart && lines[artEnd - 1].trim() === "") artEnd--;

  return { caption, color, accent, artLines: lines.slice(artStart, artEnd) };
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

  const { caption, color, accent, artLines } = parseDrinkFile(
    readFileSync(path.join(drinksDir, `${panel.drink}.txt`), "utf8"),
  );
  const aaBody = artLines.map(escapeAaLine).join("\n");
  const aa = [
    `<xhtml:pre class="aa">${aaBody}</xhtml:pre>`,
    `          <xhtml:div class="caption">${escapeXhtml(caption)}</xhtml:div>`,
  ].join("\n          ");
  const drinkStyle = `--drink: ${color}; --drink-accent: ${accent};`;

  return { svg: render(template, { columns, aa, drinkStyle }) };
}

// ---------- main ----------

function main() {
  const yamlText = readFileSync(rp("README.yml"), "utf8");
  const doc = parseYaml(yamlText);
  const cfg = doc.Config;

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

      const fileName = `${id}.svg`;
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

  if (!doc.version) throw new Error("README.yml is missing a top-level `version:` field");
  const hash = createHash("sha256").update(yamlText).digest("hex").slice(0, 12);
  const md = [
    `<!-- generated by tools/build-readme.mjs from README.yml — do not edit by hand -->`,
    `<!-- version: ${doc.version} (config-hash: ${hash}) -->`,
    ``,
    bodyParts.join("\n\n"),
    ``,
    FOOTER,
  ].join("\n");

  writeFileSync(rp(cfg.OutputMDFile), md, "utf8");
  console.log(`assembled ${cfg.OutputMDFile}`);
}

main();
