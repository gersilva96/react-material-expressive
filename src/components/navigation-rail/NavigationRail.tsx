import {MouseEventHandler, ReactNode, useEffect} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {IconButton} from "../button/IconButton";
import {useDismissable} from "../_useDismissable";
import {MenuGlyph} from "./_MenuGlyph";
import {NavRailItem} from "./NavRailItem";

export interface NavigationRailLabels {
  /** aria-label for the menu button while collapsed (click expands).
   * Default "Expand". */
  expand?: string;
  /** aria-label for the menu button while expanded (click collapses).
   * Default "Collapse". */
  collapse?: string;
  /** Accessible name for the FAB. Falls back to a string `fabLabel`; set
   * this to name an icon-only FAB (the label is visually hidden while the
   * rail is collapsed). */
  fab?: string;
}

const NAVIGATION_RAIL_LABELS: Required<NavigationRailLabels> = {
  expand: "Expand",
  collapse: "Collapse",
  fab: "",
};

export interface NavigationRailProps {
  /** Bottom-aligned slot. */
  bottom?: ReactNode;
  /** Destinations (NavigationRail.Item list). */
  children?: ReactNode;
  className?: string;
  /** Expanded rail (220dp): items morph to full-width rows and the FAB
   * extends. Drive it from the menu button (rendered when `onMenuClick`
   * is set). */
  expanded?: boolean;
  /** FAB icon (24px box). Renders the rail FAB, which morphs into an
   * extended FAB while the rail expands. */
  fabIcon?: ReactNode;
  /** Extended-FAB label revealed when expanded. */
  fabLabel?: ReactNode;
  /** Customizable accessible names (the menu button's aria-label). */
  labels?: NavigationRailLabels;
  /** Icon for the menu button while collapsed. Defaults to the M3 `menu`
   * glyph drawn by the library. */
  menuIcon?: ReactNode;
  /** Icon for the menu button while expanded. Defaults to the M3
   * `menu_open` glyph drawn by the library. */
  menuOpenIcon?: ReactNode;
  /** Toggle handler for the menu button. Providing it renders the menu
   * button above the FAB; the library draws the default M3 menu icon,
   * swapping `menu` → `menu_open` with `expanded` (override either glyph
   * with `menuIcon`/`menuOpenIcon`). Wire it to flip `expanded`. */
  onMenuClick?: MouseEventHandler<HTMLButtonElement>;
  /** The expanded state overlays the content as a full-window modal
   * drawer (fixed full height matching the 32% scrim, surface-container,
   * level 2, large end corners) instead of pushing it. The collapsed
   * footprint stays in the layout; the overlay surface eases back to the
   * resting rail as it collapses on close. */
  modal?: boolean;
  /** 80dp collapsed width instead of the default 96dp. */
  narrow?: boolean;
  onFabClick?: MouseEventHandler<HTMLButtonElement>;
  /** Modal dismiss (scrim click / Escape). */
  onClose?: () => void;
}

/**
 * M3E navigation rail: collapsed 96dp (80 with `narrow`) on `surface`
 * with 44dp top spacing; `expanded` morphs it to a 220dp rail with
 * full-width row items (the spec's replacement for the navigation
 * drawer), springing the width (default-spatial; fast-spatial when
 * `modal`) while item faces crossfade. Compose with NavigationRail.Item.
 */
function NavigationRail({
  bottom,
  children,
  className,
  expanded,
  fabIcon,
  fabLabel,
  labels,
  menuIcon,
  menuOpenIcon,
  modal,
  narrow,
  onFabClick,
  onClose,
  onMenuClick,
}: NavigationRailProps) {
  useRipple();
  const l = {...NAVIGATION_RAIL_LABELS, ...labels};
  const fabAriaLabel =
    l.fab || (typeof fabLabel === "string" ? fabLabel : undefined);
  const isModalOpen = !!modal && !!expanded;
  const scrim = useDismissable(isModalOpen, 250);
  // `.railModalOpen` pins the overlay `fixed` to the full window height (like
  // the scrim) while OPEN (synchronously via `expanded`, not the post-paint
  // `scrim.mounted` which lags a frame) AND while CLOSING (`scrim.exiting`),
  // so the drawer keeps the available height through the collapse. The surface
  // (fill/shadow/corners) rides `railExpanded` so it eases out in lockstep
  // with the width — a smooth deflate (see styles.css for why this is
  // preferred over Compose's constant-surface + layer unmount).
  const modalOpen = !!modal && (!!expanded || scrim.exiting);

  useEffect(() => {
    if (!isModalOpen || !onClose) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isModalOpen, onClose]);

  const rail = (
    <nav
      className={cn(
        "rail",
        narrow && "railNarrow",
        expanded && "railExpanded",
        modal && "railModal",
        modalOpen && "railModalOpen",
        className,
      )}>
      {onMenuClick || fabIcon ? (
        <div className="railHeader">
          {onMenuClick ? (
            <div className="railSlot">
              <IconButton
                aria-expanded={!!expanded}
                aria-label={expanded ? l.collapse : l.expand}
                icon={
                  expanded
                    ? (menuOpenIcon ?? <MenuGlyph open />)
                    : (menuIcon ?? <MenuGlyph open={false} />)
                }
                onClick={onMenuClick}
                variant="standard"
              />
            </div>
          ) : null}
          {fabIcon ? (
            <button
              aria-label={fabAriaLabel}
              className="railFab state-layer"
              onClick={onFabClick}
              type="button">
              <Icon icon={fabIcon} size={24} />
              <span className="railFabLabel">
                <span>{fabLabel}</span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="railItems">{children}</div>
      {bottom ? (
        <div className="railBottom">
          <div className="railSlot">{bottom}</div>
        </div>
      ) : null}
    </nav>
  );

  if (!modal) return rail;

  return (
    <div className={cn("relative h-full", narrow ? "w-20" : "w-24")}>
      {scrim.mounted ? (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-scrim/32",
            scrim.exiting
              ? "animate-scrim-drawer-out"
              : "animate-scrim-drawer-in",
          )}
          onClick={onClose}
        />
      ) : null}
      {rail}
    </div>
  );
}

NavigationRail.Item = NavRailItem;

export {NavigationRail};
