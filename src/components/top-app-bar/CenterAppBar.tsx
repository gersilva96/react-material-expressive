import {cn} from "../../utils/helpers";
import {type AppBarRowProps} from "./SmallAppBar";

/** M3 center-aligned top app bar: the small app bar with centered title text
 * (M3E merged center-aligned into small as a configuration). Height 64,
 * title-large centered (+ optional label-medium subtitle). */
function CenterAppBar({
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
      <div className="flex w-12 shrink-0 items-center">{leftElement}</div>
      <div className="flex w-full min-w-0 flex-col items-center justify-center px-3 text-center">
        <h1 className="max-w-full truncate text-title-large">
          {title ?? children}
        </h1>
        {subtitle ? (
          <p className="max-w-full truncate text-label-medium text-on-surface-variant">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex w-12 min-w-max shrink-0 flex-row items-center justify-end">
        {rightElement}
      </div>
    </div>
  );
}

export {CenterAppBar};
