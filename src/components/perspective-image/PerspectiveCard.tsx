import {ReactNode, useEffect, useRef} from "react";
import {cn} from "../../utils/helpers";

export interface PerspectiveCardProps {
  children?: ReactNode;
  className?: string;
  /** Rotation strength per pixel of cursor distance. */
  intensity?: number;
  /** CSS perspective in px. */
  perspective?: number;
}

/**
 * Tilts its content in 3D while hovered, resetting on leave. Pointer-only —
 * static on touch devices.
 */
function PerspectiveCard({
  children,
  className,
  intensity = 0.025,
  perspective = 800,
}: PerspectiveCardProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMouseMove = (event: MouseEvent) => {
      if (reduced.matches) return;
      const rect = element.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const degreeX = (mouseY - rect.height / 2) * -intensity;
      const degreeY = (mouseX - rect.width / 2) * intensity;
      element.style.transform = `perspective(${perspective}px) rotateX(${degreeX}deg) rotateY(${degreeY}deg)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
    };
    // Decorative motion: flatten if reduced-motion flips on mid-session.
    const flatten = () => {
      if (reduced.matches) element.style.transform = "";
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    reduced.addEventListener("change", flatten);
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      reduced.removeEventListener("change", flatten);
    };
  }, [intensity, perspective]);

  return (
    <span
      className={cn(
        "inline-block transition-transform duration-100 will-change-transform",
        className,
      )}
      ref={ref}>
      {children}
    </span>
  );
}

export {PerspectiveCard};
