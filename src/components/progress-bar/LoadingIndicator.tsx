import {cn} from "../../utils/helpers";
import {
  MORPH_SPLINES,
  MORPH_TIMES,
  MORPH_VALUES,
} from "./_loadingIndicatorShapes";

/* The M3 active indicator is the EXACT MaterialShapes morph
 * (SoftBurst → Cookie9 → Pentagon → Pill → Sunny → Cookie4 → Oval): the
 * keyframe paths in `_loadingIndicatorShapes` are generated 1:1 from the
 * androidx.graphics.shapes geometry (RoundedPolygon corner-rounding + Morph)
 * by scripts/gen-loading-indicator.mjs. The svg is the 48dp container (the
 * Compose draw surface), NOT the 38dp active size: the shapes scale to the
 * 38dp nominal but the spring overshoot pulses them larger, and a 38px svg
 * would clip the pulse peak (svg defaults to overflow:hidden). Paths are
 * centered at the origin (a translate(24 24) group positions them in the 48px
 * box); the rotation kick accumulates with accumulate="sum", which sums every
 * rotate component — an embedded cx/cy would drift the axis. */
const FIRST_SHAPE = MORPH_VALUES.slice(0, MORPH_VALUES.indexOf(";"));

/* The rotation kick replays the same 650ms morph spring (damping 0.6,
 * stiffness 200): the rotation is `progress * 90` in Compose, so it passes
 * through 90° and the spring overshoot extrapolates to 102.6° (90 × 1.14)
 * before settling — through (~35%), brake at the overshoot (~52%), settle
 * (~85%), dwell. +90° accumulates per morph. */
const ROTATION_TIMES = "0;0.35;0.52;0.85;1";
const ROTATION_SPLINES = "0.4 0 0.9 0.6;0.1 0.4 0.4 1;0.45 0 0.4 1;0 0 1 1";
const ROTATION_VALUES = "0;90;102.6;90;90";

export interface LoadingIndicatorLabels {
  /** Accessible name (aria-label). Default "Loading". */
  label?: string;
}

const LOADING_INDICATOR_LABELS: Required<LoadingIndicatorLabels> = {
  label: "Loading",
};

export interface LoadingIndicatorProps {
  className?: string;
  /** Contained: paints the 48dp fully-round container
   * (primary-container) under an on-primary-container indicator. */
  contained?: boolean;
  /** Customizable accessible name. */
  labels?: LoadingIndicatorLabels;
}

/**
 * M3 Expressive loading indicator: the exact 38dp MaterialShapes morph
 * (SoftBurst → Cookie9 → Pentagon → Pill → Sunny → Cookie4 → Oval) on 650ms
 * spring ticks (through the target at speed, 14% overshoot at the brake,
 * settle, dwell) with a +90° rotation kick per morph on top of the 4666ms
 * global rotation, inside a 48dp container. Default paints only the primary
 * shape; `contained` adds the primary-container circle. Indeterminate by
 * design — for determinate progress use Progress/Circle.
 */
function LoadingIndicator({
  className,
  contained,
  labels,
}: LoadingIndicatorProps) {
  const l = {...LOADING_INDICATOR_LABELS, ...labels};
  return (
    <span
      aria-label={l.label}
      className={cn(
        "relative inline-flex size-12 shrink-0 items-center justify-center",
        contained && "rounded-full bg-primary-container",
        className,
      )}
      role="progressbar">
      <svg
        className={cn(
          "animate-[spin_4666ms_linear_infinite]",
          contained ? "text-on-primary-container" : "text-primary",
        )}
        fill="currentColor"
        height={48}
        viewBox="0 0 48 48"
        width={48}>
        <g transform="translate(24 24)">
          <g>
            {/* +90° kick per morph, accumulating forever
             * (plain angles about the origin). */}
            <animateTransform
              accumulate="sum"
              additive="sum"
              attributeName="transform"
              calcMode="spline"
              dur="650ms"
              keySplines={ROTATION_SPLINES}
              keyTimes={ROTATION_TIMES}
              repeatCount="indefinite"
              type="rotate"
              values={ROTATION_VALUES}
            />
            <path d={FIRST_SHAPE}>
              <animate
                attributeName="d"
                calcMode="spline"
                dur="4550ms"
                keySplines={MORPH_SPLINES}
                keyTimes={MORPH_TIMES}
                repeatCount="indefinite"
                values={MORPH_VALUES}
              />
            </path>
          </g>
        </g>
      </svg>
    </span>
  );
}

export {LoadingIndicator};
