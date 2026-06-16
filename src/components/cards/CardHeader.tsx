import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type CardHeaderProps = ComponentProps<"div">;

function CardHeader({children, className, ...props}: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-row items-center gap-3", className)}
      {...props}>
      {children}
    </div>
  );
}

export {CardHeader};
