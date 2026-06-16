import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import type {ButtonSize} from "./Button";

/* Spacing per size (md.comp.button-group.standard.<size>.between-space:
 * 18/12/8/8/8 — wider on small sizes to keep 48dp touch targets) plus the
 * press width-morph metrics consumed by the .btnGroup CSS. */
const GROUP_SIZES: Record<ButtonSize, string> = {
  xs: "groupXs",
  s: "groupS",
  m: "groupM",
  l: "groupL",
  xl: "groupXl",
};

export interface ButtonGroupProps {
  /** Buttons or icon buttons (pass them the same `size`). */
  children?: ReactNode;
  className?: string;
  /** Accessible label for the group. */
  label?: string;
  /** M3 Expressive size — sets the spacing and press-morph metrics to
   * match the buttons inside. */
  size?: ButtonSize;
}

/**
 * M3 Expressive standard button group: an invisible container that spaces
 * its buttons (18/12/8/8/8 per size) and adds interaction between them —
 * pressing a button widens it while the buttons directly next to it
 * compress, on the shared 200ms emphasized morph. Buttons keep their own
 * colors, states and toggle behavior; avoid text and standard icon
 * buttons (no container treatment, per spec).
 */
function ButtonGroup({
  children,
  className,
  label,
  size = "s",
}: ButtonGroupProps) {
  return (
    <div
      aria-label={label}
      className={cn("btnGroup", GROUP_SIZES[size], className)}
      role="group">
      {children}
    </div>
  );
}

export {ButtonGroup};
