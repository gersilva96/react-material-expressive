// Internal: pointer-driven press ripple for state-layer hosts. Replicates
// @material/web's ripple.ts: the radial surface grows from the pointer to
// cover the host in 450ms (easing standard) while CSS handles the opacity
// fades (105ms in, 375ms out) on the ::before layer. Not exported from the
// public barrel.
import {useEffect} from "react";

const PRESS_GROW_MS = 450;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const EASING_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";
const HOSTS = ".state-layer, .btn, .iconBtn, .fab, .fabExtended, .chips";

let installed = false;
const pressed = new WeakMap<Element, Animation>();

function grow(event: PointerEvent) {
  if (event.button !== 0) return;
  const target = event.target as Element | null;
  const host = target?.closest?.(HOSTS);
  if (
    !host ||
    host.matches(":disabled") ||
    host.getAttribute("aria-disabled") === "true"
  ) {
    return;
  }

  // @material/web ripple.ts geometry: the surface starts at 20% of the
  // largest dimension under the pointer and grows until it covers the
  // hypotenuse plus a soft edge.
  const rect = host.getBoundingClientRect();
  const maxDim = Math.max(rect.width, rect.height);
  const softEdgeSize = Math.max(
    SOFT_EDGE_CONTAINER_RATIO * maxDim,
    SOFT_EDGE_MINIMUM_SIZE,
  );
  const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
  const finalSize =
    Math.hypot(rect.width, rect.height) + PADDING + softEdgeSize;
  const startX = event.clientX - rect.left - initialSize / 2;
  const startY = event.clientY - rect.top - initialSize / 2;
  const endX = (rect.width - finalSize) / 2;
  const endY = (rect.height - finalSize) / 2;

  pressed.get(host)?.cancel();
  pressed.set(
    host,
    host.animate(
      {
        backgroundSize: [
          `${initialSize}px ${initialSize}px`,
          `${finalSize}px ${finalSize}px`,
        ],
        backgroundPosition: [`${startX}px ${startY}px`, `${endX}px ${endY}px`],
      },
      {
        duration: PRESS_GROW_MS,
        easing: EASING_STANDARD,
        fill: "forwards",
        pseudoElement: "::before",
      },
    ),
  );
}

/**
 * Installs the (idempotent, delegated) ripple listener. Called by every
 * component that renders a state-layer host so the ripple works no matter
 * which subset of the library a consumer mounts.
 */
export function useRipple() {
  useEffect(() => {
    if (installed) return;
    installed = true;
    document.addEventListener("pointerdown", grow, {passive: true});
  }, []);
}
