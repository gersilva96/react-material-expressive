import {ComponentProps, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";

export interface BadgeProps extends ComponentProps<"div"> {
  icon?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Content fallback when no children are passed. */
  text?: ReactNode;
}

/** M3 large badge: shape full, error container, label-small, min 16px. */
function Badge({
  children,
  className,
  icon,
  iconLeft,
  iconRight,
  text,
  ...props
}: BadgeProps) {
  return (
    <div className={cn("badge", className)} {...props}>
      <Icon iconLeft={iconLeft} size={12} />
      {children ?? text}
      <Icon icon={icon} iconRight={iconRight} size={12} />
    </div>
  );
}

export {Badge};
