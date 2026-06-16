import {cn} from "../../utils/helpers";

export interface MenuDividerProps {
  className?: string;
}

/**
 * M3E vertical-menu divider: a 1px outline-variant rule inset 12dp,
 * separating groups within a single menu surface (the "with divider"
 * grouping). For separate group surfaces with a gap, use Menu.Group instead.
 */
function MenuDivider({className}: MenuDividerProps) {
  return (
    <div
      className={cn("mx-3 my-0.5 h-px bg-outline-variant", className)}
      role="separator"
    />
  );
}

export {MenuDivider};
