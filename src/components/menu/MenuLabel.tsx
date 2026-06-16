import {ReactNode, useContext} from "react";
import {cn} from "../../utils/helpers";
import {MenuContext} from "./_context";

export interface MenuLabelProps {
  children?: ReactNode;
  className?: string;
  /** Optional 20px leading icon. */
  leftElement?: ReactNode;
}

/**
 * M3E vertical-menu section label: 32 tall, label-large in
 * on-surface-variant (standard) / on-tertiary-container (vibrant), 16dp
 * inline padding with a 6dp top pad — names the group that follows.
 */
function MenuLabel({children, className, leftElement}: MenuLabelProps) {
  const {vibrant} = useContext(MenuContext);
  return (
    <div
      className={cn(
        "flex min-h-8 items-center gap-2 px-4 pt-1.5 text-label-large",
        vibrant ? "text-on-tertiary-container" : "text-on-surface-variant",
        className,
      )}
      role="presentation">
      {leftElement ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center leading-none">
          {leftElement}
        </span>
      ) : null}
      <span className="min-w-px flex-1">{children}</span>
    </div>
  );
}

export {MenuLabel};
