import {ReactNode, useEffect, useRef} from "react";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useFocusTrap} from "../_useFocusTrap";

export interface BottomSheetProps {
  children?: ReactNode;
  className?: string;
  /** Show the M3 drag handle (32x4). Default true. */
  dragHandle?: boolean;
  isVisible?: boolean;
  /** Accessible name for the sheet (it is a modal dialog). */
  label?: string;
  onClose?: () => void;
}

/**
 * M3 modal bottom sheet: extra-large top corners, surface-container-low,
 * 32% scrim, slides up and animates out before unmounting.
 */
function BottomSheet({
  children,
  className,
  dragHandle = true,
  isVisible = false,
  label,
  onClose,
}: BottomSheetProps) {
  const {exiting, mounted} = useDismissable(isVisible, 200);
  const panel = useRef<HTMLDivElement>(null);
  const trapTab = useFocusTrap(panel, mounted);

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
        "fixed inset-0 z-40 flex items-end justify-center bg-scrim/32",
        exiting ? "animate-scrim-sheet-out" : "animate-scrim-sheet-in",
      )}
      onClick={onClose}>
      <div
        aria-label={label}
        aria-modal="true"
        className={cn(
          "mt-18 flex max-h-[calc(100vh-72px)] w-full max-w-[640px] flex-col overflow-y-auto rounded-t-extra-large bg-surface-container-low px-6 pb-7 text-on-surface shadow-mm-1",
          exiting
            ? "animate-transition-bottom-out"
            : "animate-transition-bottom",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapTab}
        ref={panel}
        role="dialog"
        tabIndex={-1}>
        {dragHandle ? (
          // Decorative — Escape and the scrim close the sheet.
          <div
            aria-hidden
            className="flex items-center justify-center py-[22px]">
            <span className="flex h-1 w-8 rounded-full bg-on-surface-variant" />
          </div>
        ) : (
          <div className="pt-6" />
        )}
        {children}
      </div>
    </div>
  );
}

export {BottomSheet};
