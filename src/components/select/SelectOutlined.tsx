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
} from "./_selectShared";

export type SelectOutlinedProps = SelectBaseProps;

/**
 * M3 outlined select: the outlined text field anatomy (height 56, shape
 * small, fieldset/legend label notch) opening an options menu with the
 * @material/web animation. Controllable via `value` + `onChange`;
 * keyboard navigation and 200ms typeahead included.
 */
function SelectOutlined({
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
}: SelectOutlinedProps) {
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
        <div className="group relative flex h-14 w-full">
          {leftElement ? (
            <FieldIcon className="top-1/2 left-3 -translate-y-1/2">
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
              "h-14 w-full cursor-pointer bg-transparent pr-12 pl-4 text-left text-body-large text-on-surface outline-none disabled:cursor-not-allowed disabled:text-on-surface/38",
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
              {selected ? (selected.label ?? selected.value) : " "}
            </span>
          </button>
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
              className={labelColor({
                disabled,
                error,
                focused: active,
              })}
              floating={floating}
              floatingClassName="top-0 left-3 -translate-y-1/2 px-1 text-body-small"
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

export {SelectOutlined};
