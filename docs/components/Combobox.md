# Combobox

ARIA **combobox** with an async-friendly options list — a text field
(`ComboboxFilled` / `ComboboxOutlined`, same anatomy as the text fields and
`Select`) over a `role="listbox"` popover. Unlike `Select` (a fixed option
list) and `Search` (a search bar, not a combobox), it exposes the full
combobox semantics — `role="combobox"`, `aria-autocomplete`,
`aria-expanded`/`aria-controls`/`aria-activedescendant` — with keyboard
navigation and a portaled listbox that escapes `overflow` ancestors.

**The library never fetches or filters.** You own the data: as the user types,
`onInputChange(query)` fires (debounce it on your side), you fetch/filter
(client- or server-side) and feed the resulting `options` back in. `loading`
shows a status row while in flight. (Not a Material component — an extra on top
of the M3 kit.)

Because filtering only happens through `onInputChange`, `aria-autocomplete` is
`"list"` when you wire `onInputChange` (the list narrows as the user types) and
`"none"` when you don't (a static option popover that never narrows). Wire
`onInputChange` for a real combobox — even a static list needs a (synchronous)
filter to narrow.

## Import

```tsx
import {ComboboxFilled, ComboboxOutlined} from "react-material-expressive";
```

## API

```ts
interface ComboboxOption {
  disabled?: boolean;
  label?: string; // input text when selected; defaults to value
  value: string;
}

interface ComboboxLabels {
  clear?: string; // clear-button aria-label (default "Clear")
  empty?: string; // no-options status row (default "No results")
  loading?: string; // loading status row (default "Loading…")
}

interface ComboboxOutlinedProps {
  // …plus the native <input> props (placeholder, required, aria-*, …)
  className?: string;
  clearable?: boolean; // trailing clear button when there is text (default true)
  defaultValue?: string; // uncontrolled selected value
  disabled?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  id?: string;
  inputClassName?: string;
  label?: string; // floating label
  labels?: ComboboxLabels;
  leftElement?: ReactNode; // leading icon (24px box)
  listboxClassName?: string; // class for the portaled listbox surface
  loading?: boolean; // consumer signals an in-flight fetch
  name?: string; // posts the selected value via a hidden input
  onChange?: (value: string) => void; // selected value, or "" when cleared
  onInputChange?: (query: string) => void; // re-query (debounce on your side)
  options: ComboboxOption[]; // ALREADY filtered
  supportingText?: ReactNode;
  value?: string; // controlled selected value
}
// ComboboxFilledProps is identical.
```

## Example (async)

```tsx
function CountryPicker() {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useMemo(
    () =>
      debounce(async (q: string) => {
        setLoading(true);
        setOptions(await fetchCountries(q)); // your API
        setLoading(false);
      }, 250),
    [],
  );

  return (
    <ComboboxOutlined
      label="Country"
      loading={loading}
      onInputChange={search}
      onChange={setCountry}
      options={options}
    />
  );
}
```

## Keyboard

`ArrowDown`/`ArrowUp` open the popover (then move the active option, skipping
disabled, wrapping); `Home`/`End` jump; `Enter` commits the active option;
`Escape` and `Tab` close and revert the input text to the selected option's
label. Typing fires `onInputChange` and keeps the popover open.

## Gotchas

- **You own fetching and filtering.** `options` are rendered as-is; the
  library never filters them. Debounce `onInputChange` yourself.
- Two states: the **selected value** (`value`/`onChange`, controllable via
  `useControlled`) and the **input text** (the query). Typing diverges the
  text; blur/Escape/Tab without a pick reverts it to the selected label.
- `onChange` fires the option **value** (or `""` on clear) — not on every
  keystroke (that's `onInputChange`).
- With a `label`, the `placeholder` stays hidden until the field floats (focus
  or value) so it doesn't overlap the resting label — same as the text field.
  Without a `label` the placeholder shows at rest.
- The listbox is portaled to `document.body` (fixed positioning), matches the
  input width and flips up when there's no room below — it escapes `overflow`
  ancestors. An empty/loading popover shows a `role="status"` row instead of an
  empty listbox.
- `name` renders a hidden input so the value posts in native forms; native
  `required` validation is not wired — validate in `onSubmit`.
