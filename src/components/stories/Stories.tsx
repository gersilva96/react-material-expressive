import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {BusinessItem} from "./BusinessItem";
import {UserItem} from "./UserItem";

export interface StoriesProps {
  children: ReactNode;
  className?: string;
}

/**
 * Horizontal scrollable story strip. Compose with Stories.User /
 * Stories.Business.
 */
function Stories({children, className}: StoriesProps) {
  return (
    <div
      className={cn(
        "flex h-fit w-full flex-row gap-4 overflow-x-auto px-4 pt-3 pb-4",
        className,
      )}>
      {children}
    </div>
  );
}

Stories.Business = BusinessItem;
Stories.User = UserItem;

export {Stories};
