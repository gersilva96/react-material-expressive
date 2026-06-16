import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {ListContext} from "./_context";
import {ListItem} from "./ListItem";

export interface ListProps extends ComponentProps<"ul"> {
  /** M3 list style. `expressive` (default, recommended for new designs):
   * filled (surface-container) rounded tiles separated by a 2dp gap, with a
   * container shape that morphs on interaction (4 → 12 → 16dp) and 20dp
   * icons. `plain`: the transparent, rectangular list — still available in
   * M3 Expressive. */
  variant?: "expressive" | "plain";
}

/**
 * M3 Expressive list container. The `expressive` variant (default) renders
 * filled, gapped tiles; `plain` is the transparent, rectangular list that the
 * spec keeps available. Transparent container (inherits the surface it sits
 * on, e.g. inside a sheet), 8dp vertical padding. Compose with List.Item.
 */
function List({
  children,
  className,
  variant = "expressive",
  ...props
}: ListProps) {
  const expressive = variant !== "plain";
  return (
    <ListContext.Provider value={{expressive}}>
      <ul
        className={cn(
          "flex w-full flex-col bg-transparent py-2",
          // Expressive items are separate tiles with a 2dp gap.
          expressive && "gap-0.5",
          className,
        )}
        {...props}>
        {children}
      </ul>
    </ListContext.Provider>
  );
}

List.Item = ListItem;

export {List};
