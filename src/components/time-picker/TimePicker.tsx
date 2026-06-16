import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {cn} from "../../utils/helpers";
import {Button} from "../button/Button";
import {Dialog} from "../dialogs/Dialog";
import {DialogContext} from "../dialogs/_context";
import {IconButton} from "../button/IconButton";

export interface TimeValue {
  /** 0–23. */
  hours: number;
  /** 0–59. */
  minutes: number;
}

export interface TimePickerLabels {
  /** AM period label. Default "AM". */
  am?: string;
  /** Cancel action. Default "Cancel". */
  cancel?: ReactNode;
  /** Confirm/commit action. Default "OK". */
  confirm?: ReactNode;
  /** Hour input aria-label. Default "Hour". */
  hour?: string;
  /** Minute input aria-label. Default "Minute". */
  minute?: string;
  /** PM period label. Default "PM". */
  pm?: string;
  /** Supporting line above the time. Default "Select time". */
  supporting?: ReactNode;
  /** Toggle aria-label while in input mode. Default "Switch to dial". */
  switchToDial?: string;
  /** Toggle aria-label while in dial mode. Default "Switch to keyboard input". */
  switchToInput?: string;
}

const TIME_LABELS: Required<TimePickerLabels> = {
  am: "AM",
  cancel: "Cancel",
  confirm: "OK",
  hour: "Hour",
  minute: "Minute",
  pm: "PM",
  supporting: "Select time",
  switchToDial: "Switch to dial",
  switchToInput: "Switch to keyboard input",
};

export interface TimePickerProps {
  /** Start in keyboard-input mode. */
  input?: boolean;
  isVisible: boolean;
  /** Customizable text and accessible names. */
  labels?: TimePickerLabels;
  onClose: () => void;
  onConfirm?: (value: TimeValue) => void;
  value?: TimeValue;
}

const clockIcon = (
  <svg aria-hidden className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
  </svg>
);
const keyboardIcon = (
  <svg aria-hidden className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
  </svg>
);

// Clock geometry: numbers sit on a 101dp radius inside the 256dp dial.
const DIAL = 256;
const CENTER = DIAL / 2;
const RADIUS = 101;
const to12 = (h: number) => ((h + 11) % 12) + 1;
const point = (unitAngleDeg: number) => {
  const rad = ((unitAngleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
};

/**
 * M3 modal time picker: a clock dial (256dp) with a draggable selector, the
 * big HH:MM time selector, an AM/PM period selector, and a keyboard-input
 * toggle. Container surface-container-high, level 3, extra-large (28).
 */
function TimePicker(props: TimePickerProps) {
  return (
    <Dialog
      className="w-auto max-w-none min-w-0 p-6"
      isVisible={props.isVisible}
      onClose={props.onClose}>
      <TimePickerBody {...props} />
    </Dialog>
  );
}

function TimePickerBody({
  input,
  labels,
  onClose,
  onConfirm,
  value = {hours: 12, minutes: 0},
}: TimePickerProps) {
  const l = {...TIME_LABELS, ...labels};
  const [hours, setHours] = useState(value.hours);
  const [minutes, setMinutes] = useState(value.minutes);
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [inputMode, setInputMode] = useState(!!input);
  const dialRef = useRef<HTMLDivElement>(null);
  // Name the dialog by its supporting line ("Select time").
  const {headlineId, setLabelled} = useContext(DialogContext);
  useEffect(() => {
    setLabelled?.(true);
    return () => setLabelled?.(false);
  }, [setLabelled]);

  const period: "AM" | "PM" = hours < 12 ? "AM" : "PM";
  const setPeriod = (p: "AM" | "PM") => {
    if (p === period) return;
    setHours((h) => (p === "PM" ? (h % 12) + 12 : h % 12));
  };

  const angle = mode === "hour" ? (hours % 12) * 30 : minutes * 6;
  const handle = point(angle);

  const handlePointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.type === "pointermove") return;
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * DIAL;
    const py = ((e.clientY - rect.top) / rect.height) * DIAL;
    let deg = (Math.atan2(py - CENTER, px - CENTER) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    if (mode === "hour") {
      const h12 = Math.round(deg / 30) % 12; // 0..11 (0 == 12 o'clock)
      const next = (h12 === 0 ? 12 : h12) % 12;
      setHours(next + (period === "PM" ? 12 : 0));
    } else {
      setMinutes(Math.round(deg / 6) % 60);
    }
  };

  // Keyboard operation for the dial slider (the input mode is the other
  // keyboard path); arrows step the focused hour/minute with wrap.
  const adjustDial = (delta: number) => {
    if (mode === "hour") {
      const next = ((to12(hours) - 1 + delta + 12) % 12) + 1;
      setHours((next % 12) + (period === "PM" ? 12 : 0));
    } else {
      setMinutes((m) => (m + delta + 60) % 60);
    }
  };
  const handleDialKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      adjustDial(1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      adjustDial(-1);
    }
  };

  const numbers =
    mode === "hour"
      ? Array.from({length: 12}, (_, i) => i + 1) // 1..12
      : Array.from({length: 12}, (_, i) => i * 5); // 0,5,..,55

  return (
    <div className="flex flex-col gap-4">
      <span
        className="text-label-medium text-on-surface-variant"
        id={headlineId}>
        {l.supporting}
      </span>

      <div className="flex items-start gap-5">
        {/* Time selector + period */}
        <div className="flex items-center gap-2">
          {inputMode ? (
            <TimeNumberInput
              label={l.hour}
              max={12}
              min={1}
              onCommit={(v) => setHours((v % 12) + (period === "PM" ? 12 : 0))}
              value={to12(hours)}
            />
          ) : (
            <TimeField
              onClick={() => setMode("hour")}
              selected={mode === "hour"}>
              {String(to12(hours)).padStart(2, "0")}
            </TimeField>
          )}
          <span className="text-display-large text-on-surface">:</span>
          {inputMode ? (
            <TimeNumberInput
              label={l.minute}
              max={59}
              min={0}
              onCommit={(v) => setMinutes(v % 60)}
              value={minutes}
            />
          ) : (
            <TimeField
              onClick={() => setMode("minute")}
              selected={mode === "minute"}>
              {String(minutes).padStart(2, "0")}
            </TimeField>
          )}
        </div>
        {/* AM/PM */}
        <div className="flex h-20 w-13 flex-col overflow-hidden rounded-small border border-outline">
          {(
            [
              ["AM", l.am],
              ["PM", l.pm],
            ] as const
          ).map(([p, label], i) => (
            <button
              aria-pressed={period === p}
              className={cn(
                "state-layer flex flex-1 cursor-pointer items-center justify-center text-title-medium",
                i === 0 && "border-b border-outline",
                period === p
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "text-on-surface-variant",
              )}
              key={p}
              onClick={() => setPeriod(p)}
              type="button">
              {label}
            </button>
          ))}
        </div>
      </div>

      {inputMode ? null : (
        /* Clock dial */
        <div
          aria-label={mode === "hour" ? l.hour : l.minute}
          aria-valuemax={mode === "hour" ? 12 : 59}
          aria-valuemin={mode === "hour" ? 1 : 0}
          aria-valuenow={mode === "hour" ? to12(hours) : minutes}
          aria-valuetext={
            mode === "hour"
              ? `${to12(hours)} ${period}`
              : String(minutes).padStart(2, "0")
          }
          className="relative mx-auto my-2 cursor-pointer touch-none rounded-full bg-surface-container-highest outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-secondary"
          onKeyDown={handleDialKey}
          onPointerDown={handlePointer}
          onPointerMove={handlePointer}
          onPointerUp={() => {
            // M3: releasing on an hour advances to minutes.
            if (mode === "hour") setMode("minute");
          }}
          ref={dialRef}
          role="slider"
          style={{height: DIAL, width: DIAL}}
          tabIndex={0}>
          {/* Selector: center dot, track, handle */}
          <svg
            className="pointer-events-none absolute inset-0"
            height={DIAL}
            viewBox={`0 0 ${DIAL} ${DIAL}`}
            width={DIAL}>
            <circle
              cx={CENTER}
              cy={CENTER}
              fill="var(--md-sys-color-primary)"
              r={4}
            />
            <line
              stroke="var(--md-sys-color-primary)"
              strokeWidth={2}
              x1={CENTER}
              x2={handle.x}
              y1={CENTER}
              y2={handle.y}
            />
            <circle
              cx={handle.x}
              cy={handle.y}
              fill="var(--md-sys-color-primary)"
              r={24}
            />
          </svg>
          {numbers.map((n) => {
            const a = mode === "hour" ? (n % 12) * 30 : n * 6;
            const p = point(a);
            const isSel = a === angle;
            return (
              <span
                className={cn(
                  "pointer-events-none absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-body-large",
                  isSel ? "text-on-primary" : "text-on-surface",
                )}
                key={n}
                style={{left: p.x, top: p.y}}>
                {mode === "minute" ? String(n).padStart(2, "0") : n}
              </span>
            );
          })}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <IconButton
          aria-label={inputMode ? l.switchToDial : l.switchToInput}
          icon={inputMode ? clockIcon : keyboardIcon}
          onClick={() => setInputMode((m) => !m)}
          variant="standard"
        />
        <div className="flex gap-2">
          <Button onClick={onClose} variant="text">
            {l.cancel}
          </Button>
          <Button
            onClick={() => {
              onConfirm?.({hours, minutes});
              onClose();
            }}
            variant="text">
            {l.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimeNumberInput({
  label,
  max,
  min,
  onCommit,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onCommit: (v: number) => void;
  value: number;
}) {
  const [text, setText] = useState(String(value).padStart(2, "0"));
  return (
    <input
      aria-label={label}
      className="state-layer h-18 w-24 rounded-small bg-surface-container-highest text-center text-display-medium text-on-surface outline-none focus:bg-primary-container focus:text-on-primary-container focus:-outline-offset-2 focus:outline-2 focus:outline-solid focus:outline-primary"
      inputMode="numeric"
      onBlur={() => {
        const n = Math.min(max, Math.max(min, parseInt(text, 10) || min));
        onCommit(n);
        setText(String(n).padStart(2, "0"));
      }}
      onChange={(e) => setText(e.target.value.replace(/\D/g, "").slice(0, 2))}
      value={text}
    />
  );
}

function TimeField({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "state-layer flex h-20 w-24 cursor-pointer items-center justify-center rounded-small text-display-large tabular-nums",
        selected
          ? "bg-primary-container text-on-primary-container"
          : "bg-surface-container-highest text-on-surface",
      )}
      onClick={onClick}
      type="button">
      {children}
    </button>
  );
}

export {TimePicker};
