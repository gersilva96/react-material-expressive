import {ComponentProps, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";

export type IconButtonVariant = "filled" | "tonal" | "outlined" | "standard";

/** M3 Expressive icon button sizes: 32 / 40 / 56 / 96 / 136. */
export type IconButtonSize = "xs" | "s" | "m" | "l" | "xl";

/** M3 Expressive icon button shapes. */
export type IconButtonShape = "round" | "square";

/** M3 Expressive icon button width: narrow / default / wide. */
export type IconButtonWidth = "narrow" | "default" | "wide";

interface SizeConfig {
  height: string;
  icon: number;
  /** Square-shape radius; pressing morphs round↔square. */
  round: string;
  square: string;
  widths: Record<IconButtonWidth, string>;
}

const SIZES: Record<IconButtonSize, SizeConfig> = {
  xs: {
    height: "h-8",
    icon: 20,
    round: "rounded-[16px] active:rounded-small",
    square: "rounded-medium active:rounded-small",
    widths: {narrow: "w-7", default: "w-8", wide: "w-10"},
  },
  s: {
    height: "h-10",
    icon: 24,
    round: "rounded-[20px] active:rounded-small",
    square: "rounded-medium active:rounded-small",
    widths: {narrow: "w-8", default: "w-10", wide: "w-13"},
  },
  m: {
    height: "h-14",
    icon: 24,
    round: "rounded-[28px] active:rounded-medium",
    square: "rounded-large active:rounded-medium",
    widths: {narrow: "w-12", default: "w-14", wide: "w-18"},
  },
  l: {
    height: "h-24",
    icon: 32,
    round: "rounded-[48px] active:rounded-large",
    square: "rounded-extra-large active:rounded-large",
    widths: {narrow: "w-16", default: "w-24", wide: "w-32"},
  },
  xl: {
    height: "h-34",
    icon: 40,
    round: "rounded-[68px] active:rounded-large",
    square: "rounded-extra-large active:rounded-large",
    widths: {narrow: "w-26", default: "w-34", wide: "w-46"},
  },
};

/** Toggle colors (M3 Expressive icon-buttons spec; mw v0_192 predates the
 * Expressive update — filled/tonal unselected and tonal selected differ). */
const TOGGLE_COLORS: Record<IconButtonVariant, {off: string; on: string}> = {
  filled: {
    off: "bg-surface-container text-on-surface-variant",
    on: "bg-primary text-on-primary",
  },
  tonal: {
    off: "bg-secondary-container text-on-secondary-container",
    on: "bg-secondary text-on-secondary",
  },
  outlined: {
    off: "border-outline bg-transparent text-on-surface-variant",
    on: "border-transparent bg-inverse-surface text-inverse-on-surface",
  },
  standard: {
    off: "text-on-surface-variant",
    on: "text-primary",
  },
};

export interface IconButtonProps extends ComponentProps<"button"> {
  /** Icon node (24px box by default). Children work as a fallback
   * slot. */
  icon?: ReactNode;
  /** M3 Expressive toggle: selected/unselected colors per variant; the
   * shape also flips (unselected round, selected square). */
  selected?: boolean;
  /** M3 Expressive shape: round (default) or square. Pressing morphs
   * to the opposite shape. */
  shape?: IconButtonShape;
  /** M3 Expressive size (xs 32 / s 40 / m 56 / l 96 / xl 136). Default
   * s — the classic 40x40 icon button. */
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  /** M3 Expressive width: narrow / default / wide. */
  width?: IconButtonWidth;
}

/**
 * M3 icon button: 40x40 visual container (48x48 touch target), icon 24,
 * with the M3 Expressive size/shape/width and toggle (selected) variants.
 * Icon-only — remember to pass an accessible name (aria-label).
 */
function IconButton({
  children,
  className,
  icon,
  selected,
  shape,
  size = "s",
  type = "button",
  variant = "filled",
  width = "default",
  ...props
}: IconButtonProps) {
  useRipple();
  const sizeConfig = SIZES[size];
  const isToggle = selected !== undefined;
  // Toggle shape flips to the OPPOSITE on selection (DSDB: selected
  // round = the square radius, selected square = full) — also when an
  // explicit `shape` is passed.
  const base: IconButtonShape = shape ?? "round";
  const resolvedShape: IconButtonShape =
    isToggle && selected ? (base === "round" ? "square" : "round") : base;

  return (
    <button
      aria-pressed={isToggle ? selected : undefined}
      className={cn(
        "iconBtn",
        variant,
        sizeConfig.height,
        sizeConfig.widths[width],
        sizeConfig[resolvedShape],
        isToggle &&
          !props.disabled &&
          TOGGLE_COLORS[variant][selected ? "on" : "off"],
        className,
      )}
      type={type}
      {...props}>
      {/* 48x48 touch target for the sub-48 sizes */}
      {size === "xs" || size === "s" ? (
        <span
          aria-hidden
          className={cn("absolute", size === "xs" ? "-inset-2" : "-inset-1")}
        />
      ) : null}
      <Icon icon={icon ?? children} size={sizeConfig.icon} />
    </button>
  );
}

export {IconButton};
