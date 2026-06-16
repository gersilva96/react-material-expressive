import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {CenterAppBar} from "./CenterAppBar";
import {LargeAppBar} from "./LargeAppBar";
import {MediumAppBar} from "./MediumAppBar";
import {SmallAppBar} from "./SmallAppBar";

export type TopAppBarProps = ComponentProps<"header">;

/**
 * M3 top app bar container (surface at rest; swap to surface-container on
 * scroll via className). Compose with TopAppBar.Small / .Center / .Medium /
 * .Large.
 */
function TopAppBar({children, className, ...props}: TopAppBarProps) {
  return (
    <header
      className={cn(
        "flex w-full flex-col bg-surface text-on-surface",
        className,
      )}
      {...props}>
      {children}
    </header>
  );
}

TopAppBar.Small = SmallAppBar;
TopAppBar.Medium = MediumAppBar;
TopAppBar.Large = LargeAppBar;
TopAppBar.Center = CenterAppBar;

export {TopAppBar};
