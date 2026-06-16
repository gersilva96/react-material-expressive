import {ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface BlobProps {
  children?: ReactNode;
  className?: string;
  /** Background class (token-based), e.g. "bg-tertiary/10". */
  color?: string;
  /** Phase offset into the morph loop, in ms (stagger multiple blobs). */
  delay?: number;
  height?: number;
  /** Position classes; defaults to centered. */
  position?: string;
  width?: number;
}

/**
 * Decorative blurred blob with organic border-radius morphing. Position it
 * inside a relatively-positioned container.
 */
function Blob({
  children,
  className,
  color,
  delay,
  height = 300,
  position,
  width = 300,
}: BlobProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-0 flex animate-blob items-center justify-center rounded-full blur-[100px]",
        position ?? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        color ?? "bg-primary/10 dark:bg-primary/15",
        className,
      )}
      style={{
        // Negativo: un delay positivo deja el blob congelado como
        // círculo y pega un snap al vencer; el negativo lo arranca
        // ya avanzado en el loop (offset de fase).
        animationDelay: delay ? `${-delay}ms` : undefined,
        height,
        width,
      }}>
      {children}
    </div>
  );
}

export {Blob};
