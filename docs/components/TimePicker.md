# TimePicker

M3 modal time picker built over the library's `Dialog`: a 256dp clock dial
with a draggable selector, the big HH:MM time selector, an AM/PM period
selector, and a keyboard-input toggle. Container surface-container-high,
level 3, extra-large (28). Controllable and presentational.

- **Dial** (default) — pick the hour on the clock (releasing advances to
  minutes), then the minute. The selected field is `primary-container`; the
  dial selector is `primary` (2dp track, 48dp handle, 8dp centre).
- **Input** (`input`) — two editable fields (display-medium, focus
  `primary-container` + 2dp primary outline) plus the AM/PM selector.

Selection is drafted and committed on **OK**.

## Import

```tsx
import {TimePicker, type TimeValue} from "react-material-expressive";
```

## API

```ts
interface TimeValue {
  hours: number; // 0–23
  minutes: number; // 0–59
}

interface TimePickerProps {
  input?: boolean; // start in keyboard-input mode
  isVisible: boolean;
  labels?: TimePickerLabels; // every user-facing string (see below)
  onClose: () => void;
  onConfirm?: (value: TimeValue) => void; // OK
  value?: TimeValue; // default { hours: 12, minutes: 0 }
}

// All text lives in `labels` — each key optional, English defaults shown.
interface TimePickerLabels {
  supporting?: ReactNode; // "Select time"
  cancel?: ReactNode; // "Cancel"
  confirm?: ReactNode; // "OK"
  am?: string; // "AM"
  pm?: string; // "PM"
  switchToDial?: string; // aria (input→dial toggle)
  switchToInput?: string; // aria (dial→input toggle)
  hour?: string; // aria "Hour"
  minute?: string; // aria "Minute"
}
```

## Example

```tsx
const [open, setOpen] = useState(false);
const [time, setTime] = useState<TimeValue>({hours: 10, minutes: 30});

<Button onClick={() => setOpen(true)}>Pick a time</Button>
<TimePicker
    isVisible={open}
    onClose={() => setOpen(false)}
    onConfirm={setTime}
    value={time}
/>;
```

## Gotchas

- `value.hours` is 24-hour (0–23); the dial/fields display 12-hour with the
  AM/PM selector, which rewrites `hours` by ±12.
- The dial is pointer-driven (tap or drag a number). The keyboard-input
  mode is the accessible path for exact entry.
- Every user-facing string (visible text **and** aria-labels) is in
  `labels`, e.g. `labels={{cancel: "Cancelar", am: "a.m.", pm: "p.m."}}`;
  unset keys keep the English defaults.

## Accepted gaps (criterion)

- 12-hour with AM/PM only; the 24-hour dial (inner ring) is not
  implemented.
- The dial selection is pointer-only; there is no arrow-key rotation of the
  hand (use input mode for keyboard).
