# IconButton

M3 icon button: 40×40 visual container with a 48×48 touch target, 24px
icon, full shape. M3 Expressive sizes, widths, shapes and the toggle
(`selected`) variant are available.

## Import

```tsx
import {IconButton} from "react-material-expressive";
```

## API

```ts
interface IconButtonProps extends ComponentProps<"button"> {
  icon?: ReactNode; // 24px box; children work as a fallback slot
  selected?: boolean; // M3 Expressive toggle (adds aria-pressed)
  shape?: "round" | "square"; // M3 Expressive; default "round"
  size?: "xs" | "s" | "m" | "l" | "xl"; // M3 Expressive: 32/40/56/96/136, default "s"
  variant?: "filled" | "tonal" | "outlined" | "standard"; // default "filled"
  width?: "narrow" | "default" | "wide"; // M3 Expressive
}
```

## Variants

- `filled` — primary container.
- `tonal` — secondary-container.
- `outlined` — outline border, on-surface-variant icon.
- `standard` — no container, on-surface-variant icon.

## Expressive sizes, widths and toggle

Sizes use icons 20/24/24/32/40; `width` narrows or widens the container
per size. Pressing morphs both shapes to the per-size pressed radius
(8/8/12/16/16, the DSDB PressedContainerShape tokens). With `selected` the button becomes a toggle: colors follow the
M3 Expressive toggle tokens per variant (filled: surface-container ↔
primary; tonal: secondary-container ↔ secondary; outlined selected:
inverse-surface; standard: on-surface-variant ↔ primary) and the shape
flips with the selection (unselected round, selected square) unless
`shape` is set explicitly.

## States

State layers on hover/focus/pressed (the press ripple grows from the
pointer); `disabled` = container `on-surface/12` + icon `on-surface/38`
(standard/outlined keep no fill).

## Examples

```tsx
<IconButton
    aria-label="Settings"
    icon={<MaterialSymbol name="settings" />}
    variant="standard"
/>
<IconButton
    aria-label="Favorite"
    icon={<MaterialSymbol name="favorite" />}
    selected={isFavorite}
    onClick={() => setIsFavorite((value) => !value)}
/>
```

## Gotchas

- Icon-only: always pass `aria-label`.
- The 48×48 touch target is a child span on the sub-48 sizes (`xs`/`s`).
