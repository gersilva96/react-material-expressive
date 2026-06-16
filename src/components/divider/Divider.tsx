import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export interface DividerProps extends ComponentProps<"hr"> {
  /**
   * Inset the rule 16dp (M3 inset dividers, m3.material.io specs).
   * `"start"` indents the leading edge only — the list divider, left
   * 16 / right 0; `"middle"` both edges (middle-inset, 16/16); `"end"`
   * the trailing edge only. Omit for a full-width rule.
   */
  inset?: "start" | "middle" | "end";
}

// Logical margins (RTL-aware) shrink the rule from each edge; w-auto lets
// the block <hr> fill the remaining width.
const INSET = {
  start: "ms-4 w-auto",
  middle: "mx-4 w-auto",
  end: "me-4 w-auto",
} as const;

/** M3 divider: 1px rule in outline-variant (never `outline`). */
function Divider({className, inset, ...props}: DividerProps) {
  return (
    <hr
      className={cn(
        "my-4 h-px w-full border-0 bg-outline-variant",
        inset && INSET[inset],
        className,
      )}
      {...props}
    />
  );
}

export {Divider};
