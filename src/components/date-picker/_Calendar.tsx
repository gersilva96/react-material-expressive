import {useMemo, useState} from "react";
import {cn} from "../../utils/helpers";
import {
  addMonths,
  buildMonthMatrix,
  formatDayLabel,
  formatMonthYear,
  isSameDay,
  isWithin,
  startOfDay,
  weekdayLabels,
} from "./_dateUtils";

export interface CalendarLabels {
  /** aria-label for the next-month button. Default "Next month". */
  nextMonth?: string;
  /** aria-label for the previous-month button. Default "Previous month". */
  previousMonth?: string;
  /** aria-label for the year-grid toggle. Default "Select year". */
  selectYear?: string;
}

export interface CalendarProps {
  /** Accessible names for the calendar controls. */
  labels?: CalendarLabels;
  locale?: string;
  max?: Date | null;
  min?: Date | null;
  /** A day was activated. */
  onSelect: (date: Date) => void;
  /** Range endpoints (range mode). */
  rangeEnd?: Date | null;
  rangeStart?: Date | null;
  /** Highlight days between the range endpoints. */
  range?: boolean;
  /** Selected day (single mode). */
  value?: Date | null;
  /** 0 = Sunday … 6 = Saturday. */
  weekStartsOn?: number;
}

const chevron = (d: "left" | "right" | "down") => (
  <svg
    aria-hidden
    className={cn("h-6 w-6 fill-current", d === "down" && "h-5 w-5")}
    viewBox="0 0 24 24">
    {d === "left" ? (
      <path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4-4.6-4.6z" />
    ) : d === "right" ? (
      <path d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4 4.6-4.6z" />
    ) : (
      <path d="m7 10 5 5 5-5z" />
    )}
  </svg>
);

/**
 * The M3 calendar core: a month grid with navigation and a year picker.
 * Presentational and controllable — the parent owns the selected value(s)
 * and is notified via `onSelect`. Shared by the modal and docked pickers.
 */
function Calendar({
  labels,
  locale,
  max,
  min,
  onSelect,
  range,
  rangeEnd = null,
  rangeStart = null,
  value = null,
  weekStartsOn = 0,
}: CalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const seed = value ?? rangeStart ?? today;
  const [display, setDisplay] = useState(
    () => new Date(seed.getFullYear(), seed.getMonth(), 1),
  );
  const [yearView, setYearView] = useState(false);

  const weekdays = useMemo(
    () => weekdayLabels(weekStartsOn, locale),
    [weekStartsOn, locale],
  );
  const cells = useMemo(
    () =>
      buildMonthMatrix(display.getFullYear(), display.getMonth(), weekStartsOn),
    [display, weekStartsOn],
  );

  const minDay = min ? startOfDay(min) : null;
  const maxDay = max ? startOfDay(max) : null;
  const isDisabled = (d: Date) =>
    (minDay != null && d < minDay) || (maxDay != null && d > maxDay);

  const years = useMemo(() => {
    const base = display.getFullYear();
    return Array.from({length: 24}, (_, i) => base - 10 + i);
  }, [display]);

  return (
    <div className="flex flex-col px-3">
      {/* Month/year navigation */}
      <div className="flex h-14 items-center justify-between">
        <button
          aria-label={labels?.selectYear ?? "Select year"}
          className="state-layer flex h-9 cursor-pointer items-center gap-1 rounded-full pr-2 pl-3 text-label-large text-on-surface-variant"
          onClick={() => setYearView((v) => !v)}
          type="button">
          {formatMonthYear(display, locale)}
          <span
            className={cn(
              "transition-transform duration-200",
              yearView && "rotate-180",
            )}>
            {chevron("down")}
          </span>
        </button>
        <div className={cn("flex gap-1", yearView && "invisible")}>
          <button
            aria-label={labels?.previousMonth ?? "Previous month"}
            className="state-layer flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-on-surface-variant"
            onClick={() => setDisplay((d) => addMonths(d, -1))}
            type="button">
            {chevron("left")}
          </button>
          <button
            aria-label={labels?.nextMonth ?? "Next month"}
            className="state-layer flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-on-surface-variant"
            onClick={() => setDisplay((d) => addMonths(d, 1))}
            type="button">
            {chevron("right")}
          </button>
        </div>
      </div>

      {yearView ? (
        <div className="grid max-h-[268px] grid-cols-3 gap-0 overflow-y-auto py-4">
          {years.map((year) => {
            const selected = display.getFullYear() === year;
            return (
              <div className="flex items-center justify-center py-1" key={year}>
                <button
                  aria-pressed={selected}
                  className={cn(
                    "state-layer flex h-9 w-18 cursor-pointer items-center justify-center rounded-full text-body-large",
                    selected
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant",
                  )}
                  onClick={() => {
                    setDisplay((d) => new Date(year, d.getMonth(), 1));
                    setYearView(false);
                  }}
                  type="button">
                  {year}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Weekday labels */}
          <div className="grid grid-cols-7">
            {weekdays.map((w, i) => (
              <div
                className="flex h-12 items-center justify-center text-body-large text-on-surface"
                key={i}>
                {w}
              </div>
            ))}
          </div>
          {/* Days are individually-labelled buttons reachable by
           * Tab; no role="grid" (that would require a full grid
           * keyboard model the picker does not implement). */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (!d) return <div className="h-12" key={i} />;
              const disabled = isDisabled(d);
              const isStart = isSameDay(d, rangeStart);
              const isEnd = isSameDay(d, rangeEnd);
              const selected = range ? isStart || isEnd : isSameDay(d, value);
              const between =
                range && isWithin(d, rangeStart ?? null, rangeEnd ?? null);
              const isToday = isSameDay(d, today);
              return (
                <div
                  className="relative flex h-12 items-center justify-center"
                  key={i}>
                  {/* Range band */}
                  {(between ||
                    (range &&
                      (isStart || isEnd) &&
                      rangeStart &&
                      rangeEnd &&
                      !isSameDay(rangeStart, rangeEnd))) && (
                    <span
                      className={cn(
                        "absolute h-10 bg-secondary-container",
                        between && "inset-x-0",
                        isStart && !between && "right-0 left-1/2",
                        isEnd && !between && "right-1/2 left-0",
                      )}
                    />
                  )}
                  <button
                    aria-label={formatDayLabel(d, locale)}
                    aria-pressed={selected}
                    className={cn(
                      "state-layer relative z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-body-large",
                      disabled && "pointer-events-none text-on-surface/38",
                      selected
                        ? "bg-primary text-on-primary"
                        : between
                          ? "text-on-secondary-container"
                          : isToday
                            ? "text-primary ring-1 ring-inset ring-primary"
                            : "text-on-surface",
                    )}
                    disabled={disabled}
                    onClick={() => onSelect(d)}
                    type="button">
                    {d.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export {Calendar};
