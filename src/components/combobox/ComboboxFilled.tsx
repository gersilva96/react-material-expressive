import {useId} from "react";
import {cn} from "../../utils/helpers";
import {
  FieldIcon,
  FloatingLabel,
  labelColor,
  SupportingText,
} from "../text-field/_fieldShared";
import {
  COMBOBOX_LABELS,
  ComboboxListbox,
  ComboboxTrailing,
  useCombobox,
  type ComboboxBaseProps,
  type ComboboxLabels,
  type ComboboxOption,
} from "./_comboboxShared";

export type {ComboboxLabels, ComboboxOption};
export type ComboboxFilledProps = ComboboxBaseProps;

/**
 * M3 filled combobox: the filled text field anatomy (height 56, shape small on
 * the top corners, surface-container-highest, floating label, active
 * indicator) over an ARIA combobox `<input>` with a portaled listbox. Options
 * are consumer-controlled for async search — type to fire `onInputChange`,
 * then feed the already-filtered `options` back in. Controllable via `value` +
 * `onChange`.
 */
function ComboboxFilled({
  className,
  clearable = true,
  defaultValue,
  disabled,
  error,
  errorText,
  id,
  inputClassName,
  label,
  labels,
  leftElement,
  listboxClassName,
  loading,
  name,
  onChange,
  onInputChange,
  options,
  supportingText,
  value: valueProp,
  ...inputProps
}: ComboboxFilledProps) {
  const l = {...COMBOBOX_LABELS, ...labels};
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const {
    clear,
    commit,
    exiting,
    focused,
    handleKeyDown,
    highlighted,
    input,
    isOpen,
    mounted,
    onType,
    query,
    setFocused,
    setHighlighted,
    setIsOpen,
    value,
    wrapper,
  } = useCombobox({
    defaultValue,
    disabled,
    onChange,
    onInputChange,
    options,
    value: valueProp,
  });

  const active = focused || isOpen;
  const floating = active || query.length > 0;
  const showClear = clearable && query.length > 0 && !disabled;
  const hasOptions = !loading && options.length > 0;
  const describedById =
    (error && errorText) || supportingText ? `${autoId}-support` : undefined;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative" ref={wrapper}>
        <div className="group relative flex h-14 w-full overflow-hidden rounded-t-small">
          {leftElement ? (
            <FieldIcon className="top-1/2 left-3 z-10 -translate-y-1/2">
              {leftElement}
            </FieldIcon>
          ) : null}
          <input
            {...inputProps}
            aria-activedescendant={
              isOpen && hasOptions && highlighted >= 0
                ? `${autoId}-opt-${highlighted}`
                : undefined
            }
            aria-autocomplete={onInputChange ? "list" : "none"}
            aria-controls={
              mounted && hasOptions ? `${autoId}-listbox` : undefined
            }
            aria-describedby={describedById}
            aria-expanded={isOpen}
            aria-invalid={error || undefined}
            autoComplete="off"
            className={cn(
              "h-14 w-full bg-surface-container-highest text-body-large text-on-surface outline-none disabled:cursor-not-allowed disabled:bg-on-surface/4 disabled:text-on-surface/38",
              label ? "pt-5 pb-1" : "",
              leftElement ? "pl-12" : "pl-4",
              showClear ? "pr-20" : "pr-12",
              inputClassName,
            )}
            disabled={disabled}
            id={inputId}
            onBlur={() => setFocused(false)}
            onChange={(event) => onType(event.target.value)}
            onClick={() => {
              if (!disabled) setIsOpen(true);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            ref={input}
            role="combobox"
            type="text"
            value={query}
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
                : active
                  ? "bg-primary"
                  : "bg-on-surface-variant",
              active || error ? "h-0.5" : "h-px",
              disabled && "bg-on-surface/38",
            )}
          />
          {label ? (
            <FloatingLabel
              className={labelColor({disabled, error, focused: active})}
              floating={floating}
              floatingClassName={cn(
                "top-2 text-body-small",
                leftElement ? "left-12" : "left-4",
              )}
              htmlFor={inputId}
              restingClassName={cn(
                "top-1/2 -translate-y-1/2 text-body-large",
                leftElement ? "left-12" : "left-4",
              )}>
              {label}
            </FloatingLabel>
          ) : null}
          <ComboboxTrailing
            clearLabel={l.clear}
            disabled={disabled}
            error={error}
            isOpen={isOpen}
            onClear={clear}
            showClear={showClear}
          />
        </div>
        {mounted ? (
          <ComboboxListbox
            anchorRef={wrapper}
            baseId={autoId}
            emptyText={l.empty}
            exiting={exiting}
            highlighted={highlighted}
            listboxClassName={listboxClassName}
            loading={loading}
            loadingText={l.loading}
            onHighlight={setHighlighted}
            onSelect={commit}
            options={options}
            value={value}
          />
        ) : null}
      </div>
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <SupportingText
        error={error}
        errorText={errorText}
        id={describedById}
        supportingText={supportingText}
      />
    </div>
  );
}

export {ComboboxFilled};
