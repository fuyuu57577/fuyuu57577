// Real browser measurement for dynamic card sizing — no character-width
// guessing, no magic numbers. Render the card with `.term` forced to
// shrink-to-fit (`width/height: auto`) inside a generous outer canvas
// (the foreignObject clips to the outer <svg>'s own size regardless of
// what `.term` does internally, so the caller must render with a large
// probe width/height first), then read `.term`'s real layout box.

import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Generous enough that no realistic card content would ever be clipped by
// the outer canvas during measurement.
export const PROBE_SIZE = 4000;

// { freeWidth, freeHeight }: which dimensions to relax to their natural
// shrink-to-fit size before measuring. A panel whose width is pinned by
// design (to align with other cards in the README grid) should only free
// height — pass { freeWidth: false } to measure at its real fixed width.
export async function measureTermSize(browser, probeSvg, { freeWidth = true, freeHeight = true } = {}) {
  // width:auto on a block element fills its container rather than
  // shrink-wrapping — fit-content is what actually measures natural size.
  const overrides = [
    freeWidth && "width: fit-content !important;",
    freeHeight && "height: fit-content !important;",
    "overflow: visible !important;",
  ]
    .filter(Boolean)
    .join(" ");
  const forced = probeSvg.replace("</style>", `.term { ${overrides} }</style>`);
  const dir = mkdtempSync(path.join(tmpdir(), "aa-measure-"));
  const file = path.join(dir, "probe.svg");
  writeFileSync(file, forced, "utf8");
  try {
    // Text can render a hair wider/taller under one color scheme than the
    // other (antialiasing on light-on-dark text isn't pixel-identical to
    // dark-on-light) — measure both and take the max, or a card that's a
    // perfect fit in light mode can still clip by a pixel or two in dark.
    let width = 0;
    let height = 0;
    for (const colorScheme of ["light", "dark"]) {
      const page = await browser.newPage({ colorScheme });
      await page.goto("file:///" + file.replace(/\\/g, "/"));
      const size = await page.evaluate(() => {
        const r = document.querySelector(".term").getBoundingClientRect();
        return { width: Math.ceil(r.width), height: Math.ceil(r.height) };
      });
      await page.close();
      width = Math.max(width, size.width);
      height = Math.max(height, size.height);
    }
    return { width, height };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
