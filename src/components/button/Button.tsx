import {ComponentProps, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";

export type ButtonVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated"
  | "text";

/** M3 Expressive button sizes: 32 / 40 / 56 / 96 / 136. */
export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";

/** M3 Expressive button shapes: round (full) or square (per-size). */
export type ButtonShape = "round" | "square";

interface SizeConfig {
  /** .btn size class + symmetric padding (M3 Expressive spec). */
  classes: string;
  icon: number;
  /** Square-shape radius for the size; pressing morphs round↔square. */
  round: string;
  square: string;
}

const SIZES: Record<ButtonSize, SizeConfig> = {
  xs: {
    classes: "sizeXs px-3",
    icon: 20,
    round: "rounded-[16px] active:rounded-small",
    square: "rounded-medium active:rounded-small",
  },
  s: {
    classes: "sizeS px-4",
    icon: 20,
    round: "rounded-[20px] active:rounded-small",
    square: "rounded-medium active:rounded-small",
  },
  m: {
    classes: "sizeM px-6",
    icon: 24,
    round: "rounded-[28px] active:rounded-medium",
    square: "rounded-large active:rounded-medium",
  },
  l: {
    classes: "sizeL px-12",
    icon: 32,
    round: "rounded-[48px] active:rounded-large",
    square: "rounded-extra-large active:rounded-large",
  },
  xl: {
    classes: "sizeXl px-16",
    icon: 40,
    round: "rounded-[68px] active:rounded-large",
    square: "rounded-extra-large active:rounded-large",
  },
};

/** Toggle colors (M3 Expressive buttons spec; the text variant has no
 * toggle — its color set ships no unselected/selected tokens). */
const TOGGLE_COLORS: Record<
  Exclude<ButtonVariant, "text">,
  {off: string; on: string}
> = {
  elevated: {
    off: "bg-surface-container-low text-primary",
    on: "bg-primary text-on-primary",
  },
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
};

export interface ButtonProps extends ComponentProps<"button"> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** M3 Expressive toggle: selected/unselected colors per variant (the
   * text variant has no toggle) and the shape follows the selection
   * (unselected round, selected square) when `size` is set. Emits
   * aria-pressed, so connected button groups pick it up. */
  selected?: boolean;
  /** M3 Expressive shape: round (default) or square. Pressing morphs
   * to the opposite shape. */
  shape?: ButtonShape;
  /** M3 Expressive size (xs 32 / s 40 / m 56 / l 96 / xl 136) with
   * per-size label scale, icon, symmetric padding and square radius.
   * Default `s` (the spec's small, the default button size). */
  size?: ButtonSize;
  /** Label fallback when no children are passed. */
  text?: string;
  variant?: ButtonVariant;
}

/**
 * M3 Expressive button. Five sizes (xs 32 / s 40 / m 56 / l 96 / xl 136,
 * default `s`) with per-size label scale, icon, symmetric padding and
 * square radius; shape (round/square + pressed morph) and toggle
 * (selected) variants.
 */
function Button({
  children,
  className,
  iconLeft,
  iconRight,
  selected,
  shape,
  size = "s",
  text,
  type = "button",
  variant = "filled",
  ...props
}: ButtonProps) {
  useRipple();
  const sizeConfig = SIZES[size];
  const isToggle = selected !== undefined && variant !== "text";
  // Toggle shape follows selection (round → square); an explicit
  // `shape` prop wins.
  const resolvedShape: ButtonShape =
    shape ?? (isToggle && selected ? "square" : "round");

  return (
    <button
      aria-pressed={isToggle ? selected : undefined}
      className={cn(
        "btn",
        variant,
        sizeConfig.classes,
        sizeConfig[resolvedShape],
        isToggle &&
          !props.disabled &&
          TOGGLE_COLORS[variant as Exclude<ButtonVariant, "text">][
            selected ? "on" : "off"
          ],
        className,
      )}
      type={type}
      {...props}>
      <Icon iconLeft={iconLeft} size={sizeConfig.icon} />
      {children ?? text}
      <Icon iconRight={iconRight} size={sizeConfig.icon} />
    </button>
  );
}

export {Button};
