// Internal: positions a submenu surface next to its trigger, in a portal,
// so it can escape the parent menu's overflow clip. Places to the right,
// flips left when it would overflow, shifts up to stay on screen, and
// recomputes on scroll/resize. SSR-safe (no work until open on the client).
import {RefObject, useState} from "react";
import {useIsomorphicLayoutEffect} from "../../utils/_useIsomorphicLayoutEffect";

export interface SubmenuPosition {
  left: number;
  top: number;
}

/** Viewport margin kept around the floating submenu. */
const MARGIN = 8;

// useLayoutEffect runs before paint, so the submenu is positioned on its
// first painted frame (no flash) and stays focusable — unlike hiding it
// with visibility, which would block the open-by-keyboard autofocus.
export function useSubmenuPosition(
  anchor: RefObject<HTMLElement | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
): SubmenuPosition {
  const [pos, setPos] = useState<SubmenuPosition>({left: 0, top: 0});

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const a = anchor.current?.getBoundingClientRect();
      if (!a) return;
      const f = floating.current?.getBoundingClientRect();
      const width = f?.width || 224;
      const height = f?.height || 0;

      // Right of the trigger; flip to the left edge if it overflows.
      let left = a.right;
      if (left + width > window.innerWidth - MARGIN) {
        const flipped = a.left - width;
        left =
          flipped >= MARGIN
            ? flipped
            : Math.max(MARGIN, window.innerWidth - MARGIN - width);
      }
      // Align tops; shift up to keep the bottom on screen.
      let top = a.top;
      if (top + height > window.innerHeight - MARGIN) {
        top = Math.max(MARGIN, window.innerHeight - MARGIN - height);
      }
      setPos({left, top});
    };

    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchor, floating, open]);

  return pos;
}
