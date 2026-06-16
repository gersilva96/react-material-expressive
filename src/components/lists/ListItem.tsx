import {MouseEventHandler, ReactNode, useContext} from "react";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {ListContext} from "./_context";

export interface ListItemProps {
  /** Supporting text (body-medium). Switches the item to 72dp. */
  body?: ReactNode;
  /** Custom content replacing the text block. */
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  /** Primary text (body-large). */
  headline?: ReactNode;
  /** Renders the item as a native <a>. */
  href?: string;
  /** Overline (label-small). */
  label?: ReactNode;
  leftElement?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  rightElement?: ReactNode;
  /** Selected: secondary-container fill + on-secondary-container content
   * (visual; the consumer owns selection semantics). */
  selected?: boolean;
  target?: string;
}

/**
 * M3 list item: 56dp one-line, 72dp with supporting text. Interactive
 * (href/onClick) items get a state layer; navigation uses a native <a> —
 * client-side routing via onClick or a wrapper.
 */
function ListItem({
  body,
  children,
  className,
  disabled,
  headline,
  href,
  label,
  leftElement,
  onClick,
  rightElement,
  selected,
  target,
}: ListItemProps) {
  useRipple();
  const {expressive} = useContext(ListContext);
  const interactive = Boolean(href || onClick) && !disabled;

  // M3 list heights by text-row count: 1 → 56dp, 2 → 72dp, 3 → 88dp. A
  // three-line item top-aligns its leading + text (the trailing element
  // stays vertically centered, per the spec measurements).
  const lines = (label ? 1 : 0) + (headline ? 1 : 0) + (body ? 1 : 0);
  const threeLine = lines >= 3;

  // Secondary content (leading/trailing icons, overline, supporting text).
  const subColor = disabled
    ? "text-on-surface/38"
    : selected
      ? "text-on-secondary-container"
      : "text-on-surface-variant";

  const rowClass = cn(
    // 16dp leading/trailing space, 12dp between elements (M3 spacing).
    "flex w-full flex-row gap-3 px-4 text-left",
    threeLine
      ? "min-h-[88px] items-start py-3"
      : cn(body ? "min-h-[72px]" : "min-h-14", "items-center py-2.5"),
    // Expressive: filled (surface-container) tile whose corner morphs on
    // interaction — rest extra-small (4) → hover medium (12) → focus/
    // pressed large (16). The plain variant stays transparent + rectangular.
    expressive &&
      cn(
        "rounded-extra-small bg-surface-container transition-[border-radius] duration-200 ease-emphasized",
        interactive &&
          !selected &&
          "hover:rounded-medium focus-visible:rounded-large active:rounded-large",
      ),
    // Selected: secondary-container, corner-large in both variants (M3
    // token ItemSelectedContainerShape = CornerLarge).
    selected && !disabled
      ? "rounded-large bg-secondary-container text-on-secondary-container"
      : "text-on-surface",
    interactive && "state-layer cursor-pointer",
    disabled && "cursor-not-allowed text-on-surface/38",
    className,
  );

  const content = (
    <>
      {leftElement ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center leading-none",
            // 24dp plain icon box, 20dp expressive.
            expressive ? "min-h-5 min-w-5" : "min-h-6 min-w-6",
            subColor,
          )}>
          {leftElement}
        </span>
      ) : null}
      <span className="flex w-full min-w-0 flex-col">
        {label ? (
          <span className={cn("text-label-small", subColor)}>{label}</span>
        ) : null}
        {headline ? (
          <span className="truncate text-body-large">{headline}</span>
        ) : null}
        {body ? (
          <span className={cn("text-body-medium", subColor)}>{body}</span>
        ) : null}
        {children}
      </span>
      {rightElement ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center self-center",
            subColor,
          )}>
          {rightElement}
        </span>
      ) : null}
    </>
  );

  if (href && !disabled) {
    return (
      <li className="flex w-full">
        <a className={rowClass} href={href} onClick={onClick} target={target}>
          {content}
        </a>
      </li>
    );
  }
  if (onClick && !disabled) {
    return (
      <li className="flex w-full">
        <button className={rowClass} onClick={onClick} type="button">
          {content}
        </button>
      </li>
    );
  }
  return <li className={rowClass}>{content}</li>;
}

export {ListItem};
