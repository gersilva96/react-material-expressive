import {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import {createPortal} from "react-dom";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {MenuContext} from "./_context";
import {Menu} from "./Menu";
import {useSubmenuPosition} from "./_useSubmenu";

export interface MenuSubProps {
  /** Submenu content (Menu.Item / Menu.Divider / nested Menu.Sub). */
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  label?: ReactNode;
  leftElement?: ReactNode;
}

/* Hover-intent delays (open slightly lazy, close lazier so the pointer can
 * travel from the trigger to the submenu without it collapsing). */
const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 220;

function ChevronRight() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={20}
      viewBox="0 0 24 24"
      width={20}>
      <path d="M9.5 7 14.5 12 9.5 17z" />
    </svg>
  );
}

/**
 * Submenu: a trigger item (trailing chevron) that opens a nested {@link
 * Menu} to its side. The submenu renders in a portal so it escapes the
 * parent surface's clip; it opens on hover (intent) or Right/Enter, closes
 * on Left/Escape (focus returns to the trigger) and a leaf activation
 * dismisses the whole chain (inherited closeAll). The trigger keeps the
 * on-surface state layer while open (the M3E active state).
 */
function MenuSub({
  children,
  className,
  disabled,
  label,
  leftElement,
}: MenuSubProps) {
  useRipple();
  const {vibrant} = useContext(MenuContext);
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pos = useSubmenuPosition(trigger, floating, open);

  const clear = () => timer.current && clearTimeout(timer.current);
  const hoverOpen = () => {
    clear();
    timer.current = setTimeout(() => {
      setKeyboard(false);
      setOpen(true);
    }, HOVER_OPEN_MS);
  };
  const hoverClose = () => {
    clear();
    timer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };
  const openByKey = () => {
    clear();
    setKeyboard(true);
    setOpen(true);
  };

  const labelColor = vibrant ? "text-on-tertiary-container" : "text-on-surface";
  const iconColor = vibrant
    ? "text-on-tertiary-container"
    : "text-on-surface-variant";

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === "ArrowRight" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      event.stopPropagation();
      openByKey();
    }
  };

  return (
    <>
      <button
        aria-disabled={disabled || undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "state-layer mx-1 my-0.5 flex h-11 items-center gap-2 rounded-extra-small px-3 text-left text-label-large first:rounded-t-medium last:rounded-b-medium disabled:cursor-not-allowed disabled:text-on-surface/38",
          open && (vibrant ? "bg-on-tertiary-container/8" : "bg-on-surface/8"),
          labelColor,
          !disabled && "cursor-pointer",
          className,
        )}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openByKey())}
        onKeyDown={onKeyDown}
        onMouseEnter={disabled ? undefined : hoverOpen}
        onMouseLeave={disabled ? undefined : hoverClose}
        ref={trigger}
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
          {label}
        </span>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center",
            iconColor,
            disabled && "text-on-surface/38",
          )}>
          <ChevronRight />
        </span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[var(--md-sys-z-menu)]"
              onMouseEnter={clear}
              onMouseLeave={hoverClose}
              ref={floating}
              style={{left: pos.left, top: pos.top}}>
              <Menu
                autoFocus={keyboard}
                onClose={() => {
                  setOpen(false);
                  trigger.current?.focus();
                }}
                submenu>
                {children}
              </Menu>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export {MenuSub};
