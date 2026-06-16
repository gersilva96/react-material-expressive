// Internal: lets Menu tell its items the color scheme (standard vs vibrant)
// and how to dismiss the whole menu chain on activation. Submenus inherit
// `closeAll` so a leaf anywhere closes the root. Not exported from barrels.
import {createContext} from "react";

export const MENU_NOOP = () => {};

export interface MenuContextValue {
  /** Tertiary-based scheme instead of standard (surface-based). */
  vibrant: boolean;
  /** Dismiss the entire menu chain (item activation). */
  closeAll: () => void;
}

export const MenuContext = createContext<MenuContextValue>({
  vibrant: false,
  closeAll: MENU_NOOP,
});
