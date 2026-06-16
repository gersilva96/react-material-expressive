import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export type LinkContainerProps = ComponentProps<"a">;

/**
 * Block-level link wrapping arbitrary content (cards, media...). Adds no
 * text styling of its own. Native <a>; client-side routing via onClick or
 * a wrapper.
 */
function LinkContainer({children, className, ...props}: LinkContainerProps) {
  return (
    <a className={cn("block w-fit cursor-pointer", className)} {...props}>
      {children}
    </a>
  );
}

export {LinkContainer};
