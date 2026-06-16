import {MouseEventHandler, ReactNode} from "react";
import {Media, type MediaInjectionProps} from "../../elements/common/_media";
import {cn, type ImageSrc} from "../../utils/helpers";
import {Badge} from "../badge/Badge";

export interface UserItemProps extends MediaInjectionProps {
  alt?: string;
  badge?: boolean;
  badgeColor?: string;
  badgeIcon?: ReactNode;
  badgeText?: string;
  className?: string;
  /** Bottom-centered badge (e.g. "LIVE"). */
  live?: boolean;
  liveColor?: string;
  liveIcon?: ReactNode;
  liveText?: string;
  name?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  radius?: number;
  /** Animated decorative ring (token-based gradient). */
  ring?: boolean;
  size?: number;
  src?: ImageSrc;
}

/**
 * Circular story item with optional ring, badges and name below. Media is
 * injectable (render > image > children) with a native <img> fallback.
 */
function UserItem({
  alt,
  badge,
  badgeColor,
  badgeIcon,
  badgeText,
  children,
  className,
  image,
  live,
  liveColor,
  liveIcon,
  liveText,
  name,
  onClick,
  radius = 9999,
  render,
  ring,
  size = 64,
  src,
}: UserItemProps) {
  return (
    <div className={cn("relative flex max-w-min flex-col", className)}>
      <div
        className="relative z-10 flex cursor-pointer items-center justify-center overflow-hidden bg-surface-container-low text-body-small text-on-surface-variant"
        onClick={onClick}
        style={{borderRadius: radius, height: size, width: size}}>
        <Media
          alt={alt ?? name ?? ""}
          className="absolute inset-0 size-full"
          image={image}
          render={render}
          src={src}
          style={{borderRadius: radius}}>
          {children}
        </Media>
      </div>
      {badge ? (
        <div className="absolute -top-0.5 -right-0.5 z-20 flex justify-end">
          <Badge className={badgeColor} icon={badgeIcon} text={badgeText} />
        </div>
      ) : null}
      {live ? (
        <div
          className="absolute z-20 flex w-full justify-center"
          style={{top: size - 8}}>
          <Badge
            className={liveColor}
            icon={liveIcon}
            text={liveText ?? "LIVE"}
          />
        </div>
      ) : null}
      {name ? (
        <div className="flex w-full items-center justify-center pt-2 text-center text-label-medium leading-tight text-on-surface">
          {name}
        </div>
      ) : null}
      {ring ? (
        <div
          aria-hidden
          className="absolute -top-1 -left-1 z-0 flex animate-spin-lazy rounded-full bg-conic from-primary via-tertiary to-primary p-0.5"
          style={{height: size + 8, width: size + 8}}>
          <div className="size-full rounded-full bg-surface" />
        </div>
      ) : null}
    </div>
  );
}

export {UserItem};
