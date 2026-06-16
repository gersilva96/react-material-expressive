import {ComponentProps, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";

export type FABSize = "fab" | "fabMedium" | "fabLarge";
/** M3E color styles: primary/secondary/tertiary = the *-container sets
 * (primary-container is the spec default). */
export type FABVariant = "primary" | "secondary" | "tertiary";

const FAB_ICON_SIZE: Record<FABSize, number> = {
  fab: 24,
  fabMedium: 28,
  fabLarge: 36,
};

export interface FABProps extends ComponentProps<"button"> {
  /** Icon node. 24px box (28 for fabMedium, 36 for fabLarge). */
  icon?: ReactNode;
  /** Container: 56 (fab) / 80 (fabMedium, default — "most recommended"
   * per the spec) / 96 (fabLarge). */
  size?: FABSize;
  variant?: FABVariant;
}

/**
 * M3 Expressive floating action button. Sizes 56/80/96 (default medium 80,
 * "most recommended"; the small 40 FAB and the surface color style are no
 * longer recommended in M3 Expressive) with shapes large/large-increased/
 * extra-large, elevation level 3 (level 4 on hover). Icon-only — pass an
 * accessible name (aria-label).
 */
function FAB({
  children,
  className,
  icon,
  size = "fabMedium",
  type = "button",
  variant = "primary",
  ...props
}: FABProps) {
  useRipple();
  return (
    <button
      className={cn("fab", size !== "fab" && size, variant, className)}
      type={type}
      {...props}>
      <Icon icon={icon ?? children} size={FAB_ICON_SIZE[size]} />
    </button>
  );
}

export {FAB};
