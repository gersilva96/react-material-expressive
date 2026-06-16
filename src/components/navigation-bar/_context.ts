// Internal: lets NavigationBar tell its items which layout to render
// (vertical pills vs horizontal pills). Not exported from public barrels.
import {createContext} from "react";

export const NavBarContext = createContext<{horizontal: boolean}>({
  horizontal: false,
});
