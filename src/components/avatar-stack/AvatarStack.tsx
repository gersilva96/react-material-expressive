import {cn, type ImageSrc} from "../../utils/helpers";
import {Avatar} from "../avatar/Avatar";

export interface AvatarStackItem {
  alt?: string;
  height?: number;
  id: string;
  initials?: string;
  src?: ImageSrc;
  width?: number;
}

export interface AvatarStackProps {
  avatars: AvatarStackItem[];
  className?: string;
  size?: number;
}

/** Overlapping avatar row with a surface ring and hover raise. */
function AvatarStack({avatars, className, size = 40}: AvatarStackProps) {
  return (
    <div className={cn("flex flex-row -space-x-1", className)}>
      {avatars.map(({alt, height, id, initials, src, width}) => (
        <div
          className="z-20 rounded-full ring-4 ring-surface transition-transform duration-[350ms] ease-[var(--md-sys-motion-spring-fast-spatial)] hover:z-30 hover:-translate-y-0.5 hover:scale-105"
          key={id}>
          <Avatar
            alt={alt}
            height={height}
            name={initials}
            size={size}
            src={src}
            width={width}
          />
        </div>
      ))}
    </div>
  );
}

export {AvatarStack};
