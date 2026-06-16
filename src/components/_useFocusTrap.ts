import {KeyboardEvent as ReactKeyboardEvent, RefObject, useEffect} from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal focus management for div-based panels — what the native
 * `<dialog>.showModal()` gives you, replicated for a plain element: on open,
 * move focus to an `[autofocus]` child if present (otherwise the panel
 * itself); restore focus to the previously focused element on close; and trap
 * Tab / Shift+Tab inside the panel with wrap. Returns the keydown handler to
 * attach to the panel's `onKeyDown`.
 *
 * The panel must carry `tabIndex={-1}` so it can receive focus.
 */
export function useFocusTrap<T extends HTMLElement>(
  panel: RefObject<T | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    const autofocus = panel.current?.querySelector<HTMLElement>("[autofocus]");
    (autofocus ?? panel.current)?.focus();
    return () => restoreTo?.focus();
  }, [active, panel]);

  return (event: ReactKeyboardEvent) => {
    if (event.key !== "Tab" || !panel.current) return;
    const focusables = panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeEl = document.activeElement;
    if (event.shiftKey && (activeEl === first || activeEl === panel.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault();
      first.focus();
    }
  };
}
