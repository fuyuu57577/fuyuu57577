// Shared building blocks for every card template, so a style/markup fix
// only needs to happen once. assets/templates/images/shared.css holds the
// CSS (injected as {{sharedStyles}}); this module holds the matching markup
// (titlebar/promptbar) and the text-width estimation used for dynamic
// sizing, so templates can't drift from each other silently.

import { escapeXhtml } from "./template.mjs";

export function renderTitlebar(title) {
  return [
    `<xhtml:div class="titlebar">`,
    `  <xhtml:div class="dot r"></xhtml:div>`,
    `  <xhtml:div class="dot y"></xhtml:div>`,
    `  <xhtml:div class="dot g"></xhtml:div>`,
    `  <xhtml:div class="titletext">fuyuu57577@github — ${escapeXhtml(title)}</xhtml:div>`,
    `</xhtml:div>`,
  ].join("\n      ");
}

export function renderPromptbar(command) {
  return [
    `<xhtml:div class="promptbar">`,
    `  <xhtml:div class="prompt"><xhtml:span class="p-user">fuyuu57577</xhtml:span><xhtml:span class="p-sym">@</xhtml:span><xhtml:span class="p-cmd">github</xhtml:span> <xhtml:span class="p-sym">$</xhtml:span> <xhtml:span class="p-cmd">${escapeXhtml(command)}</xhtml:span></xhtml:div>`,
    `</xhtml:div>`,
  ].join("\n      ");
}

// Rough monospace/proportional character-width ratios (of font-size), used
// only to size a card generously enough that content never clips — not for
// pixel-perfect layout.
export const MONO_CHAR_WIDTH = 0.63;
export const PROPORTIONAL_CHAR_WIDTH = 0.55;

export function estimateTextWidth(text, fontSizePx, charWidthRatio = MONO_CHAR_WIDTH) {
  return Math.ceil([...text].length * fontSizePx * charWidthRatio);
}

// How many wrapped lines `text` needs inside `availableWidthPx` at
// `fontSizePx` — used to size containers whose row count is fixed but whose
// row height isn't (e.g. a long comma-joined list wrapping to 2 lines).
export function estimateWrappedLines(text, fontSizePx, availableWidthPx, charWidthRatio = MONO_CHAR_WIDTH) {
  const width = estimateTextWidth(text, fontSizePx, charWidthRatio);
  return Math.max(1, Math.ceil(width / availableWidthPx));
}
