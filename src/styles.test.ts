import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";

// Vitest runs from the package root; read the source stylesheet directly.
const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

// The overlay stacking scale, in ascending paint order. Guards against an
// accidental reorder or a missing token (jsdom can't verify z-index visually).
const OVERLAY_TOKENS = [
  "--md-sys-z-base",
  "--md-sys-z-raised",
  "--md-sys-z-sticky",
  "--md-sys-z-dropdown",
  "--md-sys-z-menu",
  "--md-sys-z-tooltip",
  "--md-sys-z-modal",
  "--md-sys-z-snackbar",
];

describe("z-index token scale", () => {
  it("defines every overlay stacking token", () => {
    for (const token of OVERLAY_TOKENS) {
      expect(css, `missing ${token}`).toContain(`${token}:`);
    }
  });

  it("orders the overlay scale strictly increasing", () => {
    const values = OVERLAY_TOKENS.map((token) => {
      const match = css.match(new RegExp(`${token}:\\s*(-?\\d+)`));
      expect(match, `missing value for ${token}`).not.toBeNull();
      return Number(match![1]);
    });
    for (let i = 1; i < values.length; i += 1) {
      expect(
        values[i],
        `${OVERLAY_TOKENS[i]} must sit above ${OVERLAY_TOKENS[i - 1]}`,
      ).toBeGreaterThan(values[i - 1]);
    }
  });
});
