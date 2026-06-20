import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
  useState,
} from "react";
import {cn} from "../../utils/helpers";

export interface TooltipProps {
  /** Action slot for rich tooltips (e.g. a text Button). */
  action?: ReactNode;
  bottomLeft?: boolean;
  bottomRight?: boolean;
  /** Trigger content. */
  children?: ReactNode;
  className?: string;
  /** Supporting text. */
  text?: ReactNode;
  /** Subhead for rich tooltips (title-small). */
  title?: ReactNode;
  topLeft?: boolean;
  topRight?: boolean;
  /** plain = label on inverse-surface; rich = card-like container. */
  variant?: "plain" | "rich";
}

/**
 * M3 tooltip shown on hover/focus. Plain: shape extra-small on
 * inverse-surface. Rich: shape medium on surface-container with optional
 * subhead and action. Position with the corner flags (default
 * bottomLeft).
 */
function Tooltip({
  action,
  bottomLeft,
  bottomRight,
  children,
  className,
  text,
  title,
  topLeft,
  topRight,
  variant = "plain",
}: TooltipProps) {
  const noPosition = !topLeft && !topRight && !bottomLeft && !bottomRight;
  const rich = variant === "rich";
  const tooltipId = useId();
  // WCAG 1.4.13: Escape dismisses the tooltip without moving focus/pointer;
  // it reappears once hover/focus leaves and returns.
  const [dismissed, setDismissed] = useState(false);

  // Wire the trigger to the tooltip for screen readers: when the trigger is a
  // single element, merge our id into its `aria-describedby` so the supporting
  // text is announced on focus/hover (APG tooltip pattern). Otherwise the
  // tooltip stays a programmatic `role="tooltip"` the consumer can reference.
  let trigger = children;
  if (isValidElement(children)) {
    const el = children as ReactElement<{"aria-describedby"?: string}>;
    trigger = cloneElement(el, {
      "aria-describedby": [el.props["aria-describedby"], tooltipId]
        .filter(Boolean)
        .join(" "),
    });
  }

  return (
    <div
      className="group relative flex w-fit"
      data-dismissed={dismissed ? "" : undefined}
      onBlur={() => setDismissed(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setDismissed(true);
      }}
      onPointerLeave={() => setDismissed(false)}>
      {trigger}
      <div
        id={tooltipId}
        className={cn(
          "tooltip absolute z-[var(--md-sys-z-tooltip)] my-1",
          rich
            ? "pointer-events-none w-max max-w-[320px] rounded-medium bg-surface-container px-4 pt-3 pb-2 shadow-mm-2 group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
            : "pointer-events-none max-w-[200px] rounded-extra-small bg-inverse-surface px-2 py-1",
          topRight && "right-0 bottom-full",
          topLeft && "bottom-full left-0",
          bottomRight && "top-full right-0",
          (bottomLeft || noPosition) && "top-full left-0",
          className,
        )}
        role="tooltip">
        {rich ? (
          <div className="flex w-max max-w-full flex-col gap-1">
            {title ? (
              <span className="text-title-small text-on-surface-variant">
                {title}
              </span>
            ) : null}
            {text ? (
              <span className="text-body-medium text-on-surface-variant">
                {text}
              </span>
            ) : null}
            {action ? <span className="-ml-3 flex pt-1">{action}</span> : null}
          </div>
        ) : (
          <span className="flex w-max max-w-full text-body-small text-inverse-on-surface">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export {Tooltip};
