import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {TableBody} from "./TableBody";
import {TableCell} from "./TableCell";
import {TableHead} from "./TableHead";
import {TableHeaderCell} from "./TableHeaderCell";
import {TableRow} from "./TableRow";
import {TextContainer} from "./TextContainer";

export interface TableProps extends ComponentProps<"table"> {
  /** Class for the scrollable wrapper. */
  wrapperClassName?: string;
}

/**
 * Data table (horizontal-scroll wrapper included). Compose with
 * Table.Head / Table.Body / Table.Row / Table.Cell / Table.HeaderCell /
 * Table.TextContainer. Data always comes from the consumer.
 */
function Table({children, className, wrapperClassName, ...props}: TableProps) {
  return (
    <div className={cn("w-full overflow-auto", wrapperClassName)}>
      <table
        className={cn(
          "w-full table-auto text-body-small text-on-surface",
          className,
        )}
        {...props}>
        {children}
      </table>
    </div>
  );
}

Table.Body = TableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.HeaderCell = TableHeaderCell;
Table.Row = TableRow;
Table.TextContainer = TextContainer;

export {Table};
