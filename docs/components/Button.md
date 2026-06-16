# Button

M3 Expressive button. `size` defaults to `s` (small): height 40,
`label-large`, full shape, 20px icons with 8px icon-label gap and
symmetric 16dp padding. Five sizes (`xs`/`s`/`m`/`l`/`xl`), `shape`
(round/square + pressed morph) and a `selected` toggle.

## Import

```tsx
import {Button} from "react-material-expressive";
```

## API

```ts
interface ButtonProps extends ComponentProps<"button"> {
  iconLeft?: ReactNode; // 20/20/24/32/40px box per size
  iconRight?: ReactNode;
  selected?: boolean; // M3 Expressive toggle (adds aria-pressed)
  shape?: "round" | "square"; // M3 Expressive; default "round"
  size?: "xs" | "s" | "m" | "l" | "xl"; // M3 Expressive: 32/40/56/96/136; default "s"
  text?: string; // label fallback when no children
  variant?: "filled" | "tonal" | "outlined" | "elevated" | "text"; // default "filled"
}
```

## Variants

- `filled` — primary/on-primary, highest emphasis.
- `tonal` — secondary-container/on-secondary-container.
- `elevated` — surface-container-low + level 1 shadow (level 2 on hover).
- `outlined` — outline border, primary label.
- `text` — lowest emphasis, primary label, no container.

## Expressive sizes and shapes

All five sizes (`xs`/`s`/`m`/`l`/`xl`, default `s`) use symmetric padding
12/16/24/48/64, icons 20/20/24/32/40, labels label-large → title-medium →
headline-small → headline-large, and per-size square radii (12/12/16/28/28).
Pressing morphs both shapes to the per-size pressed radius (8/8/12/16/16,
the DSDB PressedContainerShape tokens; border-radius transition,
emphasized). The asymmetric 24dp padding of the old common button is no
longer recommended in M3E.

## Toggle

With `selected` the button becomes a toggle: colors follow the M3
Expressive toggle tokens per variant (elevated: surface-container-low ↔
primary; filled: surface-container ↔ primary; tonal: secondary-container
↔ secondary; outlined: outline ↔ inverse-surface — the text variant has
no toggle) and the shape follows the selection (unselected round,
selected square). Emits `aria-pressed`, so it works inside
`ButtonGroupConnected` out of the box.

## States

Hover/focus/pressed use M3 state layers (8/12/12% currentColor); the
press ripple grows from the pointer like @material/web. Filled/tonal gain
a level 1 shadow on hover. `disabled` renders container `on-surface/12` +
label `on-surface/38` (outlined: 12% border; no container on text), and
removes elevation.

## Examples

```tsx
<Button>Accept</Button>
<Button variant="tonal" iconLeft={<MaterialSymbol name="add" size={18} />}>
    New item
</Button>
<Button size="xl" shape="square">Get started</Button>
<Button variant="text" onClick={close}>Cancel</Button>
```

## Gotchas

- `type` defaults to `"button"` (no accidental form submits).
- Icons are `ReactNode`; size them at 18px for spec fidelity (or at the
  per-size icon box when using `size`).
