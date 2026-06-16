import {ComponentProps, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";

/** M3E color styles: primary/secondary/tertiary = the *-container sets
 * (primary-container is the spec default). */
export type ExtendedFABVariant = "primary" | "secondary" | "tertiary";

/** M3 Expressive extended FAB sizes: small 56 / medium 80 / large 96. */
export type ExtendedFABSize = "small" | "medium" | "large";

const SIZES: Record<ExtendedFABSize, {classes?: string; icon: number}> = {
  small: {icon: 24},
  medium: {classes: "xfabMedium", icon: 28},
  large: {classes: "xfabLarge", icon: 36},
};

export interface ExtendedFABProps extends ComponentProps<"button"> {
  /** Leading icon (24/28/36px box per size). */
  icon?: ReactNode;
  /** M3 Expressive size (small 56 / medium 80 / large 96). */
  size?: ExtendedFABSize;
  /** Label fallback when no children are passed. */
  text?: string;
  variant?: ExtendedFABVariant;
}

/**
 * M3 Expressive extended FAB. Small (default): height 56, shape large,
 * title-medium label, icon 24, symmetric 16dp padding, gap 8. Medium 80
 * (large-increased, title-large, icon 28, padding 26, gap 12) and large
 * 96 (extra-large, headline-small, icon 36, padding 28, gap 16).
 * Elevation 3→4. (The surface color style is no longer recommended in M3
 * Expressive; the default is primary = primary-container.)
 */
function ExtendedFAB({
  children,
  className,
  icon,
  size = "small",
  text,
  type = "button",
  variant = "primary",
  ...props
}: ExtendedFABProps) {
  useRipple();
  return (
    <button
      className={cn("fabExtended", variant, SIZES[size].classes, className)}
      type={type}
      {...props}>
      <Icon icon={icon} size={SIZES[size].icon} />
      {children ?? text}
    </button>
  );
}

export {ExtendedFAB};
