import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type CardFooterProps = ComponentProps<"div">;

function CardFooter({children, className, ...props}: CardFooterProps) {
  return (
    <div
      className={cn("flex h-fit w-full flex-row items-center gap-3", className)}
      {...props}>
      {children}
    </div>
  );
}

export {CardFooter};
