# Text fields — InputOutlined / InputFilled / TextFieldOutlined / TextFieldFilled

M3 text fields: height 56, shape **extra-small** (4 — filled: top corners
only), `body-large` input text, `on-surface-variant` placeholder, 24px
leading/trailing icons (12dp from the edge, 16dp gap to the text → 52dp
input padding on that side). The floating label is driven by **focus/value
state** (not `:placeholder-shown`), so it always lands in the same place.
`Input*` are single-line `<input>`; `TextField*` are `<textarea>`.

## Import

```tsx
import {
  InputFilled,
  InputOutlined,
  TextFieldFilled,
  TextFieldOutlined,
} from "react-material-expressive";
```

## API (shared shape)

```ts
interface InputOutlinedProps extends Omit<ComponentProps<"input">, "size"> {
  className?: string; // wrapper
  error?: boolean;
  errorText?: ReactNode; // replaces supportingText while error
  inputClassName?: string;
  label?: string; // floating label
  leftElement?: ReactNode; // 24px icon box
  rightElement?: ReactNode;
  supportingText?: ReactNode;
}
// InputFilled: same. TextField*: extends ComponentProps<"textarea"> (rows = 4).
```

Controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) both
work — the float state tracks either.

## Anatomy notes

- Outlined: the label notches the border via `fieldset/legend`, so it works
  over any background (cards, sheets, colored sections).
- Filled: surface-container-highest container, hover state layer and an
  active indicator line (1px on-surface-variant → on-surface on hover →
  2px primary on focus, error on error).
- `placeholder` only shows while the label is floated (or when no label).
- In the **error** state the **trailing** icon (`rightElement`) recolors to
  `error` along with the outline/indicator, label and supporting text; the
  **leading** icon (`leftElement`) stays `on-surface-variant` per the M3 spec.
  A trailing icon that draws with `currentColor` picks this up automatically.
- The float animation is a transform-only tween between two label copies
  (the @material/web technique) — font-size never interpolates, so the
  text doesn't re-rasterize mid-motion.

## Example

```tsx
<InputOutlined
    label="Email"
    leftElement={<MaterialSymbol name="mail" />}
    placeholder="you@example.com"
    supportingText="We never share it"
    type="email"
/>
<InputFilled error errorText="Taken" label="Username" defaultValue="grace" />
<TextFieldOutlined label="Message" rows={5} />
```

## Gotchas

- Pass `label` for the M3 look; with only `placeholder` they behave as
  plain fields.
- `disabled` follows M3 (38% content, 4% filled container).
