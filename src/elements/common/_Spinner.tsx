import {cn} from "../../utils/helpers";

export interface SpinnerProps {
  className?: string;
  /** Diameter in px (M3 baseline 40 — the non-wavy
   * `CircularProgressIndicatorTokens.Size`). */
  size?: number;
  /** Stroke width in px (M3 active indicator: 4). */
  strokeWidth?: number;
}

/**
 * M3 circular indeterminate spinner: an SVG arc that grows and shrinks
 * (~10°↔270°) while it spins, with **round line caps** so it matches the
 * determinate `Circle` and the M3 spec. (@material/web's border-based
 * indeterminate leaves the caps flat — this deviates on purpose for visual
 * consistency.) `pathLength={100}` normalises the dash animation so one
 * keyframe works at any size/stroke. Draws in `currentColor`, so the caller
 * sets the color (`Circle` passes `text-primary`; `Loading` inherits it).
 * Shared by `Loading` and `Circle` (indeterminate).
 */
function Spinner({className, size = 40, strokeWidth = 4}: SpinnerProps) {
  // Scale the stroke into the 48-unit viewBox, like the determinate Circle.
  const sw = strokeWidth * (48 / size);
  return (
    <svg
      className={cn("circularIndeterminate", className)}
      fill="none"
      height={size}
      viewBox="0 0 48 48"
      width={size}>
      <circle
        cx={24}
        cy={24}
        pathLength={100}
        r={24 - sw / 2}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={sw}
      />
    </svg>
  );
}

export {Spinner};
