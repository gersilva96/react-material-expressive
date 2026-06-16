import {CSSProperties, MouseEventHandler, ReactNode} from "react";
import {type ImageSrc} from "../../utils/helpers";
import {Media, type MediaInjectionProps, type ObjectFit} from "./_media";
import {MediaFrame} from "./MediaFrame";

export interface ImgProps extends MediaInjectionProps {
  alt?: string;
  /** Aspect ratio of the frame (e.g. 16/9). */
  aspect?: number | string;
  className?: string;
  height?: number | string;
  objectFit?: ObjectFit;
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Shown when there is no media or it fails to load. */
  placeholder?: ReactNode;
  /** Corner radius in px or any CSS value. */
  radius?: number | string;
  /** Shorthand for equal width/height. */
  size?: number | string;
  /** Plain URL or StaticImageData. Ignored when media is injected. */
  src?: ImageSrc | null;
  style?: CSSProperties;
  width?: number | string;
}

/**
 * MediaFrame + image. Uses a native <img> by default; the consumer can
 * inject its framework's image via `render` > `image` > `children`. Falls
 * back to the placeholder when there is no source or it errors.
 */
function Img({
  alt = "",
  aspect,
  children,
  className,
  height,
  image,
  objectFit = "cover",
  onClick,
  placeholder,
  radius,
  render,
  size,
  src,
  style,
  width,
}: ImgProps) {
  return (
    <MediaFrame
      aspect={aspect}
      className={className}
      height={height}
      onClick={onClick}
      placeholder={placeholder}
      radius={radius}
      size={size}
      style={style}
      width={width}>
      <Media
        alt={alt}
        className="absolute inset-0 size-full"
        image={image}
        objectFit={objectFit}
        render={render}
        src={src}>
        {children}
      </Media>
    </MediaFrame>
  );
}

export {Img};
