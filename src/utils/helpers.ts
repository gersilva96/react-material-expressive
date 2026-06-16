import {clsx, type ClassValue} from "clsx";
import {extendTailwindMerge} from "tailwind-merge";

// tailwind-merge must learn the library's custom theme scales; otherwise
// class names like text-label-large (font-size) and text-on-primary (color)
// land in the same conflict group and wrongly cancel each other.
const twMergeM3 = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-large",
        "display-medium",
        "display-small",
        "headline-large",
        "headline-medium",
        "headline-small",
        "title-large",
        "title-medium",
        "title-small",
        "body-large",
        "body-medium",
        "body-small",
        "label-large",
        "label-medium",
        "label-small",
      ],
      radius: [
        "none",
        "extra-small",
        "small",
        "medium",
        "large",
        "large-increased",
        "extra-large",
        "extra-large-increased",
        "extra-extra-large",
        "full",
      ],
      shadow: ["mm-1", "mm-2", "mm-3", "mm-4", "mm-5"],
      animate: [
        "fade-in",
        "fade-out",
        "transition-top",
        "transition-bottom",
        "transition-left",
        "transition-right",
        "transition-bottom-out",
        "transition-left-out",
        "transition-right-out",
        "blob",
        "spin-lazy",
        "determinate",
        "indeterminate",
      ],
      ease: ["emphasized", "emphasized-decelerate", "emphasized-accelerate"],
    },
  },
});

/** Merge class names with M3-aware Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMergeM3(clsx(inputs));
}

/**
 * Structural type of a statically imported image (matches the object shape
 * produced by bundlers such as Next.js without depending on them).
 */
export interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

/** Accepted source for image-like components. */
export type ImageSrc = string | StaticImageData;

/** Resolve a plain URL from a string or StaticImageData source. */
export function getSrc(src?: ImageSrc | null): string | undefined {
  if (!src) return undefined;
  return typeof src === "string" ? src : src.src;
}
