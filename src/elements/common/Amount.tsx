import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {useRipple} from "../../utils/_ripple";

export interface AmountLabels {
  /** aria-label for the decrement button. Default "Decrease". */
  decrease?: string;
  /** aria-label for the increment button. Default "Increase". */
  increase?: string;
  /** aria-label for the group. Default "Amount". */
  label?: string;
}

const AMOUNT_LABELS: Required<AmountLabels> = {
  decrease: "Decrease",
  increase: "Increase",
  label: "Amount",
};

export interface AmountProps {
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  /** Customizable accessible names. */
  labels?: AmountLabels;
  max?: number;
  min?: number;
  minusIcon?: ReactNode;
  /** Fires with the next numeric value. */
  onChange?: (value: number) => void;
  plusIcon?: ReactNode;
  step?: number;
  value?: number;
}

function MinusIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={18}
      viewBox="0 0 24 24"
      width={18}>
      <path d="M5 11h14v2H5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={18}
      viewBox="0 0 24 24"
      width={18}>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
    </svg>
  );
}

/**
 * Quantity stepper. Controllable: pass `value` + `onChange`, or let it
 * manage internal state seeded by `defaultValue` (uncontrolled fallback).
 */
function Amount({
  className,
  defaultValue,
  disabled,
  labels,
  max,
  min = 0,
  minusIcon,
  onChange,
  plusIcon,
  step = 1,
  value: valueProp,
}: AmountProps) {
  useRipple();
  const l = {...AMOUNT_LABELS, ...labels};
  const [value, setValue] = useControlled(valueProp, defaultValue ?? min);

  const update = (next: number) => {
    const clamped = Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min, next),
    );
    if (clamped === value) return;
    setValue(clamped);
    onChange?.(clamped);
  };

  const buttonClass =
    "iconBtn standard m-0.5 size-8 rounded-[6px] before:hidden";

  return (
    <div
      aria-label={l.label}
      className={cn(
        "flex w-fit items-center rounded-small bg-surface-container-high",
        className,
      )}
      role="group">
      <button
        aria-label={l.decrease}
        className={buttonClass}
        disabled={disabled || value - step < min}
        onClick={() => update(value - step)}
        type="button">
        {minusIcon ?? <MinusIcon />}
      </button>
      <div
        aria-live="polite"
        className={cn(
          "flex min-w-6 items-center justify-center px-0.5 text-body-medium text-on-surface tabular-nums",
          disabled && "text-on-surface/38",
        )}>
        {value}
      </div>
      <button
        aria-label={l.increase}
        className={buttonClass}
        disabled={disabled || (max !== undefined && value + step > max)}
        onClick={() => update(value + step)}
        type="button">
        {plusIcon ?? <PlusIcon />}
      </button>
    </div>
  );
}

export {Amount};
