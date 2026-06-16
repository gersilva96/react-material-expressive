# Checkbox

M3 checkbox: custom-rendered 18×18 box (2dp shape, 2dp outline, checkmark
in currentColor) with a 40px circular state layer. The native input is the
source of truth — controlled (`checked` + `onChange`) and uncontrolled
(`defaultChecked`) both keep platform semantics.

## Import

```tsx
import {Checkbox} from "react-material-expressive";
```

## API

```ts
interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "children"
> {
  className?: string; // wrapping <label>
  inputClassName?: string; // visual box
  label?: ReactNode;
}
```

## States

Unchecked (on-surface-variant outline) / checked (primary container,
on-primary check) / disabled (38% outline; selected disabled: 38%
container). Hover/focus/pressed show the 40px state layer (on-surface
unchecked, primary checked).

## Examples

```tsx
<Checkbox label="Accept terms" onChange={(e) => setOk(e.target.checked)} />
<Checkbox checked={value} onChange={(e) => setValue(e.target.checked)} label="Controlled" />
<Checkbox defaultChecked disabled label="Locked" />
```

## Gotchas

- The label is part of the clickable area (wrapped in `<label>`).
- For groups just repeat with a shared `name`.
