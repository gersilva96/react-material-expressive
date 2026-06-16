import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type ImageRowProps = ComponentProps<"div">;

/** Horizontal row inside a Gallery (8dp gap). */
function ImageRow({children, className, ...props}: ImageRowProps) {
  return (
    <div className={cn("flex flex-row gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export {ImageRow};
