import {ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface AppBarRowProps {
  children?: ReactNode;
  className?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  /** Optional supporting line under the title (label-medium, M3E). */
  subtitle?: ReactNode;
  /** Title fallback when no children are passed. */
  title?: ReactNode;
}

/** M3 small top app bar: height 64, bar padding 4, title-large start-aligned
 * (+ optional label-medium subtitle, M3E). */
function SmallAppBar({
  children,
  className,
  leftElement,
  rightElement,
  subtitle,
  title,
}: AppBarRowProps) {
  return (
    <div
      className={cn(
        "flex h-16 w-full items-center px-1 text-on-surface",
        className,
      )}>
      {leftElement ? (
        <div className="flex shrink-0 items-center">{leftElement}</div>
      ) : null}
      <div className="flex w-full min-w-0 flex-col justify-center px-3">
        <h1 className="truncate text-title-large">{title ?? children}</h1>
        {subtitle ? (
          <p className="truncate text-label-medium text-on-surface-variant">
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightElement ? (
        <div className="flex min-w-max shrink-0 flex-row items-center">
          {rightElement}
        </div>
      ) : null}
    </div>
  );
}

export {SmallAppBar};
