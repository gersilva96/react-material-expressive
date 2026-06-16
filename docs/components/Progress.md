# Progress / Circle

M3 Expressive progress indicators. `Progress` is linear (primary
indicator over a secondary-container track with a 4px gap and a stop
indicator; optional `wavy` sine variant); `Circle` is circular (4px
stroke, 4px track gap, optional center content). Both support determinate
(`value` 0–100) and `indeterminate` modes with proper `progressbar`
semantics; the linear indeterminate is the @material/web two-bar (a primary +
secondary bar translate/scale across; `wavy` runs the same choreography with
each segment drawn as a traveling sine), and the circular indeterminate is an
SVG arc with round caps that grows ~10°↔270° while it spins (`wavy` ripples
that spinning arc).

## Import

```tsx
import {Circle, Progress} from "react-material-expressive";
```

## API

```ts
interface ProgressProps {
  className?: string;
  indeterminate?: boolean;
  labels?: ProgressLabels; // accessible names
  value?: number; // 0–100
  wavy?: boolean; // M3 Expressive sine active indicator (indeterminate: two sine segments sweep across)
}

interface ProgressLabels {
  label?: string; // aria-label (default "Progress")
}

interface CircleProps {
  children?: ReactNode; // center content (e.g. "60%")
  className?: string;
  indeterminate?: boolean;
  labels?: CircleLabels; // accessible names
  size?: number; // px, defaults: 40 flat / 48 wavy (M3E baselines)
  strokeWidth?: number; // px, default 4 (the spec's configurable thickness)
  value?: number; // 0–100
  wavy?: boolean; // rippled active arc — determinate (flat outside 10-95% like Compose) and the indeterminate spinner
}

interface CircleLabels {
  label?: string; // aria-label (default "Progress")
}
```

## Examples

```tsx
<Progress value={60} />
<Progress value={60} wavy />
<Progress indeterminate />
<Circle value={60}>60%</Circle>
<Circle value={60} wavy />
<Circle indeterminate size={32} />
```

## Gotchas

- Determinate values transition like @material/web (linear 250ms,
  circular stroke 500ms).
- The linear indeterminate runs @material/web's two-bar choreography (a
  primary + secondary bar translate/scale, 2s). The flat variant draws solid
  bars; `wavy` reuses that exact timing — two primary segments sweep sideways
  (their head/tail `clip-path` is derived from the flat translate/scale) and
  each shows the same traveling sine as the determinate active indicator
  (wavelength 40), 10px tall (the flat bar is 4px). The circular indeterminate
  is an SVG arc with round caps that grows ~10°↔270° while it spins (flat
  reuses `_Spinner`); `wavy` keeps that spin + grow/shrink dash but draws a
  rippled ring (amplitude 1.6, wavelength 15) whose wave travels.
- The flat `Circle indeterminate` and [`Loading`](Loading.md) render the
  **same** spinner (`_Spinner`) — pick by intent: `Circle` is the **progress
  indicator**
  (`role="progressbar"`, fixed `primary`, can hold a center label);
  `Loading` is the inline **status** spinner (`role="status"`, recolorable
  via `currentColor`, lives in `elements`) for a busy indicator inside a
  button or text.
- **BREAKING:** the `aria-label` prop was replaced by `labels={{label}}` on
  `Progress`, `Circle` and [`LoadingIndicator`](LoadingIndicator.md).
