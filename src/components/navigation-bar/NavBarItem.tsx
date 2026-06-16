import {MouseEventHandler, ReactNode, useContext} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {resolveActive} from "../../utils/navigation";
import {DotBadge} from "../badge/DotBadge";
import {OnIconBadge} from "../badge/OnIconBadge";
import {NavBarContext} from "./_context";

export interface NavBarItemProps {
  /** Accessible name for icon-only items (when no `label` is shown). */
  "aria-label"?: string;
  /** Accessible name via an element id (alternative to aria-label). */
  "aria-labelledby"?: string;
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
 * M3E navigation bar destination. Vertical (default): 32x56 indicator
 * pill over the 24 icon, `label-medium` below; horizontal (bar with
 * `horizontal`): a 40dp pill holding icon + label. The indicator springs
 * its width/alpha from the center on selection and hosts the press
 * ripple. Native <a> when href is given.
 */
function NavBarItem({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
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
}: NavBarItemProps) {
  useRipple();
  const {horizontal} = useContext(NavBarContext);
  const isActive = resolveActive(active, href, currentPath);
  const Comp = href ? "a" : "button";

  const iconNode = (
    <span className="navIcon">
      <Icon icon={isActive && activeIcon ? activeIcon : icon} size={24} />
      {badge ? <OnIconBadge className={badgeColor} count={badgeText} /> : null}
      {dotBadge ? (
        <DotBadge className={cn("absolute top-0 right-0", badgeColor)} />
      ) : null}
    </span>
  );

  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(
        "navItem group",
        horizontal ? "navItemH" : "navItemV",
        isActive && "navActive",
        className,
      )}
      href={href}
      onClick={onClick}
      target={target}
      type={href ? undefined : "button"}>
      {horizontal ? (
        <span className="navPill navPillRow state-layer">
          <span aria-hidden className="navIndicator" />
          {iconNode}
          {label ? <span className="navLabel">{label}</span> : null}
        </span>
      ) : (
        <>
          <span className="navPill state-layer">
            <span aria-hidden className="navIndicator" />
            <span aria-hidden className="navHit" />
            {iconNode}
          </span>
          {label ? <span className="navLabel">{label}</span> : null}
        </>
      )}
    </Comp>
  );
}

export {NavBarItem};
