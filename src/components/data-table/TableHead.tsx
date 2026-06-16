import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type TableHeadProps = ComponentProps<"thead">;

function TableHead({children, className, ...props}: TableHeadProps) {
  return (
    <thead
      className={cn("bg-surface-container text-title-small", className)}
      {...props}>
      {children}
    </thead>
  );
}

export {TableHead};
