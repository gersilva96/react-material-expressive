import {ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface CollapsingAppBarProps {
  children?: ReactNode;
  className?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  /** Supporting line under the title (label-large). */
  subtitle?: ReactNode;
  /** Title fallback when no children are passed. */
  title?: ReactNode;
}

/** M3E medium top app bar (flexible): headline-medium title at the bottom,
 * height 112 (136 with a subtitle). The M3 baseline medium app bar is no
 * longer recommended; this is the flexible default. */
function MediumAppBar({
  children,
  className,
  leftElement,
  rightElement,
  subtitle,
  title,
}: CollapsingAppBarProps) {
  const hasSubtitle = subtitle != null;
  return (
    <div
      className={cn(
        "flex w-full flex-col text-on-surface",
        // height token + bottom padding so total = spec height with
        // the title baseline-bottom-aligned (mt-auto on the block):
        // 112 / 136 with subtitle.
        hasSubtitle ? "min-h-34 pb-4" : "min-h-28 pb-3",
        className,
      )}>
      <div className="flex h-16 w-full items-center justify-between px-1">
        <div className="flex shrink-0 items-center">{leftElement}</div>
        <div className="flex min-w-max shrink-0 flex-row items-center">
          {rightElement}
        </div>
      </div>
      <div className="mt-auto flex w-full flex-col px-4">
        <h1 className="text-headline-medium">{title ?? children}</h1>
        {hasSubtitle ? (
          <p className="text-label-large text-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export {MediumAppBar};
