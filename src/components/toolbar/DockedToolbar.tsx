import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export interface DockedToolbarProps extends ComponentProps<"div"> {
  /** Vibrant color scheme (primary-container) instead of the standard
   * surface-container. */
  vibrant?: boolean;
}

/**
 * M3 Expressive docked toolbar: a full-width 64dp bar (surface-container,
 * 16dp edge paddings, 32dp default gap, square corners) pinned to the
 * bottom of the window. Successor of the baseline bottom app bar; FABs
 * placed inside sit flat (no own elevation). Ghost icon buttons follow
 * the toolbar selection colors via `aria-pressed`.
 */
function DockedToolbar({
  children,
  className,
  vibrant,
  ...props
}: DockedToolbarProps) {
  return (
    <div
      className={cn("toolbar dockedToolbar", vibrant && "vibrant", className)}
      role="toolbar"
      {...props}>
      {children}
    </div>
  );
}

export {DockedToolbar};
