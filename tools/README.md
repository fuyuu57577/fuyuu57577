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
| `aboutme` | `aboutme.svg.tpl` | avatar (base64-encoded from `panel.profileImage` at build time) + 9 info rows. Width is fixed at 880px (aligns with the grid); height is real browser measurement (`lib/measure.mjs`), so a wrapped row never clips. |
| `badge` | `badge.svg.tpl` | icon (from `assets/templates/icons/<panel.icon>.svg`) + handle/url + external-link corner. Fixed 880×130 — row count never varies. |
| `now` | `now.svg.tpl` | Interests/Building columns + the active drink's AA (from `assets/AA/<panel.drink>.txt`, via `lib/drink.mjs`). Width fixed at 880px; height is measured the same way as `aboutme`. |
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

Each drink file's `Copyright:` field is embedded into the output files
themselves, not just the source `.txt` — an `<metadata>` element in the SVG,
and an `iTXt` chunk (`lib/png-metadata.mjs`) in the PNG — so the notice
survives a file being saved/shared detached from its README/gallery
context. This applies to every image that renders AA art: the gallery cards
here, and the `now` panel in `build-readme.mjs`.

Card size (`width` *and* `height`, unlike `aboutme`/`now`) is real browser
measurement via `lib/measure.mjs` — both dimensions genuinely vary here
(no fixed grid width to align to), so both are freed and measured.

## Dynamic sizing: measure, don't guess

`aboutme`/`now`/`aa-card` all size themselves via `lib/measure.mjs`'s
`measureTermSize()`, not character-width arithmetic:

1. Render the card once with `.term`'s width and/or height set to a large
   probe value (`PROBE_SIZE`).
2. Force `.term { width/height: fit-content !important; overflow: visible !important; }`
   (only for whichever dimension the caller frees — a panel with a grid-
   aligned fixed width only frees height) and load that in a real headless
   Chromium page.
3. Read `.term`'s actual `getBoundingClientRect()` — the true rendered
   size, whatever the font/line-height/padding turn out to be.
4. Re-render the card for real at that exact size.

`width: auto` on a block element fills its container instead of shrink-
wrapping — `fit-content` is what actually measures natural size; this
tripped up an earlier version of this code, worth remembering if you touch
`measureTermSize()`. An earlier version of this file also used to explain
character-width-ratio heuristics for sizing — those are gone; they were a
constant source of magic-number bugs (e.g. underestimating a titlebar's
width against the id text, so the id ran into the dots) that real
measurement doesn't have.

## lib/

| file | purpose |
|------|---------|
| `yaml.mjs` | Parser for the `README.yml` subset (nested maps, block lists of maps — including this repo's `- id:` shorthand where the first key has no value and names the item — and inline flow arrays `[a, b, c]`). Not spec-compliant YAML; don't feed it anything fancier. |
| `template.mjs` | `render(template, vars)` — single-pass `{{key}}` substitution, throws on an unknown placeholder. `escapeXhtml(s)` — `&`/`<`/`>` escaping for XHTML text content. |
| `panel.mjs` | Cross-template building blocks: `renderTitlebar(title)` / `renderPromptbar(command)` — the exact markup every card's header/prompt line uses. Never hand-write this markup in a template. |
| `measure.mjs` | `measureTermSize(browser, probeSvg, { freeWidth, freeHeight })` — real-browser dynamic sizing, see above. |
| `drink.mjs` | Parses `assets/AA/*.txt` (format documented in `assets/AA/AA.txt.tpl`) and renders a drink's AA + caption into the XHTML fragment + light/dark CSS custom-property values every drink-displaying template needs. Also implements the `{...}` accent-highlight / `\{` `\}` literal-brace / `\\` literal-backslash escaping. |

See `assets/templates/README.md` for the template side of this pipeline
(placeholder conventions, how to add a new panel template).
