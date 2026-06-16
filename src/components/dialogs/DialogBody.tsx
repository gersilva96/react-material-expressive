import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type DialogBodyProps = ComponentProps<"div">;

function DialogBody({children, className, ...props}: DialogBodyProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 text-body-medium text-on-surface-variant",
        className,
      )}
      {...props}>
      {children}
    </div>
  );
}

export {DialogBody};
