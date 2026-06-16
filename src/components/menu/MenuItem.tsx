import {MouseEvent, MouseEventHandler, ReactNode, useContext} from "react";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {Badge} from "../badge/Badge";
import {MenuContext} from "./_context";

export interface MenuItemProps {
  /** Trailing error badge; pass a string for the count/label. */
  badge?: boolean | string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  /** Keep the menu open after activation (e.g. a multi-select toggle). */
  keepOpen?: boolean;
  label?: ReactNode;
  leftElement?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Trailing meta — shortcut text (label-large) or a 20px icon. */
  rightElement?: ReactNode;
  /** Selected: tertiary-container fill + corner-medium morph (M3E). */
  selected?: boolean;
}

/**
 * M3E vertical-menu item: 48 tall, inset state layer (44, corner
 * extra-small) with label-large, 20dp leading/trailing icons, 12dp
 * padding. First/last items round their outer corner toward the menu;
 * selected morphs the state layer to corner-medium with a tertiary fill.
 */
function MenuItem({
  badge,
  children,
  className,
  disabled,
  keepOpen,
  label,
  leftElement,
  onClick,
  rightElement,
  selected,
}: MenuItemProps) {
  useRipple();
  const {vibrant, closeAll} = useContext(MenuContext);

  const labelColor = selected
    ? vibrant
      ? "text-on-tertiary"
      : "text-on-tertiary-container"
    : vibrant
      ? "text-on-tertiary-container"
      : "text-on-surface";
  const iconColor = selected
    ? vibrant
      ? "text-on-tertiary"
      : "text-on-tertiary-container"
    : vibrant
      ? "text-on-tertiary-container"
      : "text-on-surface-variant";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!keepOpen) closeAll();
  };

  return (
    <button
      aria-disabled={disabled || undefined}
      className={cn(
        // The button IS the inset state layer. First/last items round
        // their outer corner to corner-medium (12) — concentric with
        // the menu's corner-large (16) at the 4dp inset; selected
        // morphs every corner to corner-medium with a tertiary fill.
        "state-layer mx-1 my-0.5 flex h-11 items-center gap-2 px-3 text-left text-label-large first:rounded-t-medium last:rounded-b-medium disabled:cursor-not-allowed disabled:text-on-surface/38",
        selected
          ? cn(
              "rounded-medium",
              vibrant ? "bg-tertiary" : "bg-tertiary-container",
            )
          : "rounded-extra-small",
        labelColor,
        !disabled && "cursor-pointer",
        className,
      )}
      disabled={disabled}
      onClick={handleClick}
      role="menuitem"
      tabIndex={-1}
      type="button">
      {leftElement ? (
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center leading-none",
            iconColor,
            disabled && "text-on-surface/38",
          )}>
          {leftElement}
        </span>
      ) : null}
      <span className="min-w-px flex-1" data-menu-label>
        {label ?? children}
      </span>
      {badge || rightElement ? (
        <span
          className={cn(
            "flex shrink-0 items-center gap-2 text-label-large",
            iconColor,
            disabled && "text-on-surface/38",
          )}>
          {badge ? (
            <Badge text={typeof badge === "string" ? badge : ""} />
          ) : null}
          {rightElement}
        </span>
      ) : null}
    </button>
  );
}

export {MenuItem};
