# Switch

M3 switch: 52×32 track with 2dp outline, handle 16↔24 (28 while pressed),
40px state layer. Optional handle icons (the handle stays 24 with a 16px
icon). Controllable via `useControlled`.

## Import

```tsx
import {Switch} from "react-material-expressive";
```

## API

```ts
interface SwitchProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "children" | "checked" | "defaultChecked"
> {
  checked?: boolean; // controlled
  className?: string; // wrapping <label>
  defaultChecked?: boolean; // uncontrolled seed
  icon?: ReactNode; // selected handle icon (16px)
  label?: ReactNode;
  uncheckedIcon?: ReactNode;
}
```

## Examples

```tsx
<Switch defaultChecked label="Wi-Fi" />
<Switch checked={on} onChange={(e) => setOn(e.target.checked)} label="Controlled" />
<Switch icon={<MaterialSymbol name="check" size={16} />} label="With icon" />
```

## Gotchas

- `role="switch"` is set on the input.
- Disabled follows M3: track `on-surface/12`, handle 38%.
