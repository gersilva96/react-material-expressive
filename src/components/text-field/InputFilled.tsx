import {ChangeEvent, ComponentProps, ReactNode, useId} from "react";
import {cn} from "../../utils/helpers";
import {
  FieldIcon,
  FloatingLabel,
  labelColor,
  SupportingText,
  useFieldState,
} from "./_fieldShared";

export interface InputFilledProps extends Omit<
  ComponentProps<"input">,
  "size"
> {
  /** Class for the wrapper. */
  className?: string;
  error?: boolean;
  errorText?: ReactNode;
  inputClassName?: string;
  /** Floating label. */
  label?: string;
  /** Leading icon (24px box; input pads 48 on that side). */
  leftElement?: ReactNode;
  /** Trailing icon. */
  rightElement?: ReactNode;
  supportingText?: ReactNode;
}

/**
 * M3 filled text field: height 56, shape small on the top corners,
 * surface-container-highest container with an active indicator line. The
 * floating label is driven by focus/value state.
 */
function InputFilled({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  defaultValue,
  disabled,
  error,
  errorText,
  id,
  inputClassName,
  label,
  leftElement,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  rightElement,
  supportingText,
  value,
  ...inputProps
}: InputFilledProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const {focused, hasValue, setFocused, setInternalHasValue} = useFieldState(
    value,
    defaultValue,
    disabled,
  );
  const floating = focused || hasValue;
  const hasSupport = !!((error && errorText) || supportingText);
  const descId = `${inputId}-desc`;
  const describedBy =
    [ariaDescribedBy, hasSupport ? descId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("w-full", className)}>
      <div className="group relative flex h-14 w-full overflow-hidden rounded-t-extra-small">
        {leftElement ? (
          <FieldIcon className="top-1/2 left-3 z-10 -translate-y-1/2">
            {leftElement}
          </FieldIcon>
        ) : null}
        <input
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid ?? (error || undefined)}
          className={cn(
            "h-14 w-full bg-surface-container-highest text-body-large text-on-surface outline-none placeholder:text-on-surface-variant disabled:cursor-not-allowed disabled:bg-on-surface/4 disabled:text-on-surface/38",
            label && "pt-5 pb-1",
            // One padding class per side (never px-4 + pl-13): a consumer's
            // own Tailwind re-emits .px-4 later in the shared utilities layer
            // and would otherwise override the leading-icon inset.
            leftElement ? "pl-13" : "pl-4",
            rightElement ? "pr-13" : "pr-4",
            inputClassName,
          )}
          defaultValue={defaultValue}
          disabled={disabled}
          id={inputId}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInternalHasValue(event.target.value.length > 0);
            onChange?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholder={floating || !label ? placeholder : undefined}
          value={value}
          {...inputProps}
        />
        {/* hover state layer */}
        {!disabled ? (
          <span
            aria-hidden
            className="ease-md-linear pointer-events-none absolute inset-0 bg-on-surface opacity-0 transition-opacity duration-[15ms] group-hover:opacity-8"
          />
        ) : null}
        {/* active indicator */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 transition-all",
            error
              ? "bg-error"
              : focused
                ? "bg-primary"
                : "bg-on-surface-variant",
            // hover darkens the indicator to on-surface (1dp)
            !disabled && !focused && !error && "group-hover:bg-on-surface",
            focused || error ? "h-0.5" : "h-px",
            disabled && "bg-on-surface/38",
          )}
        />
        {label ? (
          <FloatingLabel
            className={labelColor({disabled, error, focused})}
            floating={floating}
            floatingClassName={cn(
              "top-2 text-body-small",
              leftElement ? "left-13" : "left-4",
            )}
            htmlFor={inputId}
            restingClassName={cn(
              "top-1/2 -translate-y-1/2 text-body-large",
              leftElement ? "left-13" : "left-4",
            )}>
            {label}
          </FloatingLabel>
        ) : null}
        {rightElement ? (
          <FieldIcon className="top-1/2 right-3 z-10 -translate-y-1/2">
            {rightElement}
          </FieldIcon>
        ) : null}
      </div>
      <SupportingText
        error={error}
        errorText={errorText}
        id={hasSupport ? descId : undefined}
        supportingText={supportingText}
      />
    </div>
  );
}

export {InputFilled};
