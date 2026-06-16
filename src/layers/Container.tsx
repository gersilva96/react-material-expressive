import {ReactNode} from "react";
import {cn} from "../utils/helpers";

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
  /** Padding class override (default p-6). */
  padding?: string;
}

/**
 * Dotted showcase panel (token-based dot grid) for presenting components
 * over a neutral, theme-aware background.
 */
function Container({children, className, padding}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-6 my-6 flex gap-2 overflow-x-auto rounded-large",
        padding ?? "p-6",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(var(--md-sys-color-outline-variant) 0.5px, transparent 0.5px)",
        backgroundPosition: "10px 10px",
        backgroundSize: "20px 20px",
      }}>
      {children}
    </div>
  );
}

export {Container};
