import {ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {cn} from "../../utils/helpers";

export interface SnackbarWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed bottom-centered stacking area for snackbars, portaled to
 * `document.body`. The portal is what makes snackbars reliable: a plain
 * `position: fixed` element stays trapped in the stacking context of any
 * positioned, z-indexed ancestor, so app content could paint over it no
 * matter how high its `z-index` is. Rendering into `body` lets it always sit
 * above the page. SSR-safe: renders nothing until mounted on the client.
 */
function SnackbarWrapper({children, className}: SnackbarWrapperProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 top-auto bottom-0 z-[var(--md-sys-z-snackbar)] flex justify-center">
      <div
        className={cn(
          "pointer-events-auto absolute bottom-4 flex w-full max-w-[600px] flex-col items-center justify-center gap-3",
          className,
        )}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export {SnackbarWrapper};
