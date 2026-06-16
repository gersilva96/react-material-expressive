import {ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface IconProps {
  className?: string;
  /** Standalone icon slot. */
  icon?: ReactNode;
  /** Leading icon slot. */
  iconLeft?: ReactNode;
  /** Trailing icon slot. */
  iconRight?: ReactNode;
  /** Box size in px (M3 default 24). */
  size?: number;
}

/**
 * Icon slot helper. Wraps each provided icon in a fixed square box
 * (default 24px) so arbitrary icon nodes align with adjacent text.
 */
function Icon({className, icon, iconLeft, iconRight, size = 24}: IconProps) {
  const box = cn(
    "flex shrink-0 items-center justify-center leading-none",
    className,
  );
  const style = {height: size, width: size};
  return (
    <>
      {iconLeft ? (
        <span className={box} style={style}>
          {iconLeft}
        </span>
      ) : null}
      {icon ? (
        <span className={box} style={style}>
          {icon}
        </span>
      ) : null}
      {iconRight ? (
        <span className={box} style={style}>
          {iconRight}
        </span>
      ) : null}
    </>
  );
}

export {Icon};
