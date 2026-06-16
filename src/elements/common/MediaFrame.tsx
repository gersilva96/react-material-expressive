import {CSSProperties, MouseEventHandler, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface MediaFrameProps {
  /** Aspect ratio of the frame (e.g. 16/9 or "4 / 3"). */
  aspect?: number | string;
  /** Content of the frame (usually media). */
  children?: ReactNode;
  className?: string;
  height?: number | string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Clip the content to the frame shape. Default true. */
  overflow?: boolean;
  /** Shown behind/instead of the content (icon, initials...). */
  placeholder?: ReactNode;
  /** Corner radius in px, or any CSS value (e.g. "var(--md-sys-shape-corner-large)"). */
  radius?: number | string;
  /** Shorthand for equal width/height. */
  size?: number | string;
  style?: CSSProperties;
  width?: number | string;
}

/**
 * Presentational frame for media: size/aspect/radius/overflow plus an
 * optional placeholder. Renders no image of its own — pair it with `Img`
 * or inject any media as children.
 */
function MediaFrame({
  aspect,
  children,
  className,
  height,
  onClick,
  overflow = true,
  placeholder,
  radius,
  size,
  style,
  width,
}: MediaFrameProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-surface-container-highest text-on-surface-variant",
        overflow && "overflow-hidden",
        className,
      )}
      onClick={onClick}
      style={{
        aspectRatio: aspect,
        borderRadius: radius,
        height: height ?? size,
        width: width ?? size,
        ...style,
      }}>
      {placeholder ? (
        <span className="absolute inset-0 flex items-center justify-center">
          {placeholder}
        </span>
      ) : null}
      {children}
    </div>
  );
}

export {MediaFrame};
