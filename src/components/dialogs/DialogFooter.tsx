import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type DialogFooterProps = ComponentProps<"div">;

function DialogFooter({children, className, ...props}: DialogFooterProps) {
  return (
    <div
      className={cn("mt-2 flex items-center justify-end gap-2", className)}
      {...props}>
      {children}
    </div>
  );
}

export {DialogFooter};
