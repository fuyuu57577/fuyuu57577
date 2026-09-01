// Shared building blocks for every card template, so a style/markup fix
// only needs to happen once. assets/templates/images/shared.css holds the
// CSS (injected as {{sharedStyles}}); this module holds the matching markup
// (titlebar/promptbar), so templates can't drift from each other silently.
// Dynamic sizing itself is real browser measurement (see lib/measure.mjs),
// not text-width guessing.

import { escapeXhtml } from "./template.mjs";

export function renderTitlebar(title) {
  return [
    `<xhtml:div class="titlebar">`,
    `  <xhtml:div class="dot r"></xhtml:div>`,
    `  <xhtml:div class="dot y"></xhtml:div>`,
    `  <xhtml:div class="dot g"></xhtml:div>`,
    `  <xhtml:div class="titletext">fuyuu575@github — ${escapeXhtml(title)}</xhtml:div>`,
    `</xhtml:div>`,
  ].join("\n      ");
}

export function renderPromptbar(command) {
  return [
    `<xhtml:div class="promptbar">`,
    `  <xhtml:div class="prompt"><xhtml:span class="p-user">fuyuu575</xhtml:span><xhtml:span class="p-sym">@</xhtml:span><xhtml:span class="p-cmd">github</xhtml:span> <xhtml:span class="p-sym">$</xhtml:span> <xhtml:span class="p-cmd">${escapeXhtml(command)}</xhtml:span></xhtml:div>`,
    `</xhtml:div>`,
  ].join("\n      ");
}
