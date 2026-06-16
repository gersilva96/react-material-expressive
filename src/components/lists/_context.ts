// Internal: lets List tell its items they're in the M3 Expressive variant
// (filled rounded tiles with a shape that morphs on interaction). Not
// exported from barrels.
import {createContext} from "react";

export const ListContext = createContext<{expressive: boolean}>({
  expressive: false,
});
