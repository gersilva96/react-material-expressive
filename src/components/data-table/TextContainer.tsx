import {ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface TextContainerProps {
  children?: ReactNode;
  className?: string;
  /** Content fallback when no children are passed. */
  data?: ReactNode;
  /** Width class (default w-[300px]) to keep long text readable. */
  width?: string;
}

/** Fixed-width wrapper for long text inside table cells. */
function TextContainer({children, className, data, width}: TextContainerProps) {
  return (
    <div className={cn("flex", width ?? "w-[300px]", className)}>
      {children ?? data}
    </div>
  );
}

export {TextContainer};
