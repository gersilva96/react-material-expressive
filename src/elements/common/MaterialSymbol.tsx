import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";

export interface MaterialSymbolProps extends Omit<
  ComponentProps<"span">,
  "children"
> {
  /** FILL axis (false = outlined glyph, true = filled). */
  fill?: boolean;
  /** GRAD axis (-25..200). */
  grade?: number;
  /** Ligature name, e.g. "favorite". */
  name: string;
  /** opsz axis (20..48). Defaults to `size`. */
  opticalSize?: number;
  /** Font size in px. */
  size?: number;
  /** Symbol style — must match the font the consumer loaded. */
  variant?: "rounded" | "outlined" | "sharp";
  /** wght axis (100..700). */
  weight?: number;
}

const VARIANT_CLASS = {
  rounded: "material-symbols-rounded",
  outlined: "material-symbols-outlined",
  sharp: "material-symbols-sharp",
} as const;

/**
 * Zero-dependency Material Symbols glyph. Renders a ligature span; it only
 * displays if the consumer loaded the corresponding Material Symbols
 * variable font (e.g. from Google Fonts). The library bundles no font.
 */
function MaterialSymbol({
  className,
  fill = false,
  grade = 0,
  name,
  opticalSize,
  size = 24,
  style,
  variant = "rounded",
  weight = 400,
  ...rest
}: MaterialSymbolProps) {
  return (
    <span
      aria-hidden
      className={cn(
        VARIANT_CLASS[variant],
        "inline-block leading-none select-none",
        className,
      )}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize ?? size}`,
        ...style,
      }}
      {...rest}>
      {name}
    </span>
  );
}

export {MaterialSymbol};
