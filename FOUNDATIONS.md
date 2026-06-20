# M3 Expressive foundations

Internal reference for contributors and audits — **not shipped** in the npm
package. It records the authoritative sources and the cross-cutting M3
Expressive values every component builds on. Per-component spec values and
their accepted gaps live in [`docs/components/`](docs/components).

## Source-of-truth hierarchy

When sources disagree, the higher one wins (Material Web is pre-Expressive in
places, so it is a low-priority reference except for web technique):

1. **m3.material.io token tables** (`/components/<x>/specs`) — the `md.comp.*`
   token sets: colors by role and state, dp measurements, state-layer
   opacities. The site is client-side rendered, so read it with a real browser
   (expand the token tables and the "Toggle view" value mode); plain fetching
   does not work.
2. **`tokens.xml`** from material-components-android — values the site does not
   publish.
3. **Jetpack Compose Material3** (androidx) — choreographies and springs;
   prefer published tokens over hard-coded values.
4. **Guideline videos** sampled frame by frame for motion.
5. **`@material/web`** (v0_192) — only for classic M3 components and web
   techniques; it predates Expressive.
6. **Guideline prose.**

Measure the real implementation (computed styles, `getBoundingClientRect`,
`rAF` sampling) before changing anything, and confirm motion in both
directions.

## Theming

- Official **M3 tokens** at runtime: `--md-sys-color-*` (full 49-role scheme),
  `--md-sys-shape-corner-*`, `--md-sys-elevation-level1..5`,
  `--md-ref-typeface-brand/plain`, the motion easings/durations.
- `:root` is the light scheme; `.dark, [data-theme="dark"]` is dark. Both are
  verbatim Material Theme Builder exports — a new export pastes 1:1 over a
  color block (same role order).
- `theme.css` maps utilities to tokens with `@theme inline` so the `var()`s
  resolve per element and follow `[data-theme]` scopes at runtime. The
  `--text-*` scale is static in `@theme`.
- `useMaterialTheme()` (no Provider) reads/writes `data-theme` on `<html>`,
  persists to `localStorage("md-theme")`, toggles `.dark`, and syncs across
  instances and tabs.

## State layers

Never use `*-hover` tokens. Interaction states are M3 **state layers** of
`currentColor`: hover **8%**, focus/pressed **12%** (the v0_192 pins in
`:root`; several newer component sets publish 8/10/10 — documented per
component, not changed globally pending a single audit).

Two layers, like `@material/web`'s ripple (`isolation: isolate`):

- **`::after`** — hover/focus tint (`color-mix` of `currentColor`, 15ms
  linear).
- **`::before`** — the press ripple: a radial surface whose geometry is
  animated from the pointer by `utils/_ripple.ts` (grows ~450ms standard);
  CSS handles the fades (105ms in, 375ms linger). Keyboard/no-JS falls back to
  a centered tile.

`.state-layer` is the generic class; buttons/chips/FAB bake it in; `.peerLayer`
serves inputs driven by a `.peer`. All hand-written `:hover` lives under
`@media (hover: hover)` so a touch tap does not leave a sticky hover tint.

## Elevation

Levels 1–5 as layered shadows (`--md-sys-elevation-level*` / the `shadow-mm-*`
utilities). Used only by FAB, dialog, menus, sheets, snackbar and the
elevated card/button/chip. Interactive elevation transitions at 280ms
emphasized on buttons/FABs; chips snap (no elevation transition), matching mw.

## Stacking & z-index

Overlays layer through one documented scale of `--md-sys-z-*` tokens (defined
in `styles.css` `:root`; theme-independent, so they are **not** duplicated in
the dark scheme), consumed as full Tailwind literals like
`z-[var(--md-sys-z-menu)]`. Ascending paint order:

| Token                 | Value | Used by                                                              |
| --------------------- | ----- | -------------------------------------------------------------------- |
| `--md-sys-z-base`     | 0     | default content plane                                                |
| `--md-sys-z-raised`   | 10    | in-flow raised bits (FAB-in-toolbar, indicators)                     |
| `--md-sys-z-sticky`   | 20    | sticky/stacked in-flow chrome (avatar overlaps)                      |
| `--md-sys-z-dropdown` | 30    | anchored inline popovers (Select, Search, docked pickers)            |
| `--md-sys-z-menu`     | 50    | portaled menus & popovers (Dropdown, OverflowMenu, SplitButton, Menu.Sub, Combobox) |
| `--md-sys-z-tooltip`  | 55    | tooltips                                                             |
| `--md-sys-z-modal`    | 60    | dialogs, sheets, modal rail + their scrims                          |
| `--md-sys-z-snackbar` | 70    | toasts                                                               |

Menus sit **below** modals: a page-level menu yields to a dialog/sheet scrim,
while a menu opened inside a dialog still paints above it (both portal to
`document.body`; the menu mounts later). Override any token to slot custom
chrome between layers. A separate, clearly-local negative set
(`--md-sys-z-state-press`/`-hover`, `--md-sys-z-nav-indicator`) lives inside
isolated state-layer/nav hosts and never interacts with this scale.

## Motion

- Emphasized `cubic-bezier(0.2, 0, 0, 1)`; the full standard/emphasized
  (+accelerate/decelerate), legacy, linear easings and the 16
  `--md-sys-motion-duration-*` live in `:root`.
- Expressive **springs** sampled from Compose as CSS `linear()`:
  `--md-sys-motion-spring-fast-spatial` (use with 350ms transitions) and
  `--md-sys-motion-spring-default-spatial` (450ms; navigation indicators, the
  rail morph). Other springs are approximated with beziers.
- Overlays animate in (emphasized-decelerate ~400ms) and out
  (emphasized-accelerate ~200ms) and stay mounted during their exit.
- Shape morphs (round↔square, split button, connected group) interpolate the
  real pixel radius (`h/2`), never `corner-full` (9999px would collapse the
  neighbouring corner and snap).

## Type scale

15 styles as `text-*` utilities. Note `body-large` (16/24/+0.5, w400) and
`title-medium` (16/24/+0.15, w500) are **not** interchangeable.

## Disabled & focus

- **Disabled**: container `on-surface/12` + content `on-surface/38` (outlined:
  12% border); elevated surfaces drop their shadow. No global `opacity`.
- **Focus ring**: 3px `secondary`, offset 2, animated entrance (0→8px in
  150ms → 3px in 450ms emphasized). Menu items are the exception — no ring,
  state layer only (roving focus would otherwise re-fire the ring each step).

## Expressive-only

The kit is M3 **Expressive only**: anything the spec marks "no longer
recommended" is not shipped (see the README "Expressive-only" section).
Where the spec keeps more than one valid style, the recommended one is the
default and the alternative stays available (List `plain`, Search `divided`,
Progress/Circle `wavy`). When an audit finds a newly-deprecated variant,
remove it (don't document it as legacy) and update the docs.

## Accepted gaps

Some spec details are intentionally not implemented (e.g. drag states, the
adaptive arrangement of toolbars, full-screen calendar scrolling). Each is
recorded as an "accepted gap" in the relevant `docs/components/*.md` with the
rationale, so they read as deliberate decisions rather than omissions.
