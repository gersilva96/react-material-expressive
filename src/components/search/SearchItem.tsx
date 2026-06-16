import {MouseEventHandler, ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";

export interface SearchItemProps {
  children?: ReactNode;
  className?: string;
  label?: ReactNode;
  leftElement?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  rightElement?: ReactNode;
}

/** M3 search suggestion row: height 56, body-large, state layer. */
function SearchItem({
  children,
  className,
  label,
  leftElement,
  onClick,
  rightElement,
}: SearchItemProps) {
  useRipple();
  return (
    <button
      className={cn(
        "state-layer flex h-14 w-full shrink-0 cursor-pointer items-center justify-start px-4 text-body-large text-on-surface",
        className,
      )}
      onClick={onClick}
      type="button">
      {leftElement ? (
        <span className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center leading-none text-on-surface-variant">
          {leftElement}
        </span>
      ) : null}
      <span className="flex w-full items-center gap-4 truncate text-left">
        {label ?? children}
      </span>
      {rightElement ? (
        <span className="flex min-w-max pl-7 text-body-small text-on-surface-variant">
          {rightElement}
        </span>
      ) : null}
    </button>
  );
}

export {SearchItem};
