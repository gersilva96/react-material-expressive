import {CSSProperties, MouseEventHandler, ReactNode} from "react";
import {Media, type MediaInjectionProps} from "../../elements/common/_media";
import {cn, type ImageSrc} from "../../utils/helpers";
import {Badge} from "../badge/Badge";
import {DotBadge} from "../badge/DotBadge";
import {OnIconBadge} from "../badge/OnIconBadge";

export interface AvatarProps extends MediaInjectionProps {
  alt?: string;
  /** Show a large badge (top-right). */
  badge?: boolean;
  /** Class override for the badge (e.g. a different container color). */
  badgeColor?: string;
  badgeIcon?: ReactNode;
  badgeText?: string;
  className?: string;
  /** Show a small dot badge (top-right). */
  dotBadge?: boolean;
  height?: number;
  /** Initials (or any short text) shown when there is no image. */
  name?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Fallback node when there is no image nor name. */
  placeholder?: ReactNode;
  radius?: number;
  /** Animated decorative ring (token-based gradient). */
  ring?: boolean;
  size?: number;
  /** Show a count badge overlapping the avatar. */
  smallBadge?: boolean;
  src?: ImageSrc;
  style?: CSSProperties;
  width?: number;
}

function PersonIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={18}
      viewBox="0 0 24 24"
      width={18}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.34 0-8 1.67-8 5v1h16v-1c0-3.33-4.66-5-8-5Z" />
    </svg>
  );
}

/**
 * Avatar with optional badges and decorative ring. Media is injectable
 * (render > image > children) with a native <img> fallback; initials or a
 * placeholder icon show when there is no image.
 */
function Avatar({
  alt,
  badge,
  badgeColor,
  badgeIcon,
  badgeText,
  children,
  className,
  dotBadge,
  height,
  image,
  name,
  onClick,
  placeholder,
  radius = 9999,
  render,
  ring,
  size = 40,
  smallBadge,
  src,
  style,
  width,
}: AvatarProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <div className={cn("relative inline-flex", className)} style={style}>
      <div
        className="relative z-10 flex items-center justify-center overflow-hidden bg-primary-container text-title-medium text-on-primary-container"
        onClick={onClick}
        style={{borderRadius: radius, height: h, width: w}}>
        <span className="flex overflow-hidden px-1 text-center text-ellipsis whitespace-nowrap">
          {name || placeholder || <PersonIcon />}
        </span>
        <Media
          alt={alt ?? (typeof name === "string" ? name : "")}
          className="absolute inset-0 size-full"
          image={image}
          render={render}
          src={src}
          style={{borderRadius: radius}}>
          {children}
        </Media>
      </div>

      {badge ? (
        <span className="absolute -top-0.5 -right-0.5 z-20">
          <Badge className={badgeColor} icon={badgeIcon} text={badgeText} />
        </span>
      ) : null}
      {dotBadge ? (
        <span className="absolute top-0 right-0 z-20">
          <DotBadge className={badgeColor} />
        </span>
      ) : null}
      {smallBadge ? (
        <OnIconBadge className={cn("z-20", badgeColor)} count={badgeText} />
      ) : null}

      {ring ? (
        <div
          aria-hidden
          className="absolute -top-1 -left-1 z-0 flex animate-spin-lazy bg-conic from-primary via-tertiary to-primary p-0.5"
          style={{
            borderRadius: radius,
            height: h + 8,
            width: w + 8,
          }}>
          <div
            className="size-full bg-surface"
            style={{borderRadius: radius}}
          />
        </div>
      ) : null}
    </div>
  );
}

export {Avatar};
