import {ReactNode, useContext} from "react";
import {cn} from "../../utils/helpers";
import {MenuContext} from "./_context";

export interface MenuGroupProps {
  children?: ReactNode; // Menu.Item list (and nested Menu.Sub)
  className?: string;
}

/**
 * M3E vertical-menu group: a self-contained menu surface (corner-large,
 * surface-container-low / tertiary-container at elevation 3) holding a
 * cluster of items. Stack several inside a Menu and they render as separate
 * rounded surfaces with a 2dp gap — the "with gap" grouping, the spec's
 * alternative to a Menu.Divider (m3.material.io/components/menus anatomy
 * lists both "Gap (optional)" and "Divider (optional)"). First/last items
 * round their outer corner against this surface, exactly as in an ungrouped
 * menu (the inset state layer is concentric with the corner-large at 4dp).
 */
function MenuGroup({children, className}: MenuGroupProps) {
  const {vibrant} = useContext(MenuContext);
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-large py-0.5 shadow-mm-3",
        vibrant
          ? "bg-tertiary-container text-on-tertiary-container"
          : "bg-surface-container-low text-on-surface",
        className,
      )}
      role="group">
      {children}
    </div>
  );
}

export {MenuGroup};
