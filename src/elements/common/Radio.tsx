import {ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface RadioProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "children"
> {
  /** Class for the wrapping <label>. */
  className?: string;
  label?: ReactNode;
}

/**
 * M3 radio button: custom-rendered 20px ring + 10px dot with a 40px
 * circular state layer. The native input is the source of truth, so
 * uncontrolled groups (shared `name`) keep native semantics; pass
 * `checked` + `onChange` for controlled usage.
 */
function Radio({className, disabled, label, ...inputProps}: RadioProps) {
  return (
    <label
      className={cn(
        "inline-flex w-fit cursor-pointer items-center gap-1 select-none",
        disabled && "cursor-not-allowed",
        className,
      )}>
      <span className="relative inline-flex size-10 shrink-0 items-center justify-center">
        <input
          type="radio"
          className="peer absolute inset-0 z-1 size-full cursor-[inherit] appearance-none rounded-full outline-none"
          disabled={disabled}
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
        {/* 20px ring (color swaps in 50ms linear) */}
        <span
          aria-hidden
          className={cn(
            "ease-md-linear pointer-events-none flex size-5 items-center justify-center rounded-full border-2 transition-colors duration-[50ms] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary",
            !disabled &&
              "border-on-surface-variant peer-checked:border-primary",
            disabled && "border-on-surface/38",
          )}
        />
        {/* 10px dot (grows 300ms emphasized-decelerate) */}
        <span
          aria-hidden
          className={cn(
            "radioDot pointer-events-none absolute size-2.5 scale-0 rounded-full opacity-0 peer-checked:scale-100 peer-checked:opacity-100",
            !disabled && "bg-primary",
            disabled && "bg-on-surface/38",
          )}
        />
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

export {Radio};
