// Shared parsing/rendering for assets/AA/*.txt drink files.
// Format (see assets/AA/AA.txt.tpl):
//   AA-version: <version>
//   caption: <text>
//   color: <hex>
//   accent: <hex>
//   AA:
//   <art lines, rendered verbatim; {...} = accent highlight, \{ \} = literal>
//
//   Sketch:
//   <ignored — scratch space for drafts>

import { escapeXhtml } from "./template.mjs";

function escapeAaInline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Windows/JP-locale Chromium renders literal U+005C as ¥ even with
    // lang="en" on an <img>-embedded SVG — mirror a slash instead.
    .replace(/\\/g, '<xhtml:span class="mirror">/</xhtml:span>');
}

// {...} spans anywhere in the line (not just the whole line) get wrapped in
// an accent-colored <span>; any number per line, no nesting. \{ and \} are
// literal braces. Single-pass tokenizer (no placeholder substitution).
function escapeAaLine(rawLine) {
  const tokenRe = /\\\{|\\\}|\{([^{}]*)\}/g;
  let out = "";
  let lastIndex = 0;
  let m;
  while ((m = tokenRe.exec(rawLine))) {
    out += escapeAaInline(rawLine.slice(lastIndex, m.index));
    if (m[0] === "\\{") {
      out += "{";
    } else if (m[0] === "\\}") {
      out += "}";
    } else {
      out += `<xhtml:span class="accent">${escapeAaInline(m[1])}</xhtml:span>`;
    }
    lastIndex = tokenRe.lastIndex;
  }
  out += escapeAaInline(rawLine.slice(lastIndex));
  return out;
}

// Visible character count for a raw art line (ignores {}/\{/\} markup,
// which render as 0 or 1 chars respectively) — used to size gallery cards.
export function visibleLength(rawLine) {
  const tokenRe = /\\\{|\\\}|\{([^{}]*)\}/g;
  let len = 0;
  let lastIndex = 0;
  let m;
  while ((m = tokenRe.exec(rawLine))) {
    len += m.index - lastIndex;
    len += m[0] === "\\{" || m[0] === "\\}" ? 1 : m[1].length;
    lastIndex = tokenRe.lastIndex;
  }
  len += rawLine.length - lastIndex;
  return len;
}

export function parseDrinkFile(text) {
  const lines = text.split(/\r?\n/);

  const field = (name) => {
    const line = lines.find((l) => l.startsWith(`${name}:`));
    if (!line) throw new Error(`drink file is missing a \`${name}:\` line`);
    return line.slice(name.length + 1).trim();
  };
  const aaVersion = field("AA-version");
  const caption = field("caption");
  const color = field("color");
  const accent = field("accent");

  const aaIdx = lines.findIndex((l) => l.trim() === "AA:");
  if (aaIdx === -1) throw new Error("drink file is missing an `AA:` line");
  let artStart = aaIdx + 1;
  let artEnd = lines.findIndex((l, i) => i > aaIdx && l.trim() === "Sketch:");
  if (artEnd === -1) artEnd = lines.length;
  while (artEnd > artStart && lines[artEnd - 1].trim() === "") artEnd--;

  return { aaVersion, caption, color, accent, artLines: lines.slice(artStart, artEnd) };
}

// Renders a parsed drink into the XHTML fragments + CSS custom-property
// override shared by every template that displays a drink (now.svg.tpl,
// the AA gallery cards).
export function renderDrink({ caption, color, accent, artLines }) {
  const aaBody = artLines.map(escapeAaLine).join("\n");
  const aa = [
    `<xhtml:pre class="aa">${aaBody}</xhtml:pre>`,
    `<xhtml:div class="caption">${escapeXhtml(caption)}</xhtml:div>`,
  ].join("\n");
  const drinkStyle = `--drink: ${color}; --drink-accent: ${accent};`;
  return { aa, drinkStyle };
}
