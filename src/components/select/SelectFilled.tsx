import {useId} from "react";
import {cn} from "../../utils/helpers";
import {
  FieldIcon,
  FloatingLabel,
  labelColor,
  SupportingText,
} from "../text-field/_fieldShared";
import {
  SelectCaret,
  SelectMenu,
  useSelect,
  type SelectBaseProps,
  type SelectOption,
} from "./_selectShared";

export type {SelectOption};
export type SelectFilledProps = SelectBaseProps;

/**
 * M3 filled select: the filled text field anatomy (height 56, shape
 * extra-small on the top corners, surface-container-highest, floating label,
 * active indicator) opening an options menu with the @material/web animation.
 * Controllable via `value` + `onChange`; keyboard navigation and 200ms
 * typeahead included.
 */
function SelectFilled({
  className,
  defaultValue,
  disabled,
  error,
  errorText,
  id,
  label,
  leftElement,
  name,
  onChange,
  options,
  supportingText,
  value: valueProp,
}: SelectFilledProps) {
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const {
    commit,
    exiting,
    focused,
    handleKeyDown,
    highlighted,
    isOpen,
    mounted,
    openMenu,
    selectedIndex,
    setFocused,
    setHighlighted,
    setIsOpen,
    value,
    wrapper,
  } = useSelect({
    defaultValue,
    disabled,
    onChange,
    options,
    value: valueProp,
  });
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const active = focused || isOpen;
  const floating = active || Boolean(selected);
  const describedById =
    (error && errorText) || supportingText ? `${autoId}-support` : undefined;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative" ref={wrapper}>
        <div className="group relative flex h-14 w-full overflow-hidden rounded-t-extra-small">
          {leftElement ? (
            <FieldIcon className="top-1/2 left-3 z-10 -translate-y-1/2">
              {leftElement}
            </FieldIcon>
          ) : null}
          <button
            aria-activedescendant={
              isOpen && highlighted >= 0
                ? `${autoId}-opt-${highlighted}`
                : undefined
            }
            aria-controls={`${autoId}-listbox`}
            aria-describedby={describedById}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={error || undefined}
            className={cn(
              "h-14 w-full cursor-pointer bg-surface-container-highest pr-12 pl-4 text-left text-body-large text-on-surface outline-none disabled:cursor-not-allowed disabled:bg-on-surface/4 disabled:text-on-surface/38",
              label && "pt-5 pb-1",
              leftElement && "pl-12",
            )}
            disabled={disabled}
            id={triggerId}
            onBlur={() => setFocused(false)}
            onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            type="button">
            <span className="block truncate">
              {selected ? (selected.label ?? selected.value) : " "}
            </span>
          </button>
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
              className={labelColor({
                disabled,
                error,
                focused: active,
              })}
              floating={floating}
              floatingClassName={cn(
                "top-2 text-body-small",
                leftElement ? "left-12" : "left-4",
              )}
              htmlFor={triggerId}
              restingClassName={cn(
                "top-1/2 -translate-y-1/2 text-body-large",
                leftElement ? "left-12" : "left-4",
              )}>
              {label}
            </FloatingLabel>
          ) : null}
          <FieldIcon
            className={cn(
              "pointer-events-none top-1/2 right-3 -translate-y-1/2",
              error && "text-error",
              disabled && "text-on-surface/38",
            )}>
            <SelectCaret open={isOpen} />
          </FieldIcon>
        </div>
        {mounted ? (
          <SelectMenu
            baseId={autoId}
            exiting={exiting}
            highlighted={highlighted}
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

export {SelectFilled};
