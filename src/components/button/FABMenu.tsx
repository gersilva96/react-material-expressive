import {MouseEventHandler, ReactNode, useId, useRef, useState} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";

/** FAB menu color sets (md.comp.fab-menu tokens). */
export type FABMenuVariant = "primary" | "secondary" | "tertiary";

/* Trigger colors: closed = the variant container (regular FAB look);
 * open = the saturated close button (primary/on-primary etc.). */
const TRIGGER_COLORS: Record<FABMenuVariant, {closed: string; open: string}> = {
  primary: {
    closed: "bg-primary-container text-on-primary-container",
    open: "bg-primary text-on-primary",
  },
  secondary: {
    closed: "bg-secondary-container text-on-secondary-container",
    open: "bg-secondary text-on-secondary",
  },
  tertiary: {
    closed: "bg-tertiary-container text-on-tertiary-container",
    open: "bg-tertiary text-on-tertiary",
  },
};

export interface FABMenuItemProps {
  className?: string;
  /** Leading icon (24px box, spec menu-item.icon). */
  icon?: ReactNode;
  label?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/** M3 Expressive FAB menu item: a medium-button pill (h 56, title-medium,
 * icon 24) colored by the parent FABMenu set. */
function FABMenuItem({className, icon, label, onClick}: FABMenuItemProps) {
  return (
    <button
      className={cn("fabMenuItem state-layer", className)}
      onClick={onClick}
      type="button">
      {icon ? <Icon iconLeft={icon} size={24} /> : null}
      {label}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={20}
      viewBox="0 0 24 24"
      width={20}>
      <path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z" />
    </svg>
  );
}

export interface FABMenuLabels {
  /** aria-label for the trigger while open. Default "Close menu". */
  close?: string;
  /** aria-label for the trigger while closed. Default "Open menu". */
  open?: string;
}

const FAB_MENU_LABELS: Required<FABMenuLabels> = {
  close: "Close menu",
  open: "Open menu",
};

export interface FABMenuProps {
  /** Menu items (FABMenu.Item list), revealed above the FAB. */
  children?: ReactNode;
  className?: string;
  /** FAB icon while closed (24px box). */
  icon?: ReactNode;
  /** Customizable accessible names for the trigger. */
  labels?: FABMenuLabels;
  variant?: FABMenuVariant;
}

/**
 * M3 Expressive FAB menu: a 56dp FAB that morphs into a fully-round close
 * button (icon crossfades/rotates into an X, container saturates to the
 * set color) and reveals up to six menu-item pills above it, right-aligned
 * and staggered bottom-up (8dp to the FAB, 4dp between items). Items are
 * medium-button pills on the set's container color. Position the wrapper
 * yourself (e.g. fixed bottom-right with 16dp margins per spec).
 */
function FABMenu({
  children,
  className,
  icon,
  labels,
  variant = "primary",
}: FABMenuProps) {
  useRipple();
  const l = {...FAB_MENU_LABELS, ...labels};
  const [isOpen, setIsOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const menuId = useId();
  // 320ms covers the staggered exit (165ms max delay + 150ms animation).
  const {exiting, mounted} = useDismissable(isOpen, 320);

  useOutsideClose(wrapper, () => setIsOpen(false), isOpen);

  return (
    <div
      className={cn(
        "fabMenu relative inline-flex flex-col items-end",
        variant,
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
      ref={wrapper}>
      {mounted ? (
        <div
          className={cn(
            "absolute bottom-full right-0 z-20 mb-2 flex w-max flex-col items-end gap-1",
            exiting ? "fabMenuListOut" : "fabMenuListIn",
          )}
          id={menuId}
          onClick={() => setIsOpen(false)}>
          {children}
        </div>
      ) : null}
      <button
        aria-controls={mounted ? menuId : undefined}
        aria-expanded={isOpen}
        aria-label={isOpen ? l.close : l.open}
        className={cn(
          "fab fabMenuTrigger",
          isOpen ? "rounded-[28px]" : "rounded-large",
          TRIGGER_COLORS[variant][isOpen ? "open" : "closed"],
        )}
        onClick={() => setIsOpen((open) => !open)}
        type="button">
        {/* Crossfade + rotation between the FAB icon and the X. */}
        <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
          <span
            aria-hidden
            className={cn(
              "flex items-center justify-center transition-all duration-[350ms] ease-[var(--md-sys-motion-spring-fast-spatial)]",
              isOpen ? "rotate-90 opacity-0" : "opacity-100",
            )}>
            <Icon icon={icon} size={24} />
          </span>
          <span
            aria-hidden
            className={cn(
              "flex items-center justify-center transition-all duration-[350ms] ease-[var(--md-sys-motion-spring-fast-spatial)]",
              isOpen ? "opacity-100" : "-rotate-90 opacity-0",
            )}>
            <CloseIcon />
          </span>
        </span>
      </button>
    </div>
  );
}

FABMenu.Item = FABMenuItem;

export {FABMenu};
