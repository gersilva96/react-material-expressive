// Internal: M3 Expressive slider size presets (md.comp.slider.{xsmall…xlarge}
// — DSDB v34 / m3.material.io measurements). The handle is always 4dp wide;
// the gap (6), inner corner (2), stop (4) and value indicator (44×48) are
// common to every size. Strings are full Tailwind literals so the scanner
// picks them up.
export type SliderSize = "xs" | "s" | "m" | "l" | "xl";

export interface SliderSizeConfig {
  /** Container = handle height (the handle is the tallest part). */
  container: string;
  /** Track height. */
  track: string;
  /** Handle height. */
  handle: string;
  /** Active outer (leading) corner = inactive outer (trailing) corner. */
  cornerL: string;
  cornerR: string;
  /** Inset-icon box size ("" = the size has no inset icon). */
  icon: string;
}

export const SLIDER_SIZES: Record<SliderSize, SliderSizeConfig> = {
  // track 16 / handle 44 / corner 8 (full at 16dp)
  xs: {
    container: "h-11",
    track: "h-4",
    handle: "h-11",
    cornerL: "rounded-l-small",
    cornerR: "rounded-r-small",
    icon: "",
  },
  // track 24 / handle 44 / corner 8
  s: {
    container: "h-11",
    track: "h-6",
    handle: "h-11",
    cornerL: "rounded-l-small",
    cornerR: "rounded-r-small",
    icon: "",
  },
  // track 40 / handle 52 / corner 12 / icon 24
  m: {
    container: "h-13",
    track: "h-10",
    handle: "h-13",
    cornerL: "rounded-l-medium",
    cornerR: "rounded-r-medium",
    icon: "size-6",
  },
  // track 56 / handle 68 / corner 16 / icon 24
  l: {
    container: "h-17",
    track: "h-14",
    handle: "h-17",
    cornerL: "rounded-l-large",
    cornerR: "rounded-r-large",
    icon: "size-6",
  },
  // track 96 / handle 108 / corner 28 / icon 32
  xl: {
    container: "h-27",
    track: "h-24",
    handle: "h-27",
    cornerL: "rounded-l-extra-large",
    cornerR: "rounded-r-extra-large",
    icon: "size-8",
  },
};
