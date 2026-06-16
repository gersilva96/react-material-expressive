import {ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface TableHeaderCellProps extends ComponentProps<"th"> {
  /** Content fallback when no children are passed. */
  data?: ReactNode;
}

function TableHeaderCell({
  children,
  className,
  data,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        /* text-title-small on the th itself: the UA's
         * th{font-weight:bold} beats the weight inherited from
         * thead, so the scale utility must sit at element level. */
        "min-w-max overflow-hidden px-4 py-3 text-left text-title-small",
        className,
      )}
      {...props}>
      <div className="flex size-full min-w-max flex-wrap">
        {children ?? data}
      </div>
    </th>
  );
}

export {TableHeaderCell};
