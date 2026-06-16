# Loading

Icon-sized circular **indeterminate** spinner, colored with currentColor
(defaults to primary). M3 sizing: **40px** diameter (the non-wavy
`CircularProgressIndicatorTokens.Size`; 48 is only the wavy baseline), 4px
stroke. The animation is an SVG arc with round caps that grows ~10°↔270°
while it spins — the **same `_Spinner` `Circle` renders when
indeterminate**.

`Loading` is not a separate Material component: visually it **is**
`<Circle indeterminate />`, kept as a convenience that inherits
`currentColor` and uses `role="status"` so it drops cleanly inside buttons,
text and tight inline contexts. For the distinct shape-morphing M3
Expressive component (SoftBurst → … → Oval) see
[LoadingIndicator](LoadingIndicator.md); for determinate/labelled progress
use [Circle](Progress.md).

## `Loading` vs `<Circle indeterminate />`

They render the **same spinner** (shared `_Spinner`, identical animation
and 40px default), so pick by intent, not by looks:

|          | `Loading`                                  | `Circle indeterminate`                                                |
| -------- | ------------------------------------------ | --------------------------------------------------------------------- |
| ARIA     | `role="status"` (live region — "loading…") | `role="progressbar"` (busy, no value)                                 |
| Color    | `currentColor` — recolor via `className`   | fixed `primary` (the progress color)                                  |
| Lives in | `elements` (inline spinner)                | `components`, with `Progress` (`value`, `wavy`, track, center label…) |

Reach for `Loading` as an **inline "busy" spinner** you drop in a button or
a sentence and tint with `currentColor`; reach for [`Circle`](Progress.md)
`indeterminate` when it is a **progress indicator** — same component family
as the determinate / wavy / labelled progress.

## Import

```tsx
import {Loading} from "react-material-expressive";
```

## API

```ts
interface LoadingProps {
  className?: string; // e.g. "text-tertiary"
  labels?: LoadingLabels; // accessible names
  size?: number; // px, default 40 (M3 non-wavy circular Size)
  strokeWidth?: number; // px, default 4
}

interface LoadingLabels {
  label?: string; // aria-label (default "Loading")
}
```

## Examples

```tsx
<Loading />
<Loading className="text-on-surface-variant" size={24} />
```

## Gotchas

- `role="status"` announces it; pass a contextual `labels.label`
  ("Loading messages").
- For determinate progress use [Progress / Circle](Progress.md).
- **BREAKING:** the `label` prop was replaced by `labels={{label}}`.
