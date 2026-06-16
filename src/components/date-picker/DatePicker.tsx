import {ReactNode, useContext, useEffect, useId, useRef, useState} from "react";
import {cn} from "../../utils/helpers";
import {Button} from "../button/Button";
import {Dialog} from "../dialogs/Dialog";
import {DialogContext} from "../dialogs/_context";
import {IconButton} from "../button/IconButton";
import {InputOutlined} from "../text-field/InputOutlined";
import {useOutsideClose} from "../_useOutsideClose";
import {Calendar, type CalendarLabels} from "./_Calendar";
import {formatHeadline, formatShort, startOfDay} from "./_dateUtils";

const calendarIcon = (
  <svg aria-hidden className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
  </svg>
);
const editIcon = (
  <svg aria-hidden className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

export interface DatePickerLabels extends CalendarLabels {
  /** Cancel action. Default "Cancel". */
  cancel?: ReactNode;
  /** Confirm/commit action. Default "OK". */
  confirm?: ReactNode;
  /** Field label in keyboard-input mode. Default "Date". */
  inputLabel?: string;
  /** Field placeholder in keyboard-input mode. Default "mm/dd/yyyy". */
  inputPlaceholder?: string;
  /** Supporting line above the headline. Default "Select date". */
  supporting?: ReactNode;
  /** Toggle aria-label while in input mode. Default "Switch to calendar". */
  switchToCalendar?: string;
  /** Toggle aria-label while in calendar mode. Default "Switch to keyboard input". */
  switchToInput?: string;
}

const DATE_LABELS: Required<DatePickerLabels> = {
  cancel: "Cancel",
  confirm: "OK",
  inputLabel: "Date",
  inputPlaceholder: "mm/dd/yyyy",
  nextMonth: "Next month",
  previousMonth: "Previous month",
  selectYear: "Select year",
  supporting: "Select date",
  switchToCalendar: "Switch to calendar",
  switchToInput: "Switch to keyboard input",
};

export interface DatePickerProps {
  /** Start in keyboard-input mode. */
  input?: boolean;
  isVisible: boolean;
  /** Customizable text and accessible names. */
  labels?: DatePickerLabels;
  locale?: string;
  max?: Date | null;
  min?: Date | null;
  onClose: () => void;
  /** Commit (OK button). */
  onConfirm?: (date: Date | null) => void;
  value?: Date | null;
  /** 0 = Sunday … 6 = Saturday. */
  weekStartsOn?: number;
}

/**
 * M3 modal date picker: a 360×568 dialog (surface-container-high, level 3,
 * extra-large 28) with a 120dp headline header, a calendar/year grid and a
 * keyboard-input toggle. Selection is drafted and committed on OK.
 * `DatePicker.Docked` is the field-anchored dropdown variant.
 */
function DatePicker(props: DatePickerProps) {
  return (
    <Dialog
      className="w-90 max-w-none min-w-0 gap-0 p-0"
      isVisible={props.isVisible}
      onClose={props.onClose}>
      <DatePickerBody {...props} />
    </Dialog>
  );
}

// Lives inside the Dialog so it remounts each open, re-seeding the draft.
function DatePickerBody({
  input,
  labels,
  locale,
  max,
  min,
  onClose,
  onConfirm,
  value = null,
  weekStartsOn,
}: DatePickerProps) {
  const l = {...DATE_LABELS, ...labels};
  const [draft, setDraft] = useState<Date | null>(value);
  const [inputMode, setInputMode] = useState(!!input);
  const [text, setText] = useState(formatShort(value, locale));
  // Name the dialog by its supporting line ("Select date").
  const {headlineId, setLabelled} = useContext(DialogContext);
  useEffect(() => {
    setLabelled?.(true);
    return () => setLabelled?.(false);
  }, [setLabelled]);

  const commit = () => {
    onConfirm?.(draft);
    onClose();
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-1 px-6 pt-4 pb-3">
        <span
          className="text-label-large text-on-surface-variant"
          id={headlineId}>
          {l.supporting}
        </span>
        <div className="flex items-end justify-between">
          <h2 className="text-headline-large text-on-surface-variant">
            {draft ? formatHeadline(draft, locale) : "—"}
          </h2>
          <IconButton
            aria-label={inputMode ? l.switchToCalendar : l.switchToInput}
            icon={inputMode ? calendarIcon : editIcon}
            onClick={() => setInputMode((m) => !m)}
            variant="standard"
          />
        </div>
      </div>
      <div className="h-px w-full bg-outline-variant" />

      {/* Body */}
      <div className="min-h-[300px] py-2">
        {inputMode ? (
          <div className="px-6 py-2">
            <InputOutlined
              label={l.inputLabel}
              onChange={(e) => {
                setText(e.target.value);
                const parsed = new Date(e.target.value);
                setDraft(isNaN(parsed.getTime()) ? null : startOfDay(parsed));
              }}
              placeholder={l.inputPlaceholder}
              value={text}
            />
          </div>
        ) : (
          <Calendar
            labels={l}
            locale={locale}
            max={max}
            min={min}
            onSelect={(d) => {
              setDraft(d);
              setText(formatShort(d, locale));
            }}
            value={draft}
            weekStartsOn={weekStartsOn}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 px-6 pt-2 pb-4">
        <Button onClick={onClose} variant="text">
          {l.cancel}
        </Button>
        <Button onClick={commit} variant="text">
          {l.confirm}
        </Button>
      </div>
    </div>
  );
}

export interface DatePickerDockedLabels extends CalendarLabels {
  /** Field label. Default "Date". */
  field?: string;
  /** Calendar-open button aria-label. Default "Open calendar". */
  openCalendar?: string;
}

const DOCKED_LABELS: Required<DatePickerDockedLabels> = {
  field: "Date",
  nextMonth: "Next month",
  openCalendar: "Open calendar",
  previousMonth: "Previous month",
  selectYear: "Select year",
};

export interface DatePickerDockedProps {
  className?: string;
  labels?: DatePickerDockedLabels;
  locale?: string;
  max?: Date | null;
  min?: Date | null;
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  weekStartsOn?: number;
}

/**
 * M3 docked date picker: an outlined field with a calendar icon that opens
 * a dropdown calendar anchored below it. Selection commits immediately.
 */
function DatePickerDocked({
  className,
  labels,
  locale,
  max,
  min,
  onChange,
  value = null,
  weekStartsOn,
}: DatePickerDockedProps) {
  const l = {...DOCKED_LABELS, ...labels};
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const popupId = useId();
  useOutsideClose(ref, () => setOpen(false), open);

  return (
    <div className={cn("relative w-full", className)} ref={ref}>
      <InputOutlined
        inputClassName="cursor-pointer"
        label={l.field}
        onFocus={() => setOpen(true)}
        readOnly
        rightElement={
          <button
            aria-controls={open ? popupId : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={l.openCalendar}
            className="state-layer flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-on-surface-variant"
            onClick={() => setOpen((o) => !o)}
            type="button">
            {calendarIcon}
          </button>
        }
        value={formatShort(value, locale)}
      />
      {open ? (
        <div
          aria-label={l.field}
          className="animate-menu-in absolute top-full left-0 z-40 mt-1 w-90 max-w-[calc(100vw-2rem)] overflow-hidden rounded-large bg-surface-container-high py-2 shadow-mm-3 [--menu-clip-bleed:-24px]"
          id={popupId}
          role="dialog">
          <Calendar
            labels={l}
            locale={locale}
            max={max}
            min={min}
            onSelect={(d) => {
              onChange?.(d);
              setOpen(false);
            }}
            value={value}
            weekStartsOn={weekStartsOn}
          />
        </div>
      ) : null}
    </div>
  );
}

DatePicker.Docked = DatePickerDocked;

export {DatePicker};
