import {ChangeEvent, ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface CheckboxProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "children"
> {
  /** Class for the wrapping <label>. */
  className?: string;
  /** Class for the visual box. */
  inputClassName?: string;
  label?: ReactNode;
}

/**
 * M3 checkbox: custom-rendered 18x18 box (2px shape, 2px outline) with a
 * 40px circular state layer. Controlled via `checked` + `onChange` or
 * uncontrolled via `defaultChecked` — the native input is the source of
 * truth, so group semantics behave exactly like the platform's.
 */
function Checkbox({
  className,
  disabled,
  inputClassName,
  label,
  onChange,
  ...inputProps
}: CheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
  };

  return (
    <label
      className={cn(
        "inline-flex w-fit cursor-pointer items-center gap-1 select-none",
        disabled && "cursor-not-allowed",
        className,
      )}>
      <span className="relative inline-flex size-10 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 z-1 size-full cursor-[inherit] appearance-none rounded-full outline-none"
          disabled={disabled}
          onChange={handleChange}
          {...inputProps}
        />
        {/* state layer (40px) */}
        <span
          aria-hidden
          className={cn(
            "peerLayer pointer-events-none absolute inset-0 rounded-full bg-on-surface opacity-0 peer-checked:bg-primary",
            !disabled &&
              "peer-hover:opacity-8 peer-focus-visible:opacity-12 peer-active:opacity-12",
          )}
        />
        {/* 18x18 container, 2px shape, 2px outline; colors swap in
         * 50ms linear, the mark draws via .checkDraw (350/150ms). */}
        <span
          aria-hidden
          className={cn(
            "ease-md-linear pointer-events-none flex size-[18px] items-center justify-center rounded-[2px] border-2 transition-colors duration-[50ms] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary",
            !disabled &&
              "border-on-surface-variant text-on-primary peer-checked:border-primary peer-checked:bg-primary",
            disabled &&
              "border-on-surface/38 text-surface peer-checked:border-transparent peer-checked:bg-on-surface/38",
            inputClassName,
          )}>
          {/* shrink-0: the 18px viewBox must render 1:1, not get
           * squeezed to the 14px content box by the 2px border (it
           * is the full-container icon, like @material/web's). */}
          <svg
            aria-hidden
            className="shrink-0"
            fill="none"
            height={18}
            viewBox="0 0 18 18"
            width={18}>
            <path
              className="checkDraw"
              d="M3.8 9.3 7.2 12.7 14.2 5.7"
              pathLength={1}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </span>
      </span>
      {label ? (
        <span
          className={cn(
            "text-body-medium text-on-surface",
            disabled && "text-on-surface/38",
          )}>
          {label}
        </span>
      ) : null}
    </label>
  );
}

export {Checkbox};
