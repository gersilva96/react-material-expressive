import {cn} from "../../utils/helpers";
import {Spinner} from "./_Spinner";

export interface LoadingLabels {
  /** Accessible label (status text). Default "Loading". */
  label?: string;
}

const LOADING_LABELS: Required<LoadingLabels> = {label: "Loading"};

export interface LoadingProps {
  className?: string;
  /** Customizable accessible name. */
  labels?: LoadingLabels;
  /** Diameter in px (M3 default 40 — `CircularProgressIndicatorTokens.Size`;
   * 48 is only the wavy baseline). */
  size?: number;
  /** Stroke width in px (M3 active indicator: 4). */
  strokeWidth?: number;
}

/**
 * Icon-sized circular indeterminate spinner — an SVG arc with round caps
 * that grows ~10°↔270° while it spins (shares `_Spinner` with `Circle`).
 * This IS `<Circle indeterminate />`,
 * kept as a convenience that inherits `currentColor` (defaults to primary) and
 * announces via `role="status"` so it can drop inline in buttons/text. It is
 * NOT the shape-morphing M3 `LoadingIndicator`.
 */
function Loading({
  className,
  labels,
  size = 40,
  strokeWidth = 4,
}: LoadingProps) {
  const l = {...LOADING_LABELS, ...labels};
  return (
    <span
      aria-label={l.label}
      className={cn("relative inline-flex text-primary", className)}
      role="status"
      style={{height: size, width: size}}>
      <Spinner size={size} strokeWidth={strokeWidth} />
    </span>
  );
}

export {Loading};
