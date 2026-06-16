import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {Spinner} from "../../elements/common/_Spinner";
import {outlineLength, sampleProfile, toPath} from "./_shapes";

/* Wavy ring (M3 Expressive circular tokens): amplitude 1.6dp, wavelength
 * 15dp, baseline size 48. The wave travels one wavelength per second
 * (waveSpeed = wavelength, like Compose) via SMIL phase morphing: the
 * sine argument must run a FULL 2π for the pattern to shift exactly one
 * wavelength and loop seamlessly. 16 phase steps keep the interpolation
 * amplitude dip under 2%. */
const WAVE_AMPLITUDE = 1.6;
const WAVE_LENGTH = 15;
const WAVE_SAMPLES = 144;
const WAVE_PHASES = 16;

export interface CircleLabels {
  /** Accessible name (aria-label). Default "Progress". */
  label?: string;
}

const CIRCLE_LABELS: Required<CircleLabels> = {label: "Progress"};

export interface CircleProps {
  /** Center content (e.g. the percentage). */
  children?: ReactNode;
  className?: string;
  /** Spinning arc instead of a fixed value. */
  indeterminate?: boolean;
  /** Customizable accessible name. */
  labels?: CircleLabels;
  /** Diameter in px (M3 Expressive baselines: flat 40, wavy 48). */
  size?: number;
  /** Stroke width in px (M3 active indicator: 4). */
  strokeWidth?: number;
  /** 0–100. */
  value?: number;
  /** M3 Expressive: the active indicator ripples around the ring — both the
   * determinate arc and the indeterminate spinner. */
  wavy?: boolean;
}

/**
 * M3 Expressive circular progress indicator: primary arc over a
 * secondary-container track with a 4px gap (determinate, stroke moves in
 * 500ms) or an indeterminate spinner: an SVG arc with round caps that grows
 * ~10°↔270° as it spins (the flat spinner reuses `_Spinner`, 40dp baseline).
 * `wavy` ripples the active indicator (amplitude 1.6, wavelength 15, baseline
 * 48) with the wave traveling one wavelength per second — for the determinate
 * arc and for the indeterminate spinner, which keeps the same spin +
 * grow/shrink dash on the rippled ring.
 */
function Circle({
  children,
  className,
  indeterminate,
  labels,
  size: sizeProp,
  strokeWidth = 4,
  value = 0,
  wavy,
}: CircleProps) {
  const l = {...CIRCLE_LABELS, ...labels};
  const size = sizeProp ?? (wavy ? 48 : 40);
  const clamped = Math.min(100, Math.max(0, value));
  const sw = strokeWidth * (48 / size);
  // Compose flattens the determinate wave outside 10–95% progress (the
  // indicatorAmplitude lambda); its 500ms amplitude tweens apply to a
  // continuously animated progress, so a redraw approximates them here. The
  // indeterminate spinner has no value, so its wave stays at full amplitude.
  const isWavy =
    Boolean(wavy) && !indeterminate && clamped > 10 && clamped < 95;
  const indetWavy = Boolean(wavy) && Boolean(indeterminate);
  const useWave = isWavy || indetWavy;
  // Wave metrics keep their physical px size like the stroke does.
  const amplitude = useWave ? WAVE_AMPLITUDE * (48 / size) : 0;
  const radius = 24 - sw / 2 - amplitude;
  const circumference = 2 * Math.PI * radius;
  const activeLength = (circumference * clamped) / 100;
  // M3 Expressive: 4px gap on each side of the active indicator.
  const gap = Math.min(4 * (48 / size), circumference / 8);
  const partial = clamped > 0 && clamped < 100;
  const trackLength = Math.max(
    circumference - activeLength - (partial ? gap * 2 : 0),
    0,
  );

  // Wavy active arc: a closed rippled ring revealed by dash lengths in
  // its own (longer) length space; the phase morph makes it travel.
  const waves = Math.round(circumference / (WAVE_LENGTH * (48 / size)));
  const wavePhases = useWave
    ? Array.from({length: WAVE_PHASES + 1}, (_, i) => {
        const phase = 2 * Math.PI * (i / WAVE_PHASES);
        return sampleProfile(
          (theta) => radius + amplitude * Math.sin(waves * theta - phase),
          WAVE_SAMPLES,
          24,
        );
      })
    : null;
  const waveLength = wavePhases ? outlineLength(wavePhases[0]) : 0;

  return (
    <span
      aria-label={l.label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      role="progressbar"
      style={{height: size, width: size}}>
      {indeterminate ? (
        indetWavy && wavePhases ? (
          // Wavy spinner: the rippled ring spins (circular-spin) and the
          // visible arc grows/shrinks (circular-dash, pathLength=100) exactly
          // like the flat spinner, while the wave travels one wavelength per
          // second (SMIL phase morph).
          <svg
            className="circularIndeterminate text-primary"
            fill="none"
            height={size}
            viewBox="0 0 48 48"
            width={size}>
            <path
              d={toPath(wavePhases[0])}
              fill="none"
              pathLength={100}
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth={sw}>
              <animate
                attributeName="d"
                dur="1000ms"
                repeatCount="indefinite"
                values={wavePhases.map((points) => toPath(points)).join(";")}
              />
            </path>
          </svg>
        ) : (
          <Spinner
            className="text-primary"
            size={size}
            strokeWidth={strokeWidth}
          />
        )
      ) : (
        <svg
          className="-rotate-90"
          fill="none"
          height={size}
          viewBox="0 0 48 48"
          width={size}>
          {/* track (starts after the active arc + gap) */}
          <circle
            className="circularDeterminate text-secondary-container"
            cx={24}
            cy={24}
            r={radius}
            stroke="currentColor"
            strokeDasharray={`${trackLength} ${circumference}`}
            strokeDashoffset={-(activeLength + (partial ? gap : 0))}
            strokeLinecap="round"
            strokeWidth={sw}
          />
          {/* active indicator (wavy: rippled ring revealed by
           * dash lengths in its own length space) */}
          {wavePhases ? (
            <path
              className="circularDeterminate text-primary"
              d={toPath(wavePhases[0])}
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${(waveLength * clamped) / 100} ${waveLength}`}
              strokeLinecap="round"
              strokeWidth={sw}>
              <animate
                attributeName="d"
                dur="1000ms"
                repeatCount="indefinite"
                values={wavePhases.map((points) => toPath(points)).join(";")}
              />
            </path>
          ) : (
            <circle
              className="circularDeterminate text-primary"
              cx={24}
              cy={24}
              r={radius}
              stroke="currentColor"
              strokeDasharray={`${activeLength} ${circumference}`}
              strokeLinecap="round"
              strokeWidth={sw}
            />
          )}
        </svg>
      )}
      {children ? (
        <span className="absolute inset-0 flex items-center justify-center text-label-medium text-on-surface">
          {children}
        </span>
      ) : null}
    </span>
  );
}

export {Circle};
