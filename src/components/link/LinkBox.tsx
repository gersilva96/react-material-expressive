import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {isActivePath} from "../../utils/navigation";

export interface LinkBoxProps extends ComponentProps<"a"> {
  /** Explicit current-page state (heavier underline + aria-current);
   * otherwise derived from href + currentPath. */
  active?: boolean;
  /** Current pathname from the consumer's router. */
  currentPath?: string;
}

/**
 * Text link that reads as a link: primary color, underlined at rest. Native
 * <a>; client-side routing via onClick or a wrapper. The underline is always
 * present (not color-only) so an inline link is distinguishable from body
 * text without relying on color — WCAG 1.4.1 (M3 publishes no link spec; the
 * primary-vs-text contrast is only 2.64:1 light / 1.31:1 dark). The current
 * page (active) gets a heavier underline, no color change.
 */
function LinkBox({
  active,
  children,
  className,
  currentPath,
  href,
  ...props
}: LinkBoxProps) {
  const isActive = active ?? isActivePath(href, currentPath);
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-fit cursor-pointer text-primary underline decoration-1 underline-offset-2",
        isActive && "decoration-2",
        className,
      )}
      href={href}
      {...props}>
      {children}
    </a>
  );
}

export {LinkBox};
