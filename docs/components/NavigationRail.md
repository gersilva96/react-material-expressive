# NavigationRail

M3 Expressive navigation rail. Collapsed: 96dp wide (80 with `narrow`)
on `surface`, 44dp top spacing, vertical items (32×56 indicator pill,
`label-medium` below, 4dp apart). `expanded` morphs it into the 220dp
rail that replaces the navigation drawer: the springing width
(default-spatial; fast-spatial when `modal`) drives a continuous morph —
each item is a single row pill stretched open by its label slot into a
content-hugging 56dp row (`label-large` — larger than the collapsed
`label-medium` below-label, leading icon, anchored at the 20dp side
padding — the pill wraps icon + label, it is not full width), the
below-label collapses while the side-label reveals inside the growing
pill (the active expanded label sits on the indicator, so it takes
`on-secondary-container` to match the icon — the collapsed below-label
stays `secondary` on the surface), and the rail FAB extends with its
label. The menu button (rendered when `onMenuClick` is set) toggles the
morph; the library draws its default M3 icon, swapping `menu` → `menu_open`
with `expanded` (override either glyph via `menuIcon`/`menuOpenIcon`). `modal` overlays
the expansion as a full-window drawer (fixed, spanning the available
height like the 32% scrim; surface-container, level 2, large end corners)
instead of pushing content; the overlay surface eases out in lockstep with the
width as the rail collapses, deflating smoothly into the resting rail. The selection animation matches the bar:
indicator expands from the center with the press ripple inside the pill.

## Import

```tsx
import {NavigationRail} from "react-material-expressive";
```

## API

```ts
interface NavigationRailProps {
  bottom?: ReactNode; // bottom-aligned slot
  children?: ReactNode; // NavigationRail.Item list
  className?: string;
  expanded?: boolean; // 220dp morph (drive from the menu button)
  fabIcon?: ReactNode; // rail FAB (extends with fabLabel when expanded)
  fabLabel?: ReactNode;
  labels?: NavigationRailLabels; // menu button aria-label (expand/collapse)
  menuIcon?: ReactNode; // override the collapsed glyph (default M3 menu)
  menuOpenIcon?: ReactNode; // override the expanded glyph (default M3 menu_open)
  modal?: boolean; // expansion overlays content with a scrim
  narrow?: boolean; // 80dp collapsed width
  onFabClick?: MouseEventHandler<HTMLButtonElement>;
  onClose?: () => void; // modal dismiss (scrim click / Escape)
  onMenuClick?: MouseEventHandler<HTMLButtonElement>; // renders the menu button (lib draws menu/menu_open)
}
interface NavigationRailLabels {
  expand?: string; // menu aria-label while collapsed. Default "Expand"
  collapse?: string; // menu aria-label while expanded. Default "Collapse"
}
// NavigationRail.Item: same props as NavigationBar.Item
```

## Example

```tsx
const [expanded, setExpanded] = useState(false);

<NavigationRail
  expanded={expanded}
  fabIcon={<MaterialSymbol name="edit" />}
  fabLabel="Compose"
  onFabClick={compose}
  onMenuClick={() => setExpanded((value) => !value)}>
  <NavigationRail.Item
    activeIcon={<MaterialSymbol fill name="inbox" />}
    currentPath={pathname}
    href="/inbox"
    icon={<MaterialSymbol name="inbox" />}
    label="Inbox"
  />
  <NavigationRail.Item
    currentPath={pathname}
    href="/sent"
    icon={<MaterialSymbol name="send" />}
    label="Sent"
  />
</NavigationRail>;
```

## Gotchas

- The rail is `h-full` — give its parent (or the rail via `className`) a
  height. The expanded width can be tuned with the
  `--rail-expanded-width` custom property (spec range 220–360).
- `expanded` is plain-controlled; provide `onMenuClick` to render the menu
  button. The library draws the default `menu` ↔ `menu_open` glyph itself
  (override either with `menuIcon`/`menuOpenIcon`), sets `aria-expanded`,
  and uses `labels.expand`/`labels.collapse` for the aria-label. Wire
  `onMenuClick` to flip `expanded`. (Breaking: the old `menu` slot was
  removed in favor of `onMenuClick`.)
- With `modal`, the collapsed footprint stays in the layout while the
  expansion overlays the content as a full-window drawer (it spans the
  whole window height, like the scrim — give the page that height) — wire
  `onClose` for scrim/Escape.
- The rail FAB is coplanar (no shadow) and defaults to
  `primary-container`; recolor via `className` if needed.
- Each item renders one pill (no duplicated layouts): the side-label is
  `aria-hidden` and the accessible name comes from the below-label.
- Per spec: 3–7 destinations, vertical rails sit opposite the content
  edge with ≥24dp margins on large screens, and the rail stays fixed
  while content scrolls vertically.
