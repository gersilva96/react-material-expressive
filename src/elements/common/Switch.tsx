import {ChangeEvent, ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";

export interface SwitchProps extends Omit<
  ComponentProps<"input">,
  "type" | "size" | "children" | "checked" | "defaultChecked"
> {
  checked?: boolean;
  /** Class for the wrapping <label>. */
  className?: string;
  defaultChecked?: boolean;
  /** Icon shown inside the handle when selected (M3 "with icon": the
   * handle grows to 24 and the icon renders at 16). */
  icon?: ReactNode;
  label?: ReactNode;
  /** Optional icon for the unselected handle. */
  uncheckedIcon?: ReactNode;
}

/**
 * M3 switch: 52x32 track (2px outline), handle 16↔24 (28 pressed), 40px
 * state layer. Controllable: `checked` + `onChange`, or uncontrolled via
 * `defaultChecked` (internal state through useControlled).
 */
function Switch({
  checked: checkedProp,
  className,
  defaultChecked,
  disabled,
  icon,
  label,
  onChange,
  uncheckedIcon,
  ...inputProps
}: SwitchProps) {
  const [checked, setChecked] = useControlled(
    checkedProp,
    defaultChecked ?? false,
  );
  const hasIcon = Boolean(icon || uncheckedIcon);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <label
      className={cn(
        "group inline-flex w-fit cursor-pointer items-center gap-3 select-none",
        disabled && "cursor-not-allowed",
        className,
      )}>
      <span className="relative h-8 w-13 shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer absolute inset-0 z-1 m-0 size-full cursor-[inherit] appearance-none rounded-full outline-none"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          {...inputProps}
        />
        {/* track 52x32, outline 2 */}
        <span
          aria-hidden
          className={cn(
            "switchTrack absolute inset-0 rounded-full border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary",
            !disabled &&
              (checked
                ? "border-primary bg-primary"
                : "border-outline bg-surface-container-highest"),
            disabled &&
              (checked
                ? "border-transparent bg-on-surface/12"
                : "border-on-surface/12 bg-surface-variant/12"),
          )}
        />
        {/* state layer 40, centered on the handle */}
        <span
          aria-hidden
          className={cn(
            "switchLayer pointer-events-none absolute top-1/2 size-10 -translate-y-1/2 rounded-full opacity-0",
            checked ? "left-4 bg-primary" : "-left-1 bg-on-surface",
            !disabled &&
              "peer-hover:opacity-8 peer-focus-visible:opacity-12 peer-active:opacity-12",
          )}
        />
        {/* handle 16 ↔ 24 (28 pressed; 24 with icon) */}
        <span
          aria-hidden
          className={cn(
            "switchHandle pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full",
            checked
              ? "left-6 size-6"
              : hasIcon
                ? "left-1 size-6"
                : "left-2 size-4",
            !disabled &&
              (checked
                ? "bg-on-primary text-on-primary-container peer-hover:bg-primary-container peer-focus-visible:bg-primary-container peer-active:bg-primary-container"
                : "bg-outline text-surface-container-highest peer-hover:bg-on-surface-variant peer-focus-visible:bg-on-surface-variant peer-active:bg-on-surface-variant"),
            !disabled &&
              (checked
                ? "group-active:left-[22px] group-active:size-7"
                : "group-active:left-0.5 group-active:size-7"),
            disabled &&
              (checked
                ? "bg-surface text-on-surface/38"
                : "bg-on-surface/38 text-surface-container-highest"),
          )}>
          {hasIcon ? (
            <span className="flex size-4 items-center justify-center leading-none">
              {checked ? icon : uncheckedIcon}
            </span>
          ) : null}
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

export {Switch};
