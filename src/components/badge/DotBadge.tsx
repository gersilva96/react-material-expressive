import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type DotBadgeProps = ComponentProps<"div">;

/** M3 small badge: 6px dot, error container. */
function DotBadge({className, ...props}: DotBadgeProps) {
  return <div className={cn("dotBadge", className)} {...props} />;
}

export {DotBadge};
