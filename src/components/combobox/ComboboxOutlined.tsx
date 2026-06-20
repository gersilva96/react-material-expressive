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
} from "./_comboboxShared";

export type ComboboxOutlinedProps = ComboboxBaseProps;

/**
 * M3 outlined combobox: the outlined text field anatomy (height 56, shape
 * small, fieldset/legend label notch) over an ARIA combobox `<input>` with a
 * portaled listbox. Options are consumer-controlled for async search — type
 * to fire `onInputChange`, then feed the already-filtered `options` back in.
 * Controllable via `value` + `onChange`.
 */
function ComboboxOutlined({
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
}: ComboboxOutlinedProps) {
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
        <div className="group relative flex h-14 w-full">
          {leftElement ? (
            <FieldIcon className="top-1/2 left-3 -translate-y-1/2">
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
            aria-autocomplete="list"
            aria-controls={
              mounted && hasOptions ? `${autoId}-listbox` : undefined
            }
            aria-describedby={describedById}
            aria-expanded={isOpen}
            aria-invalid={error || undefined}
            autoComplete="off"
            className={cn(
              "h-14 w-full bg-transparent text-body-large text-on-surface outline-none disabled:cursor-not-allowed disabled:text-on-surface/38",
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
          {/* outline with label notch */}
          <fieldset
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 m-0 min-w-0 rounded-small px-2 transition-colors",
              error
                ? active
                  ? "border-2 border-error"
                  : "border border-error"
                : active
                  ? "border-2 border-primary"
                  : "border border-outline group-hover:border-on-surface",
              disabled &&
                "border-on-surface/12 group-hover:border-on-surface/12",
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
              className={labelColor({disabled, error, focused: active})}
              floating={floating}
              floatingClassName="top-0 left-3 -translate-y-1/2 px-1 text-body-small"
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

export {ComboboxOutlined};
