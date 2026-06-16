import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {ImageRow} from "./ImageRow";

export type GalleryProps = ComponentProps<"div">;

/**
 * Stacked media gallery (8dp gaps). Compose rows with Gallery.Row and any
 * media (e.g. Img) inside.
 */
function Gallery({children, className, ...props}: GalleryProps) {
  return (
    <div className={cn("flex size-full flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

Gallery.Row = ImageRow;

export {Gallery};
