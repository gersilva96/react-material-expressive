# FAB / ExtendedFAB

M3 floating action buttons. FAB sizes 56/80/96 with shapes
large/large-increased/extra-large and icons 24/28/36 (80 is the default
M3 Expressive medium FAB); Extended FAB comes in the M3 Expressive sizes
small 56 (large shape, title-medium, icon 24, padding 16, gap 8), medium
80 (large-increased, title-large, icon 28, padding 26, gap 12) and large
96 (extra-large, headline-small, icon 36, padding 28, gap 16). Both rest
at elevation level 3 and raise to 4 on hover.

## Import

```tsx
import {ExtendedFAB, FAB} from "react-material-expressive";
```

## API

```ts
interface FABProps extends ComponentProps<"button"> {
  icon?: ReactNode;
  size?: "fab" | "fabMedium" | "fabLarge"; // 56 / 80 / 96, default "fabMedium"
  variant?: "primary" | "secondary" | "tertiary"; // default "primary"
}

interface ExtendedFABProps extends ComponentProps<"button"> {
  icon?: ReactNode; // optional leading icon (24/28/36px box per size)
  size?: "small" | "medium" | "large"; // 56 / 80 / 96, default "small"
  text?: string; // label fallback when no children
  variant?: "primary" | "secondary" | "tertiary"; // default "primary"
}
```

## Variants

- `primary` — primary-container (the M3 Expressive default color style).
- `secondary` — secondary-container.
- `tertiary` — tertiary-container.

The small FAB (40) and the `surface` color style were removed — both are no
longer recommended in M3 Expressive.

## Examples

```tsx
<FAB aria-label="Create" icon={<MaterialSymbol name="add" />} />
<FAB aria-label="Edit" size="fabLarge" variant="tertiary"
     icon={<MaterialSymbol name="edit" size={36} />} />
<ExtendedFAB icon={<MaterialSymbol name="edit" />}>Compose</ExtendedFAB>
<ExtendedFAB size="medium" variant="secondary"
     icon={<MaterialSymbol name="edit" size={28} />}>Compose</ExtendedFAB>
```

## Gotchas

- FAB is icon-only: pass `aria-label`.
- Use one FAB per screen (M3); prefer `secondary`/`tertiary` containers on
  busy surfaces.
- Inside a DockedToolbar the FAB is flattened
  automatically — no extra class needed.
- The spec's solid color styles (primary & on-primary, etc.) aren't
  built-in variants; recolor via `className` (e.g.
  `"bg-primary text-on-primary"`).
