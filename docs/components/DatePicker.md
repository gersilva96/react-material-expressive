# DatePicker

M3 date pickers built over the library's `Dialog` / `InputOutlined`
primitives, controllable and presentational (native `Date`, no date
dependency, locale via `Intl`). Three forms:

- **`DatePicker`** — modal calendar (360×568 dialog, surface-container-high,
  level 3, extra-large 28) with a 120dp headline header, month/year
  navigation, a year grid, and a keyboard-input toggle. Selection is drafted
  and committed on **OK**.
- **`DatePicker.Docked`** — an outlined field with a calendar icon that
  opens a dropdown calendar; selection commits immediately.
- **`DateRangePicker`** — modal range picker (first tap sets the start, the
  next the end; the days between highlight in secondary-container).

## Import

```tsx
import {DatePicker, DateRangePicker} from "react-material-expressive";
```

## API

```ts
interface DatePickerProps {
  input?: boolean; // start in keyboard-input mode
  isVisible: boolean;
  labels?: DatePickerLabels; // every user-facing string (see below)
  locale?: string; // Intl locale; default system
  max?: Date | null;
  min?: Date | null;
  onClose: () => void;
  onConfirm?: (date: Date | null) => void; // OK
  value?: Date | null;
  weekStartsOn?: number; // 0 = Sunday … 6 = Saturday (default 0)
}

// All text lives in `labels` — each key optional, English defaults shown.
interface DatePickerLabels {
  supporting?: ReactNode; // "Select date"
  cancel?: ReactNode; // "Cancel"
  confirm?: ReactNode; // "OK"
  inputLabel?: string; // "Date"
  inputPlaceholder?: string; // "mm/dd/yyyy"
  switchToCalendar?: string; // aria (input→calendar toggle)
  switchToInput?: string; // aria (calendar→input toggle)
  previousMonth?: string; // aria "Previous month"
  nextMonth?: string; // aria "Next month"
  selectYear?: string; // aria "Select year"
}

interface DatePickerDockedProps {
  className?: string;
  labels?: DatePickerDockedLabels; // { field, openCalendar, previousMonth, nextMonth, selectYear }
  locale?: string;
  max?: Date | null;
  min?: Date | null;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  weekStartsOn?: number;
}

type DateRange = [Date | null, Date | null];
interface DateRangePickerProps {
  isVisible: boolean;
  // labels: { supporting, cancel, confirm, start, end, previousMonth, nextMonth, selectYear }
  labels?: DateRangePickerLabels;
  locale?: string;
  max?: Date | null;
  min?: Date | null;
  onClose: () => void;
  onConfirm?: (range: DateRange) => void;
  value?: DateRange;
  weekStartsOn?: number;
}
```

## Example

```tsx
const [open, setOpen] = useState(false);
const [date, setDate] = useState<Date | null>(null);

<Button onClick={() => setOpen(true)}>Pick a date</Button>
<DatePicker
    isVisible={open}
    onClose={() => setOpen(false)}
    onConfirm={setDate}
    value={date}
/>;

// Docked
<DatePicker.Docked value={date} onChange={setDate} />;
```

## Gotchas

- The modal drafts the selection internally and only calls `onConfirm` on
  **OK** — Cancel/scrim discards. The docked variant commits on click.
- Weekday labels and the headline are localized via `Intl`; set `locale`
  for a fixed locale, `weekStartsOn` for the first column.
- Every user-facing string (visible text **and** the control aria-labels)
  is in `labels`, e.g. `labels={{cancel: "Cancelar", confirm: "Aceptar"}}`;
  unset keys keep the English defaults.
- `min`/`max` disable out-of-range days.

## Accepted gaps (criterion)

- The range picker uses the standard navigable calendar with in-range
  highlighting rather than the Android full-screen scrolling-months layout.
- Day-grid arrow-key navigation is not implemented (days are buttons; Tab
  reaches them). The input mode covers fast keyboard entry.
