import {ReactNode, useEffect, useId, useRef} from "react";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useFocusTrap} from "../_useFocusTrap";
import {IconButton} from "../button/IconButton";

export interface SideSheetLabels {
  /** aria-label for the default close button. Default "Close". */
  close?: string;
  /** Accessible name for the sheet when no `title` is rendered.
   * Default "Side sheet". */
  label?: string;
}

const SIDE_SHEET_LABELS: Required<SideSheetLabels> = {
  close: "Close",
  label: "Side sheet",
};

export interface SideSheetProps {
  children?: ReactNode;
  className?: string;
  /** true renders the default close icon button; pass a node for a
   * custom one. */
  closeButton?: boolean | ReactNode;
  isVisible?: boolean;
  /** Customizable accessible names. */
  labels?: SideSheetLabels;
  onClose?: () => void;
  /** Header title (title-large). */
  title?: ReactNode;
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
 * M3 modal side sheet: docked right, width up to 400, large start corners,
 * surface-container-low, 32% scrim, slides in from the right and animates
 * out before unmounting.
 */
function SideSheet({
  children,
  className,
  closeButton,
  isVisible = false,
  labels,
  onClose,
  title,
}: SideSheetProps) {
  const {exiting, mounted} = useDismissable(isVisible, 200);
  const l = {...SIDE_SHEET_LABELS, ...labels};
  const panel = useRef<HTMLElement>(null);
  const trapTab = useFocusTrap(panel, mounted);
  const titleId = useId();

  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted]);

  useEffect(() => {
    if (!isVisible || !onClose) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isVisible, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[var(--md-sys-z-modal)] flex justify-end bg-scrim/32",
        exiting ? "animate-scrim-sheet-out" : "animate-scrim-sheet-in",
      )}
      onClick={onClose}>
      <aside
        aria-label={!title ? l.label : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={cn(
          "flex h-full w-[360px] max-w-[90vw] flex-col overflow-y-auto rounded-l-large bg-surface-container-low p-6 text-on-surface shadow-mm-1 sm:w-[400px]",
          exiting ? "animate-transition-right-out" : "animate-transition-right",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapTab}
        ref={panel}
        role="dialog"
        tabIndex={-1}>
        {title || closeButton ? (
          <div className="mb-4 flex w-full items-center justify-between gap-3">
            <div
              className="flex w-full justify-start text-title-large text-on-surface-variant"
              id={titleId}>
              {title}
            </div>
            {closeButton === true ? (
              <IconButton
                aria-label={l.close}
                icon={<CloseIcon />}
                onClick={onClose}
                variant="standard"
              />
            ) : (
              closeButton
            )}
          </div>
        ) : null}
        {children}
      </aside>
    </div>
  );
}

export {SideSheet};
