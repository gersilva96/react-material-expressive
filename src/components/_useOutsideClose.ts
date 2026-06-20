// Internal: close-on-outside-pointer for menus and popovers. Not exported
// from the public barrel.
import {RefObject, useEffect} from "react";

export function useOutsideClose<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClose: (() => void) | undefined,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled || !onClose) return;
    const handler = (event: PointerEvent) => {
      const element = ref.current;
      const target = event.target;
      if (!element || !(target instanceof Node)) return;
      if (element.contains(target)) return;
      // Menus and combobox listboxes render in a portal (outside this ref)
      // to escape the surface clip — treat any open menu/listbox as "inside"
      // so interacting with a submenu or an option doesn't dismiss it.
      if (
        target instanceof Element &&
        target.closest('[role="menu"],[role="listbox"]')
      )
        return;
      onClose();
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [enabled, onClose, ref]);
}
