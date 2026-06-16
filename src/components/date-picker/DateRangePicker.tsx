import {ReactNode, useContext, useEffect, useState} from "react";
import {Button} from "../button/Button";
import {Dialog} from "../dialogs/Dialog";
import {DialogContext} from "../dialogs/_context";
import {Calendar, type CalendarLabels} from "./_Calendar";
import {formatHeadline, isBefore} from "./_dateUtils";

export type DateRange = [Date | null, Date | null];

export interface DateRangePickerLabels extends CalendarLabels {
  /** Cancel action. Default "Cancel". */
  cancel?: ReactNode;
  /** Confirm/commit action. Default "OK". */
  confirm?: ReactNode;
  /** Placeholder for an unset end date. Default "End". */
  end?: string;
  /** Placeholder for an unset start date. Default "Start". */
  start?: string;
  /** Supporting line above the headline. Default "Select range". */
  supporting?: ReactNode;
}

const RANGE_LABELS: Required<DateRangePickerLabels> = {
  cancel: "Cancel",
  confirm: "OK",
  end: "End",
  nextMonth: "Next month",
  previousMonth: "Previous month",
  selectYear: "Select year",
  start: "Start",
  supporting: "Select range",
};

export interface DateRangePickerProps {
  isVisible: boolean;
  labels?: DateRangePickerLabels;
  locale?: string;
  max?: Date | null;
  min?: Date | null;
  onClose: () => void;
  /** Commit (OK button). */
  onConfirm?: (range: DateRange) => void;
  value?: DateRange;
  weekStartsOn?: number;
}

/**
 * M3 modal date range picker: drafts a start/end pair (first tap sets the
 * start, the next sets the end) with the days between highlighted in
 * secondary-container, committed on OK. (The Android full-screen scrolling-
 * months layout is simplified to the standard navigable calendar.)
 */
function DateRangePicker(props: DateRangePickerProps) {
  return (
    <Dialog
      className="w-90 max-w-none min-w-0 gap-0 p-0"
      isVisible={props.isVisible}
      onClose={props.onClose}>
      <DateRangeBody {...props} />
    </Dialog>
  );
}

function DateRangeBody({
  labels,
  locale,
  max,
  min,
  onClose,
  onConfirm,
  value = [null, null],
  weekStartsOn,
}: DateRangePickerProps) {
  const l = {...RANGE_LABELS, ...labels};
  const [start, setStart] = useState<Date | null>(value[0]);
  const [end, setEnd] = useState<Date | null>(value[1]);
  // Name the dialog by its supporting line ("Select range").
  const {headlineId, setLabelled} = useContext(DialogContext);
  useEffect(() => {
    setLabelled?.(true);
    return () => setLabelled?.(false);
  }, [setLabelled]);

  const select = (d: Date) => {
    // No start, or a complete range exists → begin a new range.
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
      return;
    }
    // Have a start, picking the end.
    if (isBefore(d, start)) {
      setStart(d);
      setEnd(null);
    } else {
      setEnd(d);
    }
  };

  const headline =
    start && end
      ? `${formatHeadline(start, locale)} – ${formatHeadline(end, locale)}`
      : start
        ? `${formatHeadline(start, locale)} – ${l.end}`
        : `${l.start} – ${l.end}`;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1 px-6 pt-4 pb-3">
        <span
          className="text-label-large text-on-surface-variant"
          id={headlineId}>
          {l.supporting}
        </span>
        <h2 className="text-title-large text-on-surface-variant">{headline}</h2>
      </div>
      <div className="h-px w-full bg-outline-variant" />
      <div className="min-h-[300px] py-2">
        <Calendar
          labels={l}
          locale={locale}
          max={max}
          min={min}
          onSelect={select}
          range
          rangeEnd={end}
          rangeStart={start}
          weekStartsOn={weekStartsOn}
        />
      </div>
      <div className="flex justify-end gap-2 px-6 pt-2 pb-4">
        <Button onClick={onClose} variant="text">
          {l.cancel}
        </Button>
        <Button
          onClick={() => {
            onConfirm?.([start, end]);
            onClose();
          }}
          variant="text">
          {l.confirm}
        </Button>
      </div>
    </div>
  );
}

export {DateRangePicker};
