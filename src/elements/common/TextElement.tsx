import {ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface TextElementProps {
  /** Supporting text (body-medium, on-surface-variant). */
  body?: ReactNode;
  bodyStyle?: string;
  className?: string;
  /** Overline label (label-medium, on-surface-variant). */
  label?: ReactNode;
  labelStyle?: string;
  /** Main text (title-medium, on-surface). */
  title?: ReactNode;
  titleStyle?: string;
}

/** Label / title / body text stack using the M3 type scale. */
function TextElement({
  body,
  bodyStyle,
  className,
  label,
  labelStyle,
  title,
  titleStyle,
}: TextElementProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center text-on-surface",
        className,
      )}>
      {label ? (
        <p
          className={cn(
            "text-label-medium text-on-surface-variant",
            labelStyle,
          )}>
          {label}
        </p>
      ) : null}
      {title ? (
        <h2 className={cn("text-title-medium", titleStyle)}>{title}</h2>
      ) : null}
      {body ? (
        <p
          className={cn("text-body-medium text-on-surface-variant", bodyStyle)}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

export {TextElement};
