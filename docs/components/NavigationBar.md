# NavigationBar

M3 Expressive flexible navigation bar: height 64,
surface-container, 3–5 destinations. Vertical items (default) carry a
32×56 indicator pill over the 24px icon with `label-medium` below;
`horizontal` switches to the medium-window configuration — fixed-width
40dp pills holding icon + label, centered in the bar. On selection the
indicator springs its width and alpha from the center (one axis,
default-spatial spring) while the icon swaps to its filled variant, and
the press ripple runs inside the pill. Active colors: indicator
`secondary-container`, icon `on-secondary-container`, label `secondary`
when vertical (below the pill) but `on-secondary-container` when
`horizontal` (inside the pill, on the indicator, matching the icon);
inactive `on-surface-variant`.

## Import

```tsx
import {NavigationBar} from "react-material-expressive";
```

## API

```ts
interface NavigationBarProps extends ComponentProps<"nav"> {
  horizontal?: boolean; // 40dp icon+label pills (medium windows)
}

interface NavBarItemProps {
  active?: boolean; // explicit; otherwise derived from href+currentPath
  activeIcon?: ReactNode; // e.g. the filled glyph
  badge?: boolean;
  badgeColor?: string;
  badgeText?: string;
  className?: string;
  currentPath?: string; // pathname from YOUR router
  dotBadge?: boolean;
  href?: string; // renders a native <a>
  icon?: ReactNode;
  label?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  target?: string;
}
```

## Example

```tsx
<NavigationBar>
  <NavigationBar.Item
    activeIcon={<MaterialSymbol fill name="home" />}
    currentPath={pathname}
    href="/home"
    icon={<MaterialSymbol name="home" />}
    label="Home"
  />
  <NavigationBar.Item
    badge
    badgeText="3"
    href="/inbox"
    currentPath={pathname}
    icon={<MaterialSymbol name="inbox" />}
    label="Inbox"
  />
</NavigationBar>
```

## Gotchas

- Router-agnostic: pass `currentPath` (or control `active` yourself) and
  intercept `onClick` for client-side routing.
- Items without `href` render `<button>`.
- Active items set `aria-current="page"`.
- Per spec: always pass `label` (don't remove them), use the filled icon
  as `activeIcon`, bottom of the window only, compact/medium sizes —
  desktop layouts should use a navigation rail.
- Vertical items split the bar width equally; horizontal items are
  fixed-width and centered (the bar adds the outer margins).
