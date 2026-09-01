# assets/templates

Source templates for every generated card. Nothing here is hand-embedded
into `README.md` directly — `tools/build-readme.mjs` and
`tools/build-aa-gallery.mjs` render these into `assets/images/*.svg` and
`assets/AA_Gallery/*.png`.

```
templates/
  icons/                 raw <svg> icon markup, injected into {{icon}}
    x.svg
    globe.svg
  images/
    shared.css            actually-used shared CSS, injected as {{sharedStyles}}
    panel-template.svg.tpl reference skeleton — copy this for a new panel (not read by any build script)
    aboutme.svg.tpl        full card with avatar + info rows
    badge.svg.tpl          external-link badge (X, portfolio, ...)
    now.svg.tpl            Interests/Building + drink-of-the-moment
    aa-card.svg.tpl        standalone AA + caption card (AA Gallery)
```

## Placeholder convention

Every `*.svg.tpl` is rendered with `tools/lib/template.mjs`'s `render()`:
a single-pass `{{key}}` substitution (no loops/conditionals — build scripts
generate any repeated markup, like table rows or list items, in JS and pass
the finished HTML string as one variable). `render()` throws if the
template references a `{{key}}` that wasn't supplied, so a typo fails loud.

Placeholders every template gets from the shared plumbing:

| placeholder      | comes from                                   | notes |
|-------------------|-----------------------------------------------|-------|
| `{{sharedStyles}}` | `shared.css`, read once per build              | put first in `<style>` so panel rules can override it |
| `{{titlebar}}`     | `tools/lib/panel.mjs` → `renderTitlebar(title)` | only for cards that keep the macOS-dots header (currently just `aboutme.svg.tpl`, `aa-card.svg.tpl`) |
| `{{promptbar}}`    | `tools/lib/panel.mjs` → `renderPromptbar(command)` | every card has one; it's always the first child of `.term` when there's no titlebar |
| `{{width}}` / `{{height}}` | real browser measurement via `tools/lib/measure.mjs` (see `tools/README.md`) | placeholder whenever content (line/item count, text length) can vary; hardcode only when the content shape is structurally fixed |

Panel-specific placeholders (`{{avatar}}`, `{{rows}}`, `{{icon}}`,
`{{handle}}`, `{{columns}}`, `{{aa}}`, `{{drinkStyle}}`, ...) are documented
inline where each build script constructs them.

## Why CSS/markup is shared but the SVG itself isn't

Each rendered SVG must stay fully self-contained — GitHub's camo image
proxy serves it cross-origin, and a `foreignObject` can't reliably
`@import` external CSS through that. So sharing happens at **build time**
(`shared.css` + `renderTitlebar`/`renderPromptbar` get inlined into every
output file), not at render time. Never add a `<link>` or `@import` to a
template — copy the placeholder pattern above instead.

## Adding a new panel template

1. Copy `panel-template.svg.tpl` to `images/<name>.svg.tpl`.
2. Reuse a `.body` pattern from `panel-template.svg.tpl`'s comment block
   (label/value rows, two-column bullet lists, icon+handle/url) before
   inventing a new one.
3. Add a `render<Name>Panel()` function to `tools/build-readme.mjs` (or a
   new build script, if it's not a `README.yml` panel type) that reads the
   template, builds the panel-specific placeholder values, and calls
   `render()`. If width or height can vary with content, measure it with
   `tools/lib/measure.mjs`'s `measureTermSize()` — don't estimate it from
   character counts, that's a magic-number trap (see `tools/README.md`).
4. If any ASCII art needs a backslash-look character, use the `.mirror`
   trick documented in `panel-template.svg.tpl` — never a literal `\`
   (renders as ¥ on this Windows/JP-locale Chromium setup).
5. Run `npm run build` and check both color schemes before committing —
   `assets/templates/images/*.svg.tpl` files aren't previewable on their
   own; render them via the build first (see repo root `README.yml` /
   `tools/*.mjs` docstrings for the exact commands).
6. If the panel is shown directly in the main README (as opposed to a
   gallery-only card), give it a mobile layout too: parameterize `width`
   (don't hardcode 880), take a `{{termClass}}` var for the outer
   `<xhtml:div class="{{termClass}}">` (`"term"` or `"term mobile"`), and
   add `.term.mobile ...` CSS overrides for a narrow, stacked layout —
   don't just let the desktop layout shrink, phone-width text gets
   unreadably small that way. If the panel has a titlebar, also override
   `.titletext { margin: 0; transform: none; }` under `.term.mobile` — its
   default centering trick assumes desktop-width slack (see the note in
   `aa-card.svg.tpl`). `tools/build-readme.mjs` renders both variants and
   wires them together with `<picture>`/`<source media>` — see
   `tools/README.md`.
