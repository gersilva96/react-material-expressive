import {MouseEvent, ReactNode, useEffect, useId, useRef, useState} from "react";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useFocusTrap} from "../_useFocusTrap";
import {DialogContext} from "./_context";
import {DialogBody} from "./DialogBody";
import {DialogFooter} from "./DialogFooter";
import {DialogHeader} from "./DialogHeader";

export interface DialogProps {
  children?: ReactNode;
  className?: string;
  /** Close on scrim click / Escape. Default true. */
  dismissable?: boolean;
  isVisible: boolean;
  /** Accessible name used when no Dialog.Header headline is rendered. */
  label?: string;
  onClose: () => void;
}

/**
 * M3 modal dialog: shape extra-large (28), 280–560dp wide, container
 * surface-container-high, 32% scrim. Mounts/unmounts with enter/exit
 * animations; compose content with Dialog.Header / Dialog.Body /
 * Dialog.Footer.
 */
function Dialog({
  children,
  className,
  dismissable = true,
  isVisible,
  label,
  onClose,
}: DialogProps) {
  // @material/web dialog: open 500ms emphasized, close 150ms accelerate.
  const {exiting, mounted} = useDismissable(isVisible, 150);
  const panel = useRef<HTMLDivElement>(null);
  // Names the dialog after its headline (Dialog.Header — or a picker header
  // — stamps this id on its heading) — mw's aria-labelledby behaviour. When
  // nothing carries the id, fall back to the `label` prop as aria-label.
  const headlineId = useId();
  const [labelled, setLabelled] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted]);

  // mw's <dialog>.showModal() moves focus into the dialog, traps Tab and
  // restores focus on close; this div-based panel replicates that.
  const trapTab = useFocusTrap(panel, mounted);

  useEffect(() => {
    if (!isVisible || !dismissable) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dismissable, isVisible, onClose]);

  if (!mounted) return null;

  const handleScrim = () => {
    if (dismissable) onClose();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[var(--md-sys-z-modal)] flex items-center justify-center bg-scrim/32 p-4",
        exiting ? "animate-scrim-out" : "animate-scrim-in",
      )}
      onClick={handleScrim}>
      <div
        aria-label={!labelled ? label : undefined}
        aria-labelledby={labelled ? headlineId : undefined}
        aria-modal="true"
        className={cn(
          "flex max-h-[calc(100vh-48px)] w-full max-w-[560px] min-w-[280px] flex-col gap-4 overflow-y-auto rounded-extra-large bg-surface-container-high p-6 text-on-surface shadow-mm-3 outline-none",
          exiting ? "animate-dialog-out" : "animate-dialog-in",
          className,
        )}
        onClick={(event: MouseEvent) => event.stopPropagation()}
        onKeyDown={trapTab}
        ref={panel}
        role="dialog"
        tabIndex={-1}>
        <DialogContext.Provider value={{headlineId, setLabelled}}>
          {children}
        </DialogContext.Provider>
      </div>
    </div>
  );
}

Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export {Dialog};
