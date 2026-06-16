import {ComponentProps} from "react";
import {cn} from "../../utils/helpers";
import {NavBarContext} from "./_context";
import {NavBarItem} from "./NavBarItem";

export interface NavigationBarProps extends ComponentProps<"nav"> {
  /** Horizontal navigation items (icon beside label inside a 40dp
   * pill) — the spec configuration for medium windows. Items become
   * fixed-width and centered. */
  horizontal?: boolean;
}

/**
 * M3E flexible navigation bar: height 64, surface-container, 3–5
 * destinations. Vertical items split the width equally; `horizontal`
 * switches to fixed-width centered items for medium windows. Compose with
 * NavigationBar.Item.
 */
function NavigationBar({
  children,
  className,
  horizontal,
  ...props
}: NavigationBarProps) {
  return (
    <nav
      className={cn("navBar", horizontal && "navCentered", className)}
      {...props}>
      <NavBarContext.Provider value={{horizontal: !!horizontal}}>
        {children}
      </NavBarContext.Provider>
    </nav>
  );
}

NavigationBar.Item = NavBarItem;

export {NavigationBar};
