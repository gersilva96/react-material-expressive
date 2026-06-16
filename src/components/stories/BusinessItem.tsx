import {MouseEventHandler} from "react";
import {Media, type MediaInjectionProps} from "../../elements/common/_media";
import {cn, type ImageSrc} from "../../utils/helpers";

export interface BusinessItemProps extends MediaInjectionProps {
  alt?: string;
  className?: string;
  height?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
  radius?: number;
  /** Static primary ring. */
  ring?: boolean;
  src?: ImageSrc;
  /** Label below (label-large, start-aligned). */
  text?: string;
  width?: number;
}

/**
 * Story item for brand/business content: rounded media with an optional
 * primary ring and a start-aligned label. Media is injectable.
 */
function BusinessItem({
  alt,
  children,
  className,
  height = 64,
  image,
  onClick,
  radius = 9999,
  render,
  ring,
  src,
  text,
  width = 64,
}: BusinessItemProps) {
  return (
    <div className={cn("flex max-w-min flex-col", className)}>
      <div
        className={cn("flex items-center p-0.5", ring && "ring-2 ring-primary")}
        style={{borderRadius: radius}}>
        <div
          className="relative flex cursor-pointer items-center justify-center overflow-hidden bg-surface-container-low text-body-small text-on-surface-variant"
          onClick={onClick}
          style={{borderRadius: radius, height, width}}>
          <Media
            alt={alt ?? text ?? ""}
            className="absolute inset-0 size-full"
            image={image}
            render={render}
            src={src}
            style={{borderRadius: radius}}>
            {children}
          </Media>
        </div>
      </div>
      {text ? (
        <div className="flex w-full items-center justify-start px-2 pt-2 text-left text-label-large leading-tight text-on-surface">
          {text}
        </div>
      ) : null}
    </div>
  );
}

export {BusinessItem};
