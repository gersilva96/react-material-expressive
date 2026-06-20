// Internal: positions a floating overlay (menu / popover) next to its anchor
// in a portal with `position: fixed`, so it escapes any ancestor's `overflow`
// clip. Generalizes the submenu placement to every variant the top-level menus
// need: open below/above the trigger (flipping to the other side when there is
// no room) aligned to its start/end edge (shifting horizontally to stay on
// screen), open to the right (the submenu rule), and optional width-matching
// (e.g. a combobox listbox sized to its input). Recomputes on scroll (capture)
// and resize. SSR-safe — no measurement work until it is open on the client.
import {RefObject, useState} from "react";
import {useIsomorphicLayoutEffect} from "../utils/_useIsomorphicLayoutEffect";

export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"
  | "right-start";

export interface PopoverPositionOptions {
  /** Gap between the anchor and the floating element, in px. Default 0. */
  gap?: number;
  /** Match the floating element's width to the anchor's (e.g. a combobox). */
  matchWidth?: boolean;
  /** Preferred side + cross-axis alignment. Default "bottom-start". */
  placement?: PopoverPlacement;
}

export interface PopoverPosition {
  /** True when the preferred top/bottom side flipped to the opposite one. The
   *  consumer derives the Menu `up` flag from this so the entrance always
   *  grows away from the trigger. Always false for the "right-*" placement. */
  flippedVertically: boolean;
  left: number;
  top: number;
  /** Set only when `matchWidth` — apply as the floating element's width. */
  width?: number;
}

/** Viewport margin kept around the floating element. */
const MARGIN = 8;
/** Width assumed before the floating element has measured (matches Menu min). */
const FALLBACK_WIDTH = 224;

export function usePopoverPosition(
  anchor: RefObject<HTMLElement | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
  options: PopoverPositionOptions = {},
): PopoverPosition {
  const {gap = 0, matchWidth = false, placement = "bottom-start"} = options;
  const [pos, setPos] = useState<PopoverPosition>({
    flippedVertically: false,
    left: 0,
    top: 0,
  });

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const a = anchor.current?.getBoundingClientRect();
      if (!a) return;
      const f = floating.current?.getBoundingClientRect();
      const width = matchWidth ? a.width : f?.width || FALLBACK_WIDTH;
      const height = f?.height || 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const dash = placement.indexOf("-");
      const side = placement.slice(0, dash) as "bottom" | "right" | "top";
      const align = placement.slice(dash + 1) as "end" | "start";

      let left: number;
      let top: number;
      let flippedVertically = false;

      if (side === "right") {
        // Submenu rule: right of the anchor, flip to its left edge on overflow,
        // align tops, shift up to keep the bottom on screen.
        left = a.right + gap;
        if (left + width > vw - MARGIN) {
          const flipped = a.left - width - gap;
          left =
            flipped >= MARGIN ? flipped : Math.max(MARGIN, vw - MARGIN - width);
        }
        top = a.top;
        if (top + height > vh - MARGIN) {
          top = Math.max(MARGIN, vh - MARGIN - height);
        }
      } else {
        // Cross-axis: align to the trigger's start (left) or end (right) edge,
        // then shift horizontally to stay on screen.
        left = align === "end" ? a.right - width : a.left;
        if (left + width > vw - MARGIN) left = vw - MARGIN - width;
        if (left < MARGIN) left = MARGIN;

        // Main-axis: place below (bottom) / above (top), flipping to the other
        // side only when the preferred one lacks room and the opposite has more.
        const below = a.bottom + gap;
        const above = a.top - height - gap;
        const roomBelow = vh - MARGIN - a.bottom;
        const roomAbove = a.top - MARGIN;
        if (side === "bottom") {
          if (height > roomBelow && roomAbove > roomBelow) {
            top = Math.max(MARGIN, above);
            flippedVertically = true;
          } else {
            top = below;
          }
        } else if (height > roomAbove && roomBelow > roomAbove) {
          top = below;
          flippedVertically = true;
        } else {
          top = Math.max(MARGIN, above);
        }
      }

      setPos({
        flippedVertically,
        left,
        top,
        width: matchWidth ? a.width : undefined,
      });
    };

    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [anchor, floating, open, gap, matchWidth, placement]);

  return pos;
}
