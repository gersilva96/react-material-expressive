// Overflow-menu items are the shared vertical-menu item. Kept as an alias so
// the import path and `OverflowMenuItemProps` type stay stable; use
// Menu.Item / OverflowMenu.Item (pass `badge="2"` for a counted badge).
export {MenuItem as OverflowMenuItem} from "../menu/MenuItem";
export type {MenuItemProps as OverflowMenuItemProps} from "../menu/MenuItem";
