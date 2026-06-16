# Amount

Quantity stepper on a surface-container-high pill (small shape): minus /
value / plus with min/max/step clamping. Controllable.

## Import

```tsx
import {Amount} from "react-material-expressive";
```

## API

```ts
interface AmountProps {
  className?: string;
  defaultValue?: number; // uncontrolled seed (default = min)
  disabled?: boolean;
  labels?: AmountLabels; // accessible names
  max?: number;
  min?: number;
  step?: number; // min 0, step 1
  minusIcon?: ReactNode;
  plusIcon?: ReactNode; // default inline SVGs
  onChange?: (value: number) => void;
  value?: number; // controlled
}

interface AmountLabels {
  label?: string; // group aria-label (default "Amount")
  decrease?: string; // minus button aria-label (default "Decrease")
  increase?: string; // plus button aria-label (default "Increase")
}
```

## Examples

```tsx
<Amount defaultValue={1} min={1} max={9} onChange={setQty} />
<Amount value={qty} onChange={setQty} step={5} />
```

## Gotchas

- Buttons disable automatically at the min/max bounds.
- The value region is `aria-live="polite"`.
- **BREAKING:** the `aria-label` prop was replaced by `labels={{label}}`
  (the +/- button aria-labels are `labels.decrease`/`labels.increase`).
