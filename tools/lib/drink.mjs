// Shared parsing/rendering for assets/AA/*.txt drink files.
// Format (see assets/AA/AA.txt.tpl):
//   AA-version: <version>
//   caption: <text>
//   color: <hex>              dark-mode drink color
//   accent: <hex>              dark-mode accent color
//   light-color: <hex>        light-mode drink color
//   light-accent: <hex>       light-mode accent color
//   AA:
//   <art lines, rendered verbatim; {...} = accent highlight, \{ \} = literal
//    brace, \\ = a single literal backslash (regex-style escaping — a lone,
//    unescaped \ is undefined behavior)>
//
//   Sketch:
//   <ignored — scratch space for drafts>

import { escapeXhtml } from "./template.mjs";

// Windows/JP-locale Chromium renders literal U+005C as ¥ even with lang="en"
// on an <img>-embedded SVG — this mirrored slash is what \\ renders as.
const MIRROR_BACKSLASH = '<xhtml:span class="mirror">/</xhtml:span>';

function escapeAaInline(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// \\, \{, \} inside a plain-text run (used both outside and inside accent
// spans — braces don't nest, but escapes still apply in either place).
const ESCAPE_RE = /\\\\|\\\{|\\\}/g;
function escapeAaSegment(text) {
  let out = "";
  let lastIndex = 0;
  let m;
  while ((m = ESCAPE_RE.exec(text))) {
    out += escapeAaInline(text.slice(lastIndex, m.index));
    out += m[0] === "\\\\" ? MIRROR_BACKSLASH : m[0] === "\\{" ? "{" : "}";
    lastIndex = ESCAPE_RE.lastIndex;
  }
  out += escapeAaInline(text.slice(lastIndex));
  return out;
}

// {...} spans anywhere in the line (not just the whole line) get wrapped in
// an accent-colored <span>; any number per line, no nesting.
function escapeAaLine(rawLine) {
  const tokenRe = /\\\\|\\\{|\\\}|\{([^{}]*)\}/g;
  let out = "";
  let lastIndex = 0;
  let m;
  while ((m = tokenRe.exec(rawLine))) {
    out += escapeAaSegment(rawLine.slice(lastIndex, m.index));
    if (m[0] === "\\\\") {
      out += MIRROR_BACKSLASH;
    } else if (m[0] === "\\{") {
      out += "{";
    } else if (m[0] === "\\}") {
      out += "}";
    } else {
      out += `<xhtml:span class="accent">${escapeAaSegment(m[1])}</xhtml:span>`;
    }
    lastIndex = tokenRe.lastIndex;
  }
  out += escapeAaSegment(rawLine.slice(lastIndex));
  return out;
}

function visibleSegmentLength(text) {
  let len = 0;
  let lastIndex = 0;
  let m;
  const re = /\\\\|\\\{|\\\}/g;
  while ((m = re.exec(text))) {
    len += m.index - lastIndex + 1;
    lastIndex = re.lastIndex;
  }
  return len + (text.length - lastIndex);
}

// Visible character count for a raw art line (ignores {}/\{/\}/\\ markup,
// which render as 0 or 1 chars respectively) — used to size gallery cards.
export function visibleLength(rawLine) {
  const tokenRe = /\\\\|\\\{|\\\}|\{([^{}]*)\}/g;
  let len = 0;
  let lastIndex = 0;
  let m;
  while ((m = tokenRe.exec(rawLine))) {
    len += visibleSegmentLength(rawLine.slice(lastIndex, m.index));
    len += m[0] === "\\\\" || m[0] === "\\{" || m[0] === "\\}" ? 1 : visibleSegmentLength(m[1]);
    lastIndex = tokenRe.lastIndex;
  }
  len += visibleSegmentLength(rawLine.slice(lastIndex));
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
  const lightColor = field("light-color");
  const lightAccent = field("light-accent");

  const aaIdx = lines.findIndex((l) => l.trim() === "AA:");
  if (aaIdx === -1) throw new Error("drink file is missing an `AA:` line");
  let artStart = aaIdx + 1;
  let artEnd = lines.findIndex((l, i) => i > aaIdx && l.trim() === "Sketch:");
  if (artEnd === -1) artEnd = lines.length;
  while (artEnd > artStart && lines[artEnd - 1].trim() === "") artEnd--;

  return {
    aaVersion,
    caption,
    color,
    accent,
    lightColor,
    lightAccent,
    artLines: lines.slice(artStart, artEnd),
  };
}

// Renders a parsed drink into the XHTML fragment + light/dark CSS
// custom-property values shared by every template that displays a drink
// (now.svg.tpl, the AA gallery cards).
export function renderDrink({ caption, color, accent, lightColor, lightAccent, artLines }) {
  const aaBody = artLines.map(escapeAaLine).join("\n");
  const aa = [
    `<xhtml:pre class="aa">${aaBody}</xhtml:pre>`,
    `<xhtml:div class="caption">${escapeXhtml(caption)}</xhtml:div>`,
  ].join("\n");
  return {
    aa,
    drinkColorDark: color,
    drinkAccentDark: accent,
    drinkColorLight: lightColor,
    drinkAccentLight: lightAccent,
  };
}
