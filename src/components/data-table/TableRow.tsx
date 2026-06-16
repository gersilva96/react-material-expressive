import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type TableRowProps = ComponentProps<"tr">;

function TableRow({children, className, ...props}: TableRowProps) {
  return (
    <tr className={cn("odd:bg-surface-container/50", className)} {...props}>
      {children}
    </tr>
  );
}

export {TableRow};
