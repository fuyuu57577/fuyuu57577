<!--
  Reference only — not read by any build script. Copy this skeleton when
  adding a new panel template under assets/templates/images/, so it starts
  out sharing the same structure (and doesn't drift from it later).

  - {{sharedStyles}} pulls in shared.css (tokens, .term base, .titlebar,
    .promptbar — see that file, it's the one the build scripts actually
    read). Put it first in <style> so your own rules can override it.
  - {{titlebar}} / {{promptbar}} are rendered by tools/lib/panel.mjs
    (renderTitlebar/renderPromptbar) — don't hand-write that markup here.
  - {{width}} / {{height}} should be placeholders whenever the panel's
    content can vary in size (line/item count, text length). Only hardcode
    a dimension when the content shape is truly fixed (see build-readme.mjs
    for how aboutme.svg.tpl still grows past its baseline height).

  Common .body patterns to reuse instead of inventing new ones — none of
  these are in shared.css because not every panel needs them:

    label/value info rows (aboutme.svg.tpl):
      .row { display: flex; }
      .label { flex: 0 0 128px; color: var(--accent); font-weight: 700; }
      .value { color: var(--text); }
      .value b { color: var(--accent2); font-weight: 700; }

    two-column bullet lists (now.svg.tpl):
      .columns { display: flex; width: 100%; gap: 60px; }
      .col { flex: 1 1 0; min-width: 0; }
      .col-title { font-size: 14px; color: var(--accent); font-weight: 700; margin: 0 0 8px 0; }
      .col ul { list-style: none; margin: 0; padding: 0; font-size: 14px; line-height: 1.9; }

    icon + handle/url badge (badge.svg.tpl):
      .icon { flex: 0 0 auto; width: 44px; height: 44px; color: var(--text); }
      .handle { font-size: 19px; font-weight: 700; }
      .url { font-size: 12px; color: var(--accent); margin-top: 3px; }
      bottom-right "opens externally" corner icon (requires .term { position: relative; }):
      .goto { position: absolute; right: 16px; bottom: 12px; width: 20px; height: 20px; color: var(--muted); opacity: 0.75; }
      .goto path, .goto polyline, .goto line { stroke: currentColor; }

  ASCII art with a literal backslash-look character: never type U+005C — it
  renders as ¥ on this Windows/JP-locale Chromium even with lang="en" on an
  <img>-embedded SVG. Mirror a forward slash instead:
      .mirror { display: inline-block; transform: scaleX(-1); }
      <xhtml:span class="mirror">/</xhtml:span>
-->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" viewBox="0 0 {{width}} {{height}}" width="{{width}}" height="{{height}}">
  <style>
    {{sharedStyles}}
    .term { width: {{width}}px; height: {{height}}px; }
    /* panel-specific rules go here */
  </style>
  <foreignObject width="100%" height="100%">
    <xhtml:div class="term">
      {{titlebar}}
      {{promptbar}}
      <xhtml:div class="body">
        <!-- panel-specific content goes here -->
      </xhtml:div>
    </xhtml:div>
  </foreignObject>
</svg>
