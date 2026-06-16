import {cn} from "../../utils/helpers";
import {type CollapsingAppBarProps} from "./MediumAppBar";

/** M3E large top app bar (flexible): display-small title at the bottom,
 * height 120 (152 with a subtitle). The M3 baseline large app bar is no
 * longer recommended; this is the flexible default. */
function LargeAppBar({
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
        // flexible 120 / 152 with subtitle (mt-auto pushes the title
        // block to just above the bottom padding).
        hasSubtitle ? "min-h-38 pb-5" : "min-h-30 pb-3",
        className,
      )}>
      <div className="flex h-16 w-full items-center justify-between px-1">
        <div className="flex shrink-0 items-center">{leftElement}</div>
        <div className="flex min-w-max shrink-0 flex-row items-center">
          {rightElement}
        </div>
      </div>
      <div className="mt-auto flex w-full flex-col px-4">
        <h1 className="text-display-small">{title ?? children}</h1>
        {hasSubtitle ? (
          <p className="text-title-medium text-on-surface-variant">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export {LargeAppBar};
