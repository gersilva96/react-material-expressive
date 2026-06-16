// Internal helpers shared by the text field and select components. Not
// exported from the public barrel.
import {ReactNode, useRef, useState} from "react";
import {cn} from "../../utils/helpers";
import {useIsomorphicLayoutEffect} from "../../utils/_useIsomorphicLayoutEffect";

export interface FloatingLabelProps {
  children: ReactNode;
  /** Color classes (labelColor). */
  className?: string;
  floating: boolean;
  /** Position/type classes of the floated label. */
  floatingClassName: string;
  htmlFor?: string;
  /** Position/type classes of the resting label. */
  restingClassName: string;
}

/**
 * Field label that floats like @material/web's: two label elements (one
 * per state, fixed classes) with only one visible, and a transform-only
 * WAAPI tween between their measured rects (150ms emphasized) on the
 * floating copy. Interpolating font-size instead re-rasterizes the text
 * every frame and the baseline wobbles — the label looks like it dips
 * before floating. The scale uses the width ratio (mw field.ts) so
 * letter-spacing doesn't skew it.
 */
export function FloatingLabel({
  children,
  className,
  floating,
  floatingClassName,
  htmlFor,
  restingClassName,
}: FloatingLabelProps) {
  const floatingRef = useRef<HTMLSpanElement>(null);
  const restingRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const prevFloating = useRef(floating);
  const [animating, setAnimating] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (prevFloating.current === floating) return;
    prevFloating.current = floating;
    // The tween targets the inner TEXT spans, not the labels: the
    // outlined floating label carries px-1 (notch padding) which
    // polluted a label-level width ratio (scale came out ~0.97
    // instead of ~1.27 and the swap popped the font size), and
    // element scrollWidth is integer-rounded anyway. Span rects are
    // sub-pixel and text-only.
    const floatingEl = floatingRef.current;
    const restingEl = restingRef.current;
    if (!floatingEl || !restingEl) return;

    const f = floatingEl.getBoundingClientRect();
    const r = restingEl.getBoundingClientRect();
    if (!f.width || !r.width) return;

    const scale = r.width / f.width;
    const xDelta = r.x - f.x;
    // The line-heights differ; adjust by half of the scaled height
    // delta so the tween lands exactly on the resting baseline (mw).
    const yDelta = r.y - f.y + Math.round((r.height - f.height * scale) / 2);
    const rest = `translateX(${xDelta}px) translateY(${yDelta}px) scale(${scale})`;
    const float = `translateX(0) translateY(0) scale(1)`;

    animationRef.current?.cancel();
    setAnimating(true);
    // fill:forwards holds the final transform after the tween ends —
    // without it the floating copy reverts to its natural position
    // for the frame(s) between the animation finishing and React
    // committing the visibility swap (a flash back to the floated
    // spot, visible when the swap render is delayed e.g. by the
    // select menu unmounting). The fill is released right after the
    // swap commits (effect below).
    const animation = floatingEl.animate(
      {transform: floating ? [rest, float] : [float, rest]},
      {
        duration: 150,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
        fill: "forwards",
      },
    );
    animationRef.current = animation;
    // Guarded: cancelling the PREVIOUS animation (just above) fires
    // its stale cancel listener async — without the check it cleared
    // `animating` right after the new tween started and the reverse
    // animation snapped invisibly.
    const done = () => {
      if (animationRef.current === animation) setAnimating(false);
    };
    animation.addEventListener("finish", done);
    animation.addEventListener("cancel", done);
  }, [floating]);

  useIsomorphicLayoutEffect(() => {
    // Once the visibility swap is committed (the animated copy is
    // hidden), release the filled transform before the next paint.
    if (animating || !animationRef.current) return;
    animationRef.current.cancel();
    animationRef.current = null;
  }, [animating]);

  // The floating copy is the one shown while animating (mw swaps the
  // visible label only when the tween finishes).
  const showFloating = floating || animating;
  return (
    <>
      <label
        aria-hidden
        className={cn(
          "pointer-events-none absolute",
          floatingClassName,
          className,
          !showFloating && "opacity-0",
        )}>
        <span className="inline-block origin-top-left" ref={floatingRef}>
          {children}
        </span>
      </label>
      <label
        className={cn(
          "pointer-events-none absolute",
          restingClassName,
          className,
          showFloating && "opacity-0",
        )}
        htmlFor={htmlFor}>
        <span className="inline-block" ref={restingRef}>
          {children}
        </span>
      </label>
    </>
  );
}

/**
 * Floating-label state driven by focus + value (NOT by
 * peer-placeholder-shown), so the label always lands in the same place.
 */
export function useFieldState(
  value: unknown,
  defaultValue: unknown,
  disabled?: boolean,
) {
  const [focused, setFocusedState] = useState(false);
  const [internalHasValue, setInternalHasValue] = useState(
    defaultValue !== undefined &&
      defaultValue !== null &&
      String(defaultValue).length > 0,
  );
  const hasValue =
    value !== undefined && value !== null
      ? String(value).length > 0
      : internalHasValue;

  return {
    focused: focused && !disabled,
    hasValue,
    setFocused: setFocusedState,
    setInternalHasValue,
  };
}

export function labelColor(opts: {
  disabled?: boolean;
  error?: boolean;
  focused: boolean;
}): string {
  if (opts.disabled) return "text-on-surface/38";
  if (opts.error) return "text-error";
  if (opts.focused) return "text-primary";
  return "text-on-surface-variant";
}

export interface SupportingTextProps {
  error?: boolean;
  errorText?: ReactNode;
  /** Id so the field can point its aria-describedby here. */
  id?: string;
  supportingText?: ReactNode;
}

export function SupportingText({
  error,
  errorText,
  id,
  supportingText,
}: SupportingTextProps) {
  const isError = !!(error && errorText);
  const text = isError ? errorText : supportingText;
  if (!text) return null;
  return (
    <p
      // The error message is announced when it appears; plain
      // supporting text stays silent to avoid spurious announcements.
      role={isError ? "alert" : undefined}
      id={id}
      className={cn(
        "px-4 pt-1 text-body-small",
        error ? "text-error" : "text-on-surface-variant",
      )}>
      {text}
    </p>
  );
}

export function FieldIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-auto absolute flex h-6 w-6 items-center justify-center leading-none text-on-surface-variant",
        className,
      )}>
      {children}
    </span>
  );
}
