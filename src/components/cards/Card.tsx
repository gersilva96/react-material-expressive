import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {CardBody} from "./CardBody";
import {CardFooter} from "./CardFooter";
import {CardHeader} from "./CardHeader";

export type CardVariant = "elevated" | "filled" | "outlined";

export interface CardProps extends ComponentProps<"div"> {
  variant?: CardVariant;
}

/**
 * M3 card (shape medium). Variants per spec: elevated = surface-container-low
 * + level 1, filled = surface-container-highest, outlined = surface +
 * outline-variant border. Compose content with Card.Header / Card.Body /
 * Card.Footer.
 */
function Card({children, className, variant = "filled", ...props}: CardProps) {
  return (
    <div
      className={cn(
        "flex h-fit w-full flex-col gap-2 rounded-medium p-4 text-on-surface",
        variant === "elevated" && "bg-surface-container-low shadow-mm-1",
        variant === "filled" && "bg-surface-container-highest",
        variant === "outlined" && "border border-outline-variant bg-surface",
        className,
      )}
      {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export {Card};
