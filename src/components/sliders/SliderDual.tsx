import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {SLIDER_SIZES, SliderSize} from "./_sliderSizes";

export interface SliderDualValue {
  max: number;
  min: number;
}

export interface SliderDualLabels {
  /** Base accessible name; each handle appends its suffix. Default "Range slider". */
  label?: string;
  /** Suffix for the upper handle's aria-label. Default "maximum". */
  maximum?: string;
  /** Suffix for the lower handle's aria-label. Default "minimum". */
  minimum?: string;
}

const SLIDER_DUAL_LABELS: Required<SliderDualLabels> = {
  label: "Range slider",
  maximum: "maximum",
  minimum: "minimum",
};

export interface SliderDualProps {
  className?: string;
  defaultValue?: SliderDualValue;
  disabled?: boolean;
  /** Customizable accessible names. */
  labels?: SliderDualLabels;
  max?: number;
  min?: number;
  /** Fires with the next {min, max} pair. */
  onChange?: (value: SliderDualValue) => void;
  /** Show value indicators on hover/drag. Default true. */
  showLabel?: boolean;
  /** M3E track size: `xs` (default), `s`, `m`, `l`, `xl`. (The inset icon
   * is single-slider only.) */
  size?: SliderSize;
  step?: number;
  /** Suffix rendered inside the value indicators. */
  tooltipChildren?: ReactNode;
  value?: SliderDualValue;
}

const thumbInteractive =
  "pointer-events-none absolute inset-0 size-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-11 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-11 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent";

/**
 * M3 Expressive range slider: 16px inset track, two 4x44 handles with 6px
 * gaps, stop indicators at both ends and inverse-surface value indicators.
 * Controllable via `value` ({min, max}) + `onChange`.
 */
function SliderDual({
  className,
  defaultValue,
  disabled,
  labels,
  max = 100,
  min = 0,
  onChange,
  showLabel = true,
  size = "xs",
  step,
  tooltipChildren,
  value: valueProp,
}: SliderDualProps) {
  const l = {...SLIDER_DUAL_LABELS, ...labels};
  const [val, setVal] = useControlled<SliderDualValue>(
    valueProp,
    defaultValue ?? {max, min},
  );
  const sz = SLIDER_SIZES[size];
  const stepSize = step ?? 1;
  const range = max > min ? max - min : 1;
  const minPct = ((val.min - min) / range) * 100;
  const maxPct = ((val.max - min) / range) * 100;
  // Keeps the 4px handles inside the track at the extremes.
  const inset = (pct: number) => (0.5 - pct / 100) * 4;
  const center = (pct: number) => `${pct}% + ${inset(pct)}px`;

  const update = (next: SliderDualValue) => {
    setVal(next);
    onChange?.(next);
  };

  const indicator = (pct: number, value: number, peer: string) => (
    <span
      aria-hidden
      className={cn(
        // Expressive value indicator: 44dp tall, 48dp min-width,
        // label-large, 12dp above the handle (SliderTokens).
        "bg-inverse-surface pointer-events-none absolute bottom-full mb-3 flex h-11 min-w-12 -translate-x-1/2 items-center justify-center rounded-full px-2 text-label-large text-inverse-on-surface opacity-0 transition-opacity",
        peer,
      )}
      style={{left: `calc(${center(pct)})`}}>
      <span className="relative flex items-center gap-0.5">
        {value}
        {tooltipChildren}
      </span>
    </span>
  );

  const handle = (pct: number, peer: string) => (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute w-1 -translate-x-1/2 rounded-full transition-[width] duration-100 ease-emphasized",
        sz.handle,
        disabled ? "bg-on-surface/38" : "bg-primary",
        peer,
      )}
      style={{left: `calc(${center(pct)})`}}
    />
  );

  return (
    <div
      className={cn(
        "relative flex w-full items-center",
        sz.container,
        className,
      )}>
      {/* left inactive track */}
      <div
        className={cn(
          "bg-secondary-container pointer-events-none absolute left-0 rounded-r-[2px]",
          sz.track,
          sz.cornerL,
          disabled && "bg-on-surface/12",
        )}
        style={{
          width: `max(calc(${center(minPct)} - 8px), 0px)`,
        }}
      />
      {/* active segment (6px gap to each handle) */}
      <div
        className={cn(
          "bg-primary pointer-events-none absolute rounded-[2px]",
          sz.track,
          disabled && "bg-on-surface/38",
        )}
        style={{
          left: `calc(${center(minPct)} + 8px)`,
          width: `max(calc(${maxPct - minPct}% + ${inset(maxPct) - inset(minPct)}px - 16px), 0px)`,
        }}
      />
      {/* right inactive track */}
      <div
        className={cn(
          "bg-secondary-container pointer-events-none absolute right-0 rounded-l-[2px]",
          sz.track,
          sz.cornerR,
          disabled && "bg-on-surface/12",
        )}
        style={{
          width: `max(calc(${100 - maxPct}% - ${inset(maxPct)}px - 8px), 0px)`,
        }}
      />
      {/* stop indicators: on the inactive track → on-secondary-container;
       * 6dp from each end */}
      <span
        aria-hidden
        className={cn(
          "bg-on-secondary-container pointer-events-none absolute left-1.5 size-1 rounded-full",
          disabled && "bg-on-surface/38",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "bg-on-secondary-container pointer-events-none absolute right-1.5 size-1 rounded-full",
          disabled && "bg-on-surface/38",
        )}
      />
      <input
        aria-label={`${l.label} ${l.minimum}`}
        className={cn("peer/min z-10 opacity-0", thumbInteractive)}
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => {
          const next = Math.min(Number(event.target.value), val.max - stepSize);
          update({...val, min: next});
        }}
        step={step}
        type="range"
        value={val.min}
      />
      <input
        aria-label={`${l.label} ${l.maximum}`}
        className={cn("peer/max z-10 opacity-0", thumbInteractive)}
        disabled={disabled}
        max={max}
        min={min}
        onChange={(event) => {
          const next = Math.max(Number(event.target.value), val.min + stepSize);
          update({...val, max: next});
        }}
        step={step}
        type="range"
        value={val.max}
      />
      {/* handles (4x44 narrowing to 2 pressed) */}
      {handle(
        minPct,
        "peer-active/min:w-0.5 peer-focus-visible/min:outline-3 peer-focus-visible/min:outline-offset-2 peer-focus-visible/min:outline-secondary",
      )}
      {handle(
        maxPct,
        "peer-active/max:w-0.5 peer-focus-visible/max:outline-3 peer-focus-visible/max:outline-offset-2 peer-focus-visible/max:outline-secondary",
      )}
      {showLabel && !disabled ? (
        <>
          {indicator(
            minPct,
            val.min,
            "peer-hover/min:opacity-100 peer-focus-visible/min:opacity-100 peer-active/min:opacity-100",
          )}
          {indicator(
            maxPct,
            val.max,
            "peer-hover/max:opacity-100 peer-focus-visible/max:opacity-100 peer-active/max:opacity-100",
          )}
        </>
      ) : null}
    </div>
  );
}

export {SliderDual};
