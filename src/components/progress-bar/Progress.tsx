import {cn} from "../../utils/helpers";

export interface ProgressLabels {
  /** Accessible name (aria-label). Default "Progress". */
  label?: string;
}

const PROGRESS_LABELS: Required<ProgressLabels> = {label: "Progress"};

export interface ProgressProps {
  className?: string;
  /** Looping animation instead of a fixed value. */
  indeterminate?: boolean;
  /** Customizable accessible name. */
  labels?: ProgressLabels;
  /** Track/indicator thickness in px (spec: default 4, configurable —
   * the thick sample is 8). The stop indicator stays 4. */
  thickness?: number;
  /** 0–100. */
  value?: number;
  /** M3 Expressive: the active indicator ripples as a sine wave. */
  wavy?: boolean;
}

/* Sine-like stroke (quadratic approximation), amplitude 3, centered in a
 * (thickness + 6)px-tall box. The determinate active wave is wavelength 40,
 * the indeterminate one 20 (md.comp tokens). 2460px spans any realistic bar;
 * a half wavelength is `q<wavelength/4> ∓6 <wavelength/2> 0`. */
function wavePath(center: number, wavelength = 40): string {
  const control = wavelength / 4;
  const half = wavelength / 2;
  const reps = Math.ceil(2460 / wavelength);
  const cycle = `q${control} -6 ${half} 0q${control} 6 ${half} 0`;
  return `M0 ${center}${cycle.repeat(reps)}`;
}

/**
 * M3 Expressive linear progress indicator: primary active indicator over
 * a secondary-container track with a 4px gap and a stop indicator.
 * Determinate transitions follow @material/web (250ms); the flat
 * indeterminate runs the @material/web 2s two-bar choreography. The `wavy`
 * indeterminate runs that same two-bar choreography — two primary segments
 * sweep across the track (their head/tail clip-path is derived from the flat
 * variant's translate/scale timing) — but each segment shows the same
 * traveling sine as the determinate active indicator (wavelength 40,
 * amplitude 3, one wavelength per second).
 */
function Progress({
  className,
  indeterminate,
  labels,
  thickness = 4,
  value = 0,
  wavy,
}: ProgressProps) {
  const l = {...PROGRESS_LABELS, ...labels};
  const clamped = Math.min(100, Math.max(0, value));
  const height = wavy ? thickness + 6 : thickness;

  // Traveling sine stroke shared by every wavy surface (determinate active
  // indicator and both indeterminate segments). The 2460px width spans any
  // realistic bar; `.wavePhase` shifts it one wavelength (40px) per second.
  const renderWave = () => (
    <div className="wavePhase">
      <svg
        aria-hidden
        className="shrink-0"
        fill="none"
        height={height}
        viewBox={`0 0 2460 ${height}`}
        width={2460}>
        <path
          d={wavePath(height / 2)}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={thickness}
        />
      </svg>
    </div>
  );

  return (
    <div
      aria-label={l.label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cn("relative w-full", className)}
      role="progressbar"
      style={{height}}>
      {indeterminate ? (
        wavy ? (
          // Two primary wave segments sweep across a secondary-container
          // track — the @material/web 2s two-bar choreography (each segment's
          // head/tail clip-path is derived from the flat variant's
          // translate/scale timing), but the active indicator is the same
          // traveling sine as the determinate variant.
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-secondary-container"
              style={{height: thickness}}
            />
            <div className="waveSeg waveSegPrimary text-primary">
              {renderWave()}
            </div>
            <div className="waveSeg waveSegSecondary text-primary">
              {renderWave()}
            </div>
          </div>
        ) : (
          // @material/web two-bar: a primary + a secondary bar translate and
          // scale across the secondary-container track.
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-secondary-container" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="linearBar linearPrimaryBar rounded-full text-primary">
                <div className="linearBarInner" />
              </div>
              <div className="linearBar linearSecondaryBar rounded-full text-primary">
                <div className="linearBarInner" />
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          {/* active indicator */}
          {wavy ? (
            <div
              className="linearDeterminate absolute inset-y-0 left-0 overflow-hidden text-primary"
              style={{width: `${clamped}%`}}>
              {renderWave()}
            </div>
          ) : (
            <div
              className="linearDeterminate absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{width: `${clamped}%`}}
            />
          )}
          {/* track (4px gap from the active indicator) */}
          <div
            className={cn(
              "linearDeterminate absolute right-0 rounded-full bg-secondary-container",
              wavy ? "top-1/2 -translate-y-1/2" : "inset-y-0",
            )}
            style={{
              height: wavy ? thickness : undefined,
              width: `max(calc(${100 - clamped}% - ${clamped > 0 ? 4 : 0}px), 0px)`,
            }}
          />
          {/* stop indicator (always 4; thick variants inset it
           * by the 2px trailing space of the spec sample) */}
          <span
            className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-primary"
            style={{right: thickness > 4 ? 2 : 0}}
          />
        </>
      )}
    </div>
  );
}

export {Progress};
