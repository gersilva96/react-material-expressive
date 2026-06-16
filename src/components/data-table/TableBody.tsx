import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type TableBodyProps = ComponentProps<"tbody">;

function TableBody({children, className, ...props}: TableBodyProps) {
  return (
    <tbody className={cn("text-body-medium", className)} {...props}>
      {children}
    </tbody>
  );
}

export {TableBody};
