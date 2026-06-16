import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {SLIDER_SIZES, SliderSize} from "./_sliderSizes";

export interface SliderLabels {
  /** Accessible name (aria-label) for the range input. Default "Slider". */
  label?: string;
}

const SLIDER_LABELS: Required<SliderLabels> = {label: "Slider"};

export interface SliderProps {
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  /** Inset leading icon for the thick M3E sizes (`m`/`l`/`xl`); two-toned
   * to follow the track (on-primary over active, on-secondary-container
   * over inactive). */
  icon?: ReactNode;
  /** Customizable accessible name. */
  labels?: SliderLabels;
  max?: number;
  min?: number;
  /** Fires with the next numeric value. */
  onChange?: (value: number) => void;
  /** Show the value indicator on hover/drag. Default true. */
  showLabel?: boolean;
  /** M3E track size: `xs` (default), `s`, `m`, `l`, `xl`. */
  size?: SliderSize;
  step?: number;
  /** Suffix rendered inside the value indicator. */
  tooltipChildren?: ReactNode;
  value?: number;
}

/**
 * M3 Expressive continuous slider: inset track with a 6px gap around the 4dp
 * handle, an on-secondary-container stop indicator on the inactive track and
 * a 44×48 inverse-surface value indicator on hover/drag. `size` selects the
 * track scale (xs–xl); the thick sizes (m/l/xl) host an optional inset
 * `icon`. Controllable via `value` + `onChange`.
 */
function Slider({
  className,
  defaultValue,
  disabled,
  icon,
  labels,
  max = 100,
  min = 0,
  onChange,
  showLabel = true,
  size = "xs",
  step,
  tooltipChildren,
  value: valueProp,
}: SliderProps) {
  const l = {...SLIDER_LABELS, ...labels};
  const [value, setValue] = useControlled(valueProp, defaultValue ?? min);
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  // Keeps the 4px handle inside the track at both extremes.
  const inset = (0.5 - pct / 100) * 4;
  const center = `${pct}% + ${inset}px`;
  const sz = SLIDER_SIZES[size];

  return (
    <div
      className={cn(
        "relative flex w-full items-center",
        sz.container,
        className,
      )}>
      <input
        aria-label={l.label}
        className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed"
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => {
          const next = Number(event.target.value);
          setValue(next);
          onChange?.(next);
        }}
        step={step}
        type="range"
        value={value}
      />
      {/* inactive track */}
      <div
        className={cn(
          "bg-secondary-container pointer-events-none absolute right-0 rounded-l-[2px]",
          sz.track,
          sz.cornerR,
          disabled && "bg-on-surface/12",
        )}
        style={{
          width: `max(calc(${100 - pct}% - ${inset}px - 8px), 0px)`,
        }}
      />
      {/* inset icon — two layers so it follows the track colour like the
       * stop indicators: this on-secondary-container base shows over the
       * inactive track; the on-primary copy inside the active track below
       * paints over it in the active region. Both sit at the same leading
       * position (10dp, centered) so the split at the active-track edge is
       * seamless. */}
      {icon && sz.icon ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center justify-center leading-none",
            sz.icon,
            disabled ? "text-on-surface/38" : "text-on-secondary-container",
          )}>
          {icon}
        </span>
      ) : null}
      {/* active track (6px gap to the handle). The on-primary inset icon
       * lives INSIDE it (overflow-hidden): it paints over the base copy
       * in the active region and is clipped as the track shrinks, so the
       * icon reads on-primary on the active track and on-secondary-
       * container on the inactive one. */}
      <div
        className={cn(
          "bg-primary pointer-events-none absolute left-0 overflow-hidden rounded-r-[2px]",
          sz.track,
          sz.cornerL,
          disabled && "bg-on-surface/38",
        )}
        style={{
          width: `max(calc(${center} - 8px), 0px)`,
        }}>
        {icon && sz.icon ? (
          <span
            aria-hidden
            className={cn(
              "absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center justify-center leading-none",
              sz.icon,
              disabled ? "text-on-surface/38" : "text-on-primary",
            )}>
            {icon}
          </span>
        ) : null}
      </div>
      {/* stop indicator: sits on the inactive track, so it takes
       * on-secondary-container; 6dp from the trailing end */}
      <span
        aria-hidden
        className={cn(
          "bg-on-secondary-container pointer-events-none absolute right-1.5 size-1 rounded-full",
          disabled && "bg-on-surface/38",
        )}
      />
      {/* handle (4dp wide, height per size, narrowing to 2 pressed) */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute w-1 -translate-x-1/2 rounded-full transition-[width] duration-100 ease-emphasized peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary peer-active:w-0.5",
          sz.handle,
          disabled ? "bg-on-surface/38" : "bg-primary",
        )}
        style={{left: `calc(${center})`}}
      />
      {/* value indicator: 44dp tall, 48dp min-width, label-large, 12dp
       * above the handle (inverse-surface, SliderTokens) */}
      {showLabel && !disabled ? (
        <span
          aria-hidden
          className="bg-inverse-surface pointer-events-none absolute bottom-full mb-3 flex h-11 min-w-12 -translate-x-1/2 items-center justify-center rounded-full px-2 text-label-large text-inverse-on-surface opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100 peer-active:opacity-100"
          style={{left: `calc(${center})`}}>
          <span className="relative flex items-center gap-0.5">
            {value}
            {tooltipChildren}
          </span>
        </span>
      ) : null}
    </div>
  );
}

export {Slider};
