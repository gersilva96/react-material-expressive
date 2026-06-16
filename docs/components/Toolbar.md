# DockedToolbar and FloatingToolbar

M3 Expressive toolbars (`md.comp.toolbar` tokens, DSDB v34): frequently
used actions for the current page. Two variants:

- **DockedToolbar** — spans the full window width, 64dp high, square
  corners, `surface-container`, 16dp edge paddings and a 32dp default gap
  (the spec's max-spacing; min is 4). Bottom of the window only; successor
  of the baseline bottom app bar. FABs placed inside sit flat.
- **FloatingToolbar** — a 64dp pill (8dp paddings, 4dp gap, shape full,
  elevation level 3) floating above the content with a minimum 16dp screen
  margin (24dp when vertical). Can pair with a FAB (8dp gap) and collapse
  on scroll.

Both support the **standard** (`surface-container`, low emphasis) and
**vibrant** (`primary-container`, high emphasis) color schemes. Ghost
buttons inside (`IconButton variant="standard"`, `Button variant="text"`)
follow the toolbar token sets automatically: selected (`aria-pressed`,
e.g. the IconButton `selected` toggle) becomes `secondary-container` /
`on-secondary-container` in standard and `surface-container` /
`on-surface` in vibrant. Unselected content is `on-surface-variant` in
standard and `on-primary-container` in vibrant (so a text button drops its
default `primary` to match the toolbar). Filled/tonal buttons keep their
own colors for single-action emphasis.

## Import

```tsx
import {DockedToolbar, FloatingToolbar} from "react-material-expressive";
```

## API

```ts
interface DockedToolbarProps extends ComponentProps<"div"> {
  vibrant?: boolean; // primary-container scheme
}

interface FloatingToolbarProps extends ComponentProps<"div"> {
  expanded?: boolean; // default true; false plays the collapse
  fab?: ReactNode; // adjacent <FAB>, 8dp away (level 2, hover 3)
  fabPosition?: "start" | "end"; // FAB side (default end)
  flat?: boolean; // remove the level-3 elevation
  leading?: ReactNode; // collapses away when expanded={false}
  trailing?: ReactNode; // collapses away when expanded={false}
  vertical?: boolean; // 64dp-wide column
  vibrant?: boolean; // primary-container scheme
}
```

## Examples

```tsx
// Docked: global actions pinned to the bottom of the window.
<DockedToolbar className="fixed bottom-0">
    <IconButton aria-label="Undo" variant="standard">…</IconButton>
    <IconButton aria-label="Redo" variant="standard">…</IconButton>
    <IconButton aria-label="Attach" variant="standard">…</IconButton>
</DockedToolbar>

// Floating with FAB: collapse on scroll — the pill clips toward the FAB,
// which grows to the 80dp medium size (fast-spatial spring).
<FloatingToolbar
    className="fixed bottom-4 left-1/2 -translate-x-1/2"
    expanded={!scrolledDown}
    fab={
        <FAB aria-label="Add" variant="secondary">
            <MaterialSymbol name="add" />
        </FAB>
    }>
    <IconButton aria-label="Bold" selected={bold} variant="standard">…</IconButton>
    <IconButton aria-label="Italic" selected={italic} variant="standard">…</IconButton>
</FloatingToolbar>
```

## Motion

Expand/collapse ports the Compose fast-spatial spring (damping 0.6 /
stiffness 800) as a 350ms CSS `linear()` curve with a 9.5% overshoot
(`--md-sys-motion-spring-fast-spatial`). With a FAB the whole pill
clip-reveals toward the FAB side while the FAB lerps 56 → 80dp (icon
24 → 28); without one, only the `leading`/`trailing` slots collapse
(1fr → 0fr grid morph), keeping the core children. Collapsed regions are
`inert`, so they drop out of focus order and the accessibility tree.

## Gotchas

- Position the toolbar yourself (`fixed` wrapper): docked bars belong to
  the window bottom; floating toolbars keep ≥16dp margins (≥24dp when
  vertical) and must stay fully on screen.
- `expanded` is plain-controlled (no internal toggle) — drive it from your
  scroll handler; the spec recommends collapsing on scroll-down and
  expanding on scroll-up (Compose uses a 40dp threshold).
- Don't show a docked toolbar together with a navigation bar, and don't
  use wide icon buttons in vertical floating toolbars (spec guidelines).
- The FAB slot expects a default 56dp `<FAB>`; the toolbar overrides its
  elevation (level 2, hover 3 — not the standalone 3 → 4) and animates its
  size, so don't pass `size`.
- Per spec the FAB pairs as `secondary` in standard toolbars and
  `tertiary` in vibrant ones (`md.comp.toolbar.floating.fab` tokens).
- Square icon buttons are fine in docked toolbars but discouraged inside
  floating ones (shape clash with the fully-round container).
