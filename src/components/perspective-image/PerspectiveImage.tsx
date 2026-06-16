import {ReactNode, useEffect, useRef} from "react";
import {cn} from "../../utils/helpers";

export interface PerspectiveImageProps {
  children?: ReactNode;
  className?: string;
  /** Rotation strength per pixel of cursor distance. */
  intensity?: number;
  /** CSS perspective in px. */
  perspective?: number;
}

/**
 * Tilts its content in 3D following the cursor anywhere on the page
 * (parallax showcase effect). Pointer-only — static on touch devices.
 */
function PerspectiveImage({
  children,
  className,
  intensity = 0.03,
  perspective = 800,
}: PerspectiveImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Cache the center, but keep it fresh when the element moves under
    // the viewport (it was captured once, so the tilt drifted after a
    // scroll or resize).
    let center = {x: 0, y: 0};
    const recenter = () => {
      const {height, width, x, y} = element.getBoundingClientRect();
      center = {x: x + width / 2, y: y + height / 2};
    };
    recenter();

    const handleMouseMove = (event: MouseEvent) => {
      if (reduced.matches) return;
      const degreeX = (event.clientY - center.y) * -intensity;
      const degreeY = (event.clientX - center.x) * intensity;
      element.style.transform = `perspective(${perspective}px) rotateX(${degreeX}deg) rotateY(${degreeY}deg)`;
    };
    // Decorative motion: drop the tilt when the user asks for reduced
    // motion (flatten if the preference flips on mid-session).
    const flatten = () => {
      if (reduced.matches) element.style.transform = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", recenter, true);
    window.addEventListener("resize", recenter);
    reduced.addEventListener("change", flatten);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", recenter, true);
      window.removeEventListener("resize", recenter);
      reduced.removeEventListener("change", flatten);
    };
  }, [intensity, perspective]);

  return (
    <div className={cn("will-change-transform", className)} ref={ref}>
      {children}
    </div>
  );
}

export {PerspectiveImage};
