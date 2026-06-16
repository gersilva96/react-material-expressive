import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import type {ButtonSize} from "./Button";

/* Corner system per size (md.comp.button-group.connected.<size> tokens):
 * inner 8/8/8/16/20 rest, 4/4/4/12/16 pressed, full selected; square
 * outer 4/8/8/16/20. Applied by the .btnGroupConnected CSS. */
const CONNECTED_SIZES: Record<ButtonSize, string> = {
  xs: "connectedXs",
  s: "connectedS",
  m: "connectedM",
  l: "connectedL",
  xl: "connectedXl",
};

export interface ButtonGroupConnectedProps {
  /** Buttons or icon buttons with the same `size`; toggle buttons
   * (`selected`) drive the selection shape via aria-pressed. */
  children?: ReactNode;
  className?: string;
  /** Accessible label for the group. */
  label?: string;
  /** Outer corners: full (round) or the per-size square value. */
  shape?: "round" | "square";
  /** M3 Expressive size matching the buttons inside. */
  size?: ButtonSize;
}

/**
 * M3 Expressive connected button group: buttons joined by 2dp gaps where
 * the group controls the corners — outer edges keep the group shape
 * (full or square per size) and inner corners stay small (8/8/8/16/20),
 * sharpening while pressed (4/4/4/12/16) and rounding to full when a
 * toggle button is selected. Unlike the standard group there is no
 * interaction between neighbors. Successor of the segmented buttons.
 */
function ButtonGroupConnected({
  children,
  className,
  label,
  shape = "round",
  size = "s",
}: ButtonGroupConnectedProps) {
  return (
    <div
      aria-label={label}
      className={cn(
        "btnGroupConnected",
        CONNECTED_SIZES[size],
        shape === "square" ? "connectedSquare" : "connectedRound",
        className,
      )}
      role="group">
      {children}
    </div>
  );
}

export {ButtonGroupConnected};
