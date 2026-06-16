import {ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface OnIconBadgeProps extends ComponentProps<"div"> {
  /** Count fallback when no children are passed. */
  count?: ReactNode;
}

/**
 * Count badge anchored to the top-right corner of an icon. Place it inside
 * a relatively-positioned wrapper around the icon.
 */
function OnIconBadge({children, className, count, ...props}: OnIconBadgeProps) {
  return (
    <div className={cn("badge onIconBadge", className)} {...props}>
      {children ?? count}
    </div>
  );
}

export {OnIconBadge};
