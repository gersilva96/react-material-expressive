# Radio

M3 radio button: custom-rendered 20px ring + 10px dot with a 40px circular
state layer. The native input is the source of truth, so uncontrolled
groups (shared `name`) keep native semantics; pass `checked` + `onChange`
for controlled usage.

## Import

```tsx
import {Radio} from "react-material-expressive";
```

## API

```ts
interface RadioProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "children"
> {
  className?: string; // wrapping <label>
  label?: ReactNode;
}
```

## Example

```tsx
<div role="radiogroup" aria-label="Size">
  <Radio defaultChecked label="Small" name="size" value="s" />
  <Radio label="Medium" name="size" value="m" />
  <Radio disabled label="Large" name="size" value="l" />
</div>
```

## Gotchas

- Group radios with the same `name` inside a `role="radiogroup"` container.
- Disabled follows M3 (38% ring/dot/label).
