# Chips

M3 chip: height 32, small shape (8), `label-large`, 18px icons. Padding is
16dp, reduced to 8dp on the icon/remove side automatically.

## Import

```tsx
import {Chips} from "react-material-expressive";
```

## API

```ts
interface ChipsProps extends ComponentProps<"button"> {
  avatar?: boolean; // input chips: 24dp leading avatar (4dp edge padding)
  elevated?: boolean; // surface-container-low + level 1 instead of outline
  labels?: ChipsLabels; // accessible names
  leftElement?: ReactNode; // 18px box
  onRemove?: (e) => void; // input chips: trailing remove affordance
  rightElement?: ReactNode; // 18px box
  selected?: boolean; // filter/input visual state (controlled by you)
  text?: string; // label fallback when no children
  variant?: "assist" | "filter" | "input" | "suggestion"; // default "assist"
}

interface ChipsLabels {
  remove?: string; // trailing remove affordance aria-label (default "Remove")
}
```

## Variants

- `assist` — on-surface label; leading icon tinted primary.
- `suggestion` — on-surface-variant label; leading icon tinted primary.
- `filter` / `input` — on-surface-variant label; when `selected`, the chip
  turns secondary-container without border. Both expose `aria-pressed`.
  The leading icon tints primary on unselected filter chips and on
  selected input chips (per the M3 chip token sets). Selected filter
  chips grow a leading checkmark (the chip widens ~150ms while the check
  draws in); a custom `leftElement` crossfades with the check instead.
- `elevated` — swaps the outline for `surface-container-low` at elevation
  1 (2 on hover, 1 pressed). Not available on input chips (ignored), like
  `@material/web`.

The flat outline is `outline-variant` (current M3 tokens) and darkens on
keyboard focus (on-surface for assist, on-surface-variant otherwise).

## States

State layer on hover/focus/pressed. A selected flat filter chip raises to
elevation 1 on hover (snap, like every chip elevation). `disabled`: border
`on-surface/12`, label `on-surface/38` (selected or elevated disabled:
container `on-surface/12`, no shadow). The input remove affordance carries
a 48dp-tall touch target that bleeds past the 32dp container (spec: min
48dp for the close icon).

## Examples

```tsx
<Chips leftElement={<MaterialSymbol name="event" size={18} />} text="Add to calendar" />
<Chips variant="filter" selected={active} onClick={toggle} text="Vegan" />
<Chips variant="input" text="ada@example.com" onRemove={() => remove(id)} />
<Chips
    avatar
    leftElement={<Avatar height={24} name="AL" width={24} />}
    onRemove={() => remove(id)}
    text="Ada Lovelace"
    variant="input"
/>
```

## Gotchas

- `selected` is a display prop — manage the selection set in your app
  (chips are presentational).
- `onRemove` stops propagation, so chip `onClick` doesn't fire on remove.
