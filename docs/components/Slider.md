# Slider / SliderDual

M3 Expressive sliders: 16px inset track (primary active /
secondary-container inactive, full outer corners, 2px inner), 4×44 pill
handle with a 6px gap on each side (narrows to 2px while pressed),
`on-secondary-container` stop indicator dots (4dp, 6dp from the end) and a
44×48 `inverse-surface` value indicator (`label-large`, 12dp above the
handle) on hover/drag. `size` selects the M3E track scale — `xs` (16dp,
default), `s` (24), `m` (40), `l` (56), `xl` (96), with handle heights
44/44/52/68/108 and corners 8/8/12/16/28; the thick sizes (`m`/`l`/`xl`)
host an optional inset `icon` at the leading edge of the track, two-toned
to follow it (`on-primary` over the active track, `on-secondary-container`
over the inactive).
Built over native `input[type=range]` — keyboard and a11y come for free.

## Import

```tsx
import {Slider, SliderDual} from "react-material-expressive";
```

## API

```ts
interface SliderProps {
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  icon?: ReactNode; // inset leading icon (m/l/xl), two-toned by track
  labels?: SliderLabels; // accessible names
  max?: number;
  min?: number;
  size?: "xs" | "s" | "m" | "l" | "xl"; // M3E track scale (xs default)
  step?: number; // 100 / 0 / browser default
  onChange?: (value: number) => void;
  showLabel?: boolean; // value indicator (default true)
  tooltipChildren?: ReactNode; // suffix inside the indicator (e.g. "%")
  value?: number; // controlled
}

interface SliderLabels {
  label?: string; // aria-label (default "Slider")
}

interface SliderDualValue {
  max: number;
  min: number;
}
interface SliderDualProps {
  // same options (incl. `size`, no `icon`), with:
  defaultValue?: SliderDualValue;
  labels?: SliderDualLabels; // accessible names
  onChange?: (value: SliderDualValue) => void;
  value?: SliderDualValue;
}

interface SliderDualLabels {
  label?: string; // base aria-label (default "Range slider")
  minimum?: string; // min handle suffix (default "minimum")
  maximum?: string; // max handle suffix (default "maximum")
  // each handle's aria-label = `${label} ${minimum|maximum}`
}
```

## Examples

```tsx
<Slider defaultValue={40} onChange={setVolume} />
<Slider min={0} max={100} step={10} tooltipChildren="%" />
<SliderDual value={range} onChange={setRange} />
```

## Gotchas

- `Slider.onChange` receives a plain number; `SliderDual.onChange` a
  `{min, max}` pair (handles clamp to ±1 step of each other).
- Range click-to-jump works on `Slider`; on `SliderDual` only the handles
  are draggable.
- Sizes `xs`–`xl` are supported on both `Slider` and `SliderDual`; the
  inset `icon` is single-`Slider` only (the range's active segment sits
  between the handles, so there's no fixed leading edge for it).
- The inset `icon` is two-toned like the stop indicators — `on-primary`
  over the active track, `on-secondary-container` over the inactive one —
  so it changes colour (rather than vanishing) as the handle crosses it.
- The M3E "discrete/stops" rendering (a 4dp stop indicator at every step,
  on-primary over the active track / on-secondary-container over the
  inactive one) is not drawn — `step` still snaps the value.
- **BREAKING:** the `aria-label` prop was replaced by `labels={{label}}`
  (`SliderDual` handle suffixes are `labels.minimum`/`labels.maximum`).
