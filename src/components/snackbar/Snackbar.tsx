import {ReactNode, useEffect, useRef, useState} from "react";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useRipple} from "../../utils/_ripple";

export interface SnackbarLabels {
  /** aria-label for the dismiss (close) button. Default "Dismiss". */
  dismiss?: string;
}

const SNACKBAR_LABELS: Required<SnackbarLabels> = {dismiss: "Dismiss"};

export interface SnackbarProps {
  /** Optional action button label (rendered as an M3 text button). */
  actionLabel?: string;
  /** Auto-close after N ms (calls onClose). Pauses on hover/focus. */
  autoHideDuration?: number;
  /** Extra trailing content (e.g. custom buttons). */
  button?: ReactNode;
  className?: string;
  /** Custom close icon (defaults to an X). */
  closeIcon?: ReactNode;
  isVisible: boolean;
  /** Customizable accessible names. */
  labels?: SnackbarLabels;
  onAction?: () => void;
  onClose?: () => void;
  /** Show the close icon button. */
  showClose?: boolean;
  text?: ReactNode;
}

function CloseIcon() {
  return (
    <svg aria-hidden fill="none" height={24} viewBox="0 0 24 24" width={24}>
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>
  );
}

/**
 * M3 snackbar: shape extra-small, inverse-surface, min height 48, width
 * 344–600, body-medium. Action and close render as real M3 buttons
 * recolored to inverse roles. `autoHideDuration` closes it automatically
 * and pauses while hovered or focused (M3 a11y guidance).
 */
function Snackbar({
  actionLabel,
  autoHideDuration,
  button,
  className,
  closeIcon,
  isVisible,
  labels,
  onAction,
  onClose,
  showClose,
  text,
}: SnackbarProps) {
  useRipple();
  const l = {...SNACKBAR_LABELS, ...labels};
  const {exiting, mounted} = useDismissable(isVisible, 200);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isVisible || !autoHideDuration || !onClose || paused) return;
    timer.current = setTimeout(onClose, autoHideDuration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [autoHideDuration, isVisible, onClose, paused]);

  return (
    <>
      {/* Persistent polite live region: it stays mounted across the
       * snackbar's show/hide so a screen reader announces the message as
       * a CONTENT CHANGE — a region inserted already-populated is
       * announced unreliably. */}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        role="status">
        {isVisible ? text : ""}
      </div>
      {mounted ? (
        <div
          className={cn(
            "flex min-h-12 w-full max-w-[600px] items-center justify-between gap-2 rounded-extra-small bg-inverse-surface py-1 pr-2 pl-4 text-body-medium text-inverse-on-surface shadow-mm-3 sm:min-w-[344px]",
            exiting ? "animate-snackbar-out" : "animate-snackbar-in",
            className,
          )}
          onBlur={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>
          {/* py-2.5 → 14dp effective vertical text padding with the
           * container py-1, so two-line snackbars reach 68dp (single
           * 48). */}
          <div className="flex py-2.5">{text}</div>
          <div className="flex shrink-0 flex-row items-center gap-1">
            {actionLabel ? (
              <button
                className="btn text px-3 text-inverse-primary"
                onClick={onAction}
                type="button">
                {actionLabel}
              </button>
            ) : null}
            {button}
            {showClose ? (
              <button
                aria-label={l.dismiss}
                className="iconBtn standard text-inverse-on-surface"
                onClick={onClose}
                type="button">
                <span className="flex h-6 w-6 items-center justify-center leading-none">
                  {closeIcon ?? <CloseIcon />}
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export {Snackbar};
