// Internal media helper — NOT exported from any public barrel.
// Centralizes the framework-agnostic media contract used by image-like
// components (Avatar, Img, MediaFrame consumers, Stories items,
// PerspectiveImage...): the consumer can inject its own media node, and the
// library falls back to a native <img> with object-fit + hide-on-error.
import {CSSProperties, ReactNode, useEffect, useState, type JSX} from "react";
import {getSrc, type ImageSrc} from "../../utils/helpers";

export type ObjectFit = "fill" | "contain" | "cover" | "none" | "scale-down";

/** Context handed to a `render` prop so custom media (e.g. a framework
 * image component) can reuse the resolved src and layout classes. */
export interface MediaRenderContext {
  alt: string;
  className: string;
  src?: string;
  style: CSSProperties;
}

/** Shared injection props for image-like components.
 * Priority: render > image > children > native <img>. */
export interface MediaInjectionProps {
  /** Fallback media node (lowest injection priority). */
  children?: ReactNode;
  /** Pre-built media node, e.g. `<Image .../>` from a framework. */
  image?: ReactNode;
  /** Full-control render prop; receives the resolved src and classes. */
  render?: (media: MediaRenderContext) => ReactNode;
}

interface NativeImgProps {
  alt: string;
  className?: string;
  objectFit?: ObjectFit;
  src: string;
  style?: CSSProperties;
}

/** Native <img> that removes itself when the source fails to load, letting
 * the placeholder underneath show through. */
function NativeImg({
  alt,
  className,
  objectFit = "cover",
  src,
  style,
}: NativeImgProps): JSX.Element | null {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (errored) return null;
  return (
    <img
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      src={src}
      style={{objectFit, ...style}}
    />
  );
}

export interface MediaProps extends MediaInjectionProps {
  alt?: string;
  className?: string;
  objectFit?: ObjectFit;
  src?: ImageSrc | null;
  style?: CSSProperties;
}

/** Resolves the media node according to the injection priority. Returns
 * null when nothing can be rendered (caller decides the placeholder). */
export function Media({
  alt = "",
  children,
  className = "",
  image,
  objectFit = "cover",
  render,
  src,
  style,
}: MediaProps): ReactNode {
  const resolvedSrc = getSrc(src);
  if (render) {
    return render({
      alt,
      className,
      src: resolvedSrc,
      style: {objectFit, ...style},
    });
  }
  if (image) return image;
  if (children) return children;
  if (!resolvedSrc) return null;
  return (
    <NativeImg
      alt={alt}
      className={className}
      objectFit={objectFit}
      src={resolvedSrc}
      style={style}
    />
  );
}
