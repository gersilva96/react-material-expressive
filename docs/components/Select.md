# Select

M3 selects: the text field anatomy (height 56, floating label, supporting
text, error states — filled or outlined) opening a 48dp-item options menu
with the @material/web animation (500ms emphasized reveal, 150ms
accelerate close). The caret cross-fades to an up arrow while open (75ms
linear delayed 75ms, like `md-select`). Keyboard navigation
(arrows/Home/End/Enter/Esc) and 200ms typeahead like `md-select`; the
selected option uses secondary-container. Designed to sit next to the text fields in forms —
same metrics, label behavior and supporting text.

## Import

```tsx
import {SelectFilled, SelectOutlined} from "react-material-expressive";
```

## API

```ts
interface SelectOption {
  disabled?: boolean;
  label?: ReactNode; // display content; defaults to the value
  value: string;
}

interface SelectFilledProps {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  id?: string;
  label?: string; // floating label
  leftElement?: ReactNode; // leading icon (24px box)
  name?: string; // posts the value via a hidden input
  onChange?: (value: string) => void;
  options: SelectOption[];
  supportingText?: ReactNode;
  value?: string; // controlled
}
// SelectOutlinedProps is identical.
```

## Examples

```tsx
<SelectFilled
    label="Fruit"
    options={[
        {label: "Apple", value: "apple"},
        {label: "Banana", value: "banana"},
    ]}
    onChange={setFruit}
/>
<SelectOutlined label="Quantity" name="qty" options={options} />
```

## Keyboard

Closed: `ArrowDown`/`ArrowUp`/`Enter`/`Space` open the menu (highlighting
the selected option); typing selects the first match directly. Open:
arrows move the highlight (skipping disabled options, wrapping),
`Home`/`End` jump, `Enter`/`Space` select, `Escape`/`Tab` close, typing
highlights by prefix (200ms buffer).

## Gotchas

- Trigger is a `role="combobox"` button with `aria-activedescendant`
  (focus never leaves the trigger) over a `role="listbox"` menu.
- `name` renders a hidden input so the value posts in native forms;
  native `required` validation is not wired — validate in `onSubmit`.
- The menu matches the field width and clips after ~280px with scroll.
- The label float shares the text fields' animation: a transform-only
  tween between two label copies (@material/web technique) — font-size
  never interpolates.
