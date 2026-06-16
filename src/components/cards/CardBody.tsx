import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type CardBodyProps = ComponentProps<"div">;

function CardBody({children, className, ...props}: CardBodyProps) {
  return (
    <div
      className={cn("flex h-fit w-full flex-col gap-3", className)}
      {...props}>
      {children}
    </div>
  );
}

export {CardBody};
