// Internal: exit-animation lifecycle for overlays (Dialog, sheets, modal
// drawer, Snackbar). Not exported from the public barrel.
import {useEffect, useState} from "react";

/**
 * Keeps an overlay mounted while its exit animation plays. `exiting` is
 * true between close and unmount — apply the *-out animation then.
 * `duration` must match the exit animation length.
 */
export function useDismissable(
  open: boolean,
  duration = 200,
): {exiting: boolean; mounted: boolean} {
  const [mounted, setMounted] = useState(open);
  const exiting = mounted && !open;

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [duration, open]);

  return {exiting, mounted};
}
