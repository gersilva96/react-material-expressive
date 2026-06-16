import {ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface TableCellProps extends ComponentProps<"td"> {
  /** Content fallback when no children are passed. */
  data?: ReactNode;
}

function TableCell({children, className, data, ...props}: TableCellProps) {
  return (
    <td className={cn("min-w-max py-3 pl-4 pr-8", className)} {...props}>
      <span className="flex sm:min-w-max">{children ?? data}</span>
    </td>
  );
}

export {TableCell};
