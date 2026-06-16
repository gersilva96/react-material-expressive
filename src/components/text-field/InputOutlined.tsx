import {ChangeEvent, ComponentProps, ReactNode, useId} from "react";
import {cn} from "../../utils/helpers";
import {
  FieldIcon,
  FloatingLabel,
  labelColor,
  SupportingText,
  useFieldState,
} from "./_fieldShared";

export interface InputOutlinedProps extends Omit<
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
 * M3 outlined text field: height 56, shape small, body-large input. The
 * floating label is driven by focus/value state and notches the outline
 * via fieldset/legend (works on any background).
 */
function InputOutlined({
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
}: InputOutlinedProps) {
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
      <div className="group relative flex h-14 w-full">
        {leftElement ? (
          <FieldIcon className="top-1/2 left-3 -translate-y-1/2">
            {leftElement}
          </FieldIcon>
        ) : null}
        <input
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid ?? (error || undefined)}
          className={cn(
            "h-14 w-full bg-transparent text-body-large text-on-surface outline-none placeholder:text-on-surface-variant disabled:cursor-not-allowed disabled:text-on-surface/38",
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
        {/* outline with label notch */}
        <fieldset
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 m-0 min-w-0 rounded-extra-small px-2 transition-colors",
            error
              ? focused
                ? "border-2 border-error"
                : "border border-error"
              : focused
                ? "border-2 border-primary"
                : "border border-outline group-hover:border-on-surface",
            disabled && "border-on-surface/12 group-hover:border-on-surface/12",
          )}>
          {label ? (
            <legend
              className={cn(
                "invisible h-0 px-0 text-body-small whitespace-nowrap transition-all",
                floating ? "max-w-full px-1" : "max-w-0",
              )}>
              {label}
            </legend>
          ) : null}
        </fieldset>
        {label ? (
          <FloatingLabel
            className={labelColor({disabled, error, focused})}
            floating={floating}
            floatingClassName="top-0 left-3 -translate-y-1/2 px-1 text-body-small"
            htmlFor={inputId}
            restingClassName={cn(
              "top-1/2 -translate-y-1/2 text-body-large",
              leftElement ? "left-13" : "left-4",
            )}>
            {label}
          </FloatingLabel>
        ) : null}
        {rightElement ? (
          <FieldIcon className="top-1/2 right-3 -translate-y-1/2">
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

export {InputOutlined};
