import {ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

/** Side of the toolbar the FAB sits on (end = trailing/bottom). */
export type FloatingToolbarFabPosition = "start" | "end";

export interface FloatingToolbarProps extends ComponentProps<"div"> {
  /** Collapse choreography (fast-spatial spring): with `fab` the whole
   * pill clips away toward the FAB, which grows 56 → 80 (medium);
   * without it only `leading`/`trailing` collapse. Drive it from your
   * scroll handler. Default true. */
  expanded?: boolean;
  /** Adjacent FAB slot (a `<FAB>`), 8dp from the pill. The toolbar
   * controls its size and elevation (level 2, hover 3). */
  fab?: ReactNode;
  /** FAB side: end (default) or start. */
  fabPosition?: FloatingToolbarFabPosition;
  /** Remove the default level-3 elevation (spec guideline for visually
   * distinct backgrounds). */
  flat?: boolean;
  /** Leading actions that collapse away when `expanded` is false. */
  leading?: ReactNode;
  /** Trailing actions that collapse away when `expanded` is false. */
  trailing?: ReactNode;
  /** Vertical orientation (64dp wide, 24dp min screen margin). */
  vertical?: boolean;
  /** Vibrant color scheme (primary-container) instead of the standard
   * surface-container. */
  vibrant?: boolean;
}

/**
 * M3 Expressive floating toolbar: a 64dp pill (8dp paddings, 4dp gap,
 * shape full, level 3) floating above the content with a 16dp (24dp
 * vertical) screen margin — position the wrapper yourself. Standard
 * (surface-container) or vibrant (primary-container) schemes; ghost icon
 * buttons follow the toolbar selection colors via `aria-pressed`. The
 * expand/collapse motion ports the Compose fast-spatial spring
 * (damping 0.6 / stiffness 800).
 */
function FloatingToolbar({
  children,
  className,
  expanded = true,
  fab,
  fabPosition = "end",
  flat,
  leading,
  trailing,
  vertical,
  vibrant,
  ...props
}: FloatingToolbarProps) {
  const hasFab = fab !== undefined && fab !== null;
  const collapsed = !expanded;
  return (
    <div
      aria-orientation={vertical ? "vertical" : undefined}
      className={cn(
        "toolbar floatingToolbar",
        vertical ? "floatingVertical" : "floatingHorizontal",
        vibrant && "vibrant",
        flat && "floatingFlat",
        hasFab && "floatingWithFab",
        hasFab && fabPosition === "start" && "floatingFabStart",
        collapsed && "floatingCollapsed",
        className,
      )}
      role="toolbar"
      {...props}>
      <div className="floatingClip">
        <div
          className="floatingPill"
          inert={(hasFab && collapsed) || undefined}>
          {leading != null ? (
            <div className="floatingSlot" inert={collapsed || undefined}>
              <div className="floatingLeading">{leading}</div>
            </div>
          ) : null}
          <div className="floatingContent">{children}</div>
          {trailing != null ? (
            <div className="floatingSlot" inert={collapsed || undefined}>
              <div className="floatingTrailing">{trailing}</div>
            </div>
          ) : null}
        </div>
      </div>
      {hasFab ? <div className="floatingFab">{fab}</div> : null}
    </div>
  );
}

export {FloatingToolbar};
