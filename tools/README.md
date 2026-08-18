# tools

Build scripts that turn `README.yml` + `assets/AA/*.txt` into the actual
generated files (`README.md`, `assets/images/*.svg`,
`assets/AA_Gallery/*.png`). Nothing under `assets/images/` or
`assets/AA_Gallery/` should be hand-edited — re-run the build instead.

```
npm run build           # build-readme.mjs, then build-aa-gallery.mjs
npm run build:preview   # same, but README.md's version/hash header doesn't change
node tools/build-readme.mjs [--preview]
node tools/build-aa-gallery.mjs
```

Requires Playwright's Chromium (`node_modules` from `npm install`) —
`build-aa-gallery.mjs` screenshots real rendered pages, it doesn't rasterize
SVG directly.

## build-readme.mjs

Reads `README.yml`, renders every entry in `Panels` through the matching
template under `assets/templates/images/`, writes each result to
`Config.OutputImagesDir` as `<id>-<version>.svg`, and assembles
`Config.OutputMDFile` from the results in panel order.

Panel `type` dispatch:

| type | template | notes |
|------|----------|-------|
| `aboutme` | `aboutme.svg.tpl` | avatar (base64-encoded from `panel.profileImage` at build time) + 9 fixed info rows. Height is normally the proven 500px baseline, but grows if a row's estimated text width says it will wrap. |
| `badge` | `badge.svg.tpl` | icon (from `assets/templates/icons/<panel.icon>.svg`) + handle/url + external-link corner. Fixed 880×130 — row count never varies. |
| `now` | `now.svg.tpl` | Interests/Building columns + the active drink's AA (from `assets/AA/<panel.drink>.txt`, via `lib/drink.mjs`). Height is computed from column item counts and AA line count — this is the one card whose content shape genuinely varies. |
| `md` | — | `panel.value` inserted as raw markdown at that position (breaks out of the centered image `<div>`). |
| `mdfile` | — | contents of `panel.path` inserted verbatim. |

Image filenames are versioned (`<id>-<README.yml version>.svg`), not just
commented, so GitHub's camo proxy can't serve a stale cache for an
unchanged URL. Old versions for the same id are deleted on each build.

`--preview`: renders normally, but keeps whatever version/config-hash
comment line is already in `README.md` instead of writing a fresh one —
useful for iterating on a panel without bumping the public cache-busting
marker every trial run.

The `<!-- version: X (config-hash: Y) -->` comment is what actually forces
GitHub to re-render `README.md`'s embedded images (a body-only edit isn't
guaranteed to bust caches). `version` comes from `README.yml`; the hash is
`sha256(README.yml text)`, so *any* change to the file changes it even if
you forget to bump `version` by hand.

## build-aa-gallery.mjs

Crawls every `assets/AA/*.txt` drink file, renders each through
`aa-card.svg.tpl`, and screenshots it (light + dark, via a real Chromium
page — not a raw SVG rasterizer, so fonts/CSS match what GitHub actually
shows) into `assets/AA_Gallery/<id>-<light|dark>-<AA-version>.png`. Also
rewrites `assets/AA_Gallery/README.md` with a grid of the results.

Unlike the main build, filenames are versioned per-drink from that drink
file's own `AA-version:` field, not `README.yml`'s version — editing one
drink doesn't churn every other drink's gallery image.

Card size (`width`/`height`) is estimated from the AA's longest visible
line and the caption length, since drinks vary a lot in art size (see
`lib/drink.mjs`'s `visibleLength` — it accounts for `{...}`/`\{`/`\}`/`\\`
markup not being 1:1 with rendered width).

## lib/

| file | purpose |
|------|---------|
| `yaml.mjs` | Parser for the `README.yml` subset (nested maps, block lists of maps — including this repo's `- id:` shorthand where the first key has no value and names the item — and inline flow arrays `[a, b, c]`). Not spec-compliant YAML; don't feed it anything fancier. |
| `template.mjs` | `render(template, vars)` — single-pass `{{key}}` substitution, throws on an unknown placeholder. `escapeXhtml(s)` — `&`/`<`/`>` escaping for XHTML text content. |
| `panel.mjs` | Cross-template building blocks: `renderTitlebar(title)` / `renderPromptbar(command)` (the exact markup every card's header/prompt line uses — never hand-write this markup in a template), plus `estimateTextWidth`/`estimateWrappedLines` for the dynamic-sizing heuristics in `build-readme.mjs`/`build-aa-gallery.mjs`. |
| `drink.mjs` | Parses `assets/AA/*.txt` (format documented in `assets/AA/AA.txt.tpl`) and renders a drink's AA + caption into the XHTML fragment + light/dark CSS custom-property values every drink-displaying template needs. Also implements the `{...}` accent-highlight / `\{` `\}` literal-brace / `\\` literal-backslash escaping. |

See `assets/templates/README.md` for the template side of this pipeline
(placeholder conventions, how to add a new panel template).
