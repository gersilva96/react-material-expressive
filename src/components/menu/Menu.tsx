import {
  Children,
  isValidElement,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {cn} from "../../utils/helpers";
import {MENU_NOOP, MenuContext} from "./_context";
import {MenuDivider} from "./MenuDivider";
import {MenuGroup} from "./MenuGroup";
import {MenuItem} from "./MenuItem";
import {MenuLabel} from "./MenuLabel";
import {MenuSub} from "./MenuSub";

export interface MenuProps {
  /** Move focus to the first item on open (default true; submenus opened
   * by hover pass false so the pointer keeps control). */
  autoFocus?: boolean;
  children?: ReactNode;
  className?: string;
  /** True while the close animation plays (from useDismissable). */
  exiting?: boolean;
  /** Id for the role="menu" element so a trigger can aria-controls it. */
  id?: string;
  /** Dismiss this menu level — items use it, Escape/Tab/ArrowLeft too. */
  onClose?: () => void;
  /** Set by Menu.Sub: this is a submenu, so it inherits the chain's
   * closeAll and ArrowLeft returns to the trigger. */
  submenu?: boolean;
  /** Reveal upward instead of downward (anchored above the trigger). */
  up?: boolean;
  /** Vibrant (tertiary-based) scheme; inherited by submenus. */
  vibrant?: boolean;
}

/* Time window to accumulate typeahead keystrokes (matches @material/web). */
const TYPEAHEAD_MS = 200;

/**
 * M3 Expressive vertical menu surface and behaviour (anchorless — the host
 * positions it): corner-large container, surface-container-low / tertiary
 * (vibrant) at elevation 3, inset state-layer items, and WAI-ARIA menu
 * keyboard (Arrow/Home/End/typeahead/Escape, Left/Right for submenus).
 * Compose with Menu.Item, Menu.Sub, Menu.Label and Menu.Divider.
 */
function Menu({
  autoFocus = true,
  children,
  className,
  exiting,
  id,
  onClose,
  submenu,
  up,
  vibrant,
}: MenuProps) {
  const surface = useRef<HTMLDivElement>(null);
  const typeahead = useRef({buffer: "", time: 0});
  const parent = useContext(MenuContext);

  // Submenus inherit the chain's closeAll (so a leaf closes the whole
  // chain) and the parent's scheme; the root uses its own onClose.
  const closeAll = submenu ? parent.closeAll : (onClose ?? MENU_NOOP);
  const scheme = vibrant ?? parent.vibrant;

  // Gap grouping: when the menu's children are Menu.Group surfaces, the
  // outer becomes a transparent stack with a 2dp gap (each group carries
  // its own surface, elevation and rounded corners) instead of being the
  // single surface itself.
  const grouped = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === MenuGroup,
  );

  const close = useCallback(() => onClose?.(), [onClose]);

  /** Current-level, enabled menu items (skips nested submenu contents). */
  const items = useCallback((): HTMLElement[] => {
    const root = surface.current;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
      (el) =>
        el.getAttribute("aria-disabled") !== "true" &&
        el.closest('[role="menu"]') === root,
    );
  }, []);

  // Focus moves into the menu on open so the keyboard works. A root menu
  // (Dropdown / overflow / theme) focuses its SURFACE, so nothing is
  // pre-highlighted and the first ArrowDown/ArrowUp lands on the first/last
  // item — matches @material/web's default LIST_ROOT focus (and stops the
  // first ArrowDown from skipping to the second item). A submenu opened by
  // keyboard lands on its first item (WAI-ARIA submenu); a hover submenu
  // passes autoFocus=false so the pointer keeps control.
  useEffect(() => {
    if (exiting || !autoFocus) return;
    if (submenu) items()[0]?.focus();
    else surface.current?.focus();
  }, [autoFocus, exiting, items, submenu]);

  const focusAt = (list: HTMLElement[], index: number) => {
    const next = (index + list.length) % list.length;
    list[next]?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Only the menu level that owns the focused item reacts — otherwise
    // a key pressed inside a submenu would also move the parent's focus.
    const active = document.activeElement as HTMLElement | null;
    if (active && active.closest('[role="menu"]') !== surface.current) return;
    const list = items();
    const current = active ? list.indexOf(active) : -1;
    switch (event.key) {
      case "ArrowDown":
        // No current item (surface focused) → first; else next.
        event.preventDefault();
        focusAt(list, current < 0 ? 0 : current + 1);
        break;
      case "ArrowUp":
        // No current item (surface focused) → last; else previous.
        event.preventDefault();
        focusAt(list, current < 0 ? list.length - 1 : current - 1);
        break;
      case "Home":
        event.preventDefault();
        list[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        list[list.length - 1]?.focus();
        break;
      case "ArrowLeft":
        // Close a submenu back to its trigger (root ignores it).
        if (submenu) {
          event.preventDefault();
          close();
        }
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
      default: {
        if (
          event.key.length !== 1 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        const now = Date.now();
        const stale = now - typeahead.current.time > TYPEAHEAD_MS;
        const buffer =
          (stale ? "" : typeahead.current.buffer) + event.key.toLowerCase();
        typeahead.current = {buffer, time: now};
        // Match the visible label only — el.textContent would also
        // include the leading icon's ligature text and any trailing
        // shortcut, so typing the label's start would miss.
        const labelOf = (el: HTMLElement) =>
          ((el.querySelector("[data-menu-label]") ?? el).textContent ?? "")
            .trim()
            .toLowerCase();
        const match = list.find((el) => labelOf(el).startsWith(buffer));
        match?.focus();
      }
    }
  };

  return (
    <MenuContext.Provider value={{vibrant: scheme, closeAll}}>
      <div
        className={cn(
          // outline-none: the surface is focusable (tabIndex -1) so a
          // root menu can focus it on open without highlighting any
          // item — it must never show a focus ring of its own.
          "z-[var(--md-sys-z-menu)] flex w-max min-w-[112px] max-w-[280px] flex-col outline-none [--menu-clip-bleed:-24px]",
          grouped
            ? // Transparent stack: each Menu.Group is its own
              // surface, separated by a 2dp gap. overflow-visible
              // keeps the groups' elevation shadows from being
              // rectangular-clipped (the clip-path reveal bleeds
              // -24px to give those shadows the same room).
              "gap-0.5 overflow-visible"
            : // Single surface (the common case).
              cn(
                "max-h-[310px] overflow-hidden overflow-y-auto rounded-large py-0.5 shadow-mm-3",
                scheme
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-surface-container-low text-on-surface",
              ),
          up
            ? exiting
              ? "animate-menu-out-up"
              : "animate-menu-in-up"
            : exiting
              ? "animate-menu-out"
              : "animate-menu-in",
          className,
        )}
        id={id}
        onKeyDown={onKeyDown}
        ref={surface}
        role="menu"
        tabIndex={-1}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

Menu.Item = MenuItem;
Menu.Sub = MenuSub;
Menu.Group = MenuGroup;
Menu.Label = MenuLabel;
Menu.Divider = MenuDivider;

export {Menu};
