import {MouseEventHandler, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {resolveActive} from "../../utils/navigation";
import {DotBadge} from "../badge/DotBadge";
import {OnIconBadge} from "../badge/OnIconBadge";

export interface NavRailItemProps {
  /** Explicit active state; otherwise derived from href + currentPath. */
  active?: boolean;
  /** Icon for the active state (spec: the filled variant). */
  activeIcon?: ReactNode;
  badge?: boolean;
  badgeColor?: string;
  badgeText?: string;
  className?: string;
  /** Current pathname from the consumer's router. */
  currentPath?: string;
  dotBadge?: boolean;
  href?: string;
  icon?: ReactNode;
  label?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  target?: string;
}

/**
 * M3E navigation rail destination: a single always-row pill whose width
 * is driven live by the rail's animating width (collapsed 56x32 with the
 * `label-medium` below; expanded a full-width 56dp `label-large` row).
 * The below-label collapses while the side-label reveals inside the
 * growing pill, so the morph is continuous like Compose's. The indicator
 * springs width/alpha from the center on selection and hosts the press
 * ripple. Native <a> when href is given.
 */
function NavRailItem({
  active,
  activeIcon,
  badge,
  badgeColor,
  badgeText,
  className,
  currentPath,
  dotBadge,
  href,
  icon,
  label,
  onClick,
  target,
}: NavRailItemProps) {
  useRipple();
  const isActive = resolveActive(active, href, currentPath);
  const Comp = href ? "a" : "button";

  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "railItem navItem group",
        isActive && "navActive",
        className,
      )}
      href={href}
      onClick={onClick}
      target={target}
      type={href ? undefined : "button"}>
      <span className="navPill railRowPill state-layer">
        <span aria-hidden className="navIndicator" />
        <span aria-hidden className="navHit" />
        <span className="navIcon">
          <Icon icon={isActive && activeIcon ? activeIcon : icon} size={24} />
          {badge ? (
            <OnIconBadge className={badgeColor} count={badgeText} />
          ) : null}
          {dotBadge ? (
            <DotBadge className={cn("absolute top-0 right-0", badgeColor)} />
          ) : null}
        </span>
        {label ? (
          <span aria-hidden className="railSide">
            <span className="navLabel">{label}</span>
          </span>
        ) : null}
      </span>
      {label ? (
        <span className="railBelow">
          <span className="navLabel">{label}</span>
        </span>
      ) : null}
    </Comp>
  );
}

export {NavRailItem};
