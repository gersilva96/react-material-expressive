import {
  cloneElement,
  isValidElement,
  type ReactElement,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";
import {Menu} from "../menu/Menu";
import {MenuItem} from "../menu/MenuItem";

export interface DropdownProps {
  /** Detach the menu from the trigger with a 4dp gap. */
  apart?: boolean;
  /** Trigger content. */
  children: ReactNode;
  className?: string;
  /** Menu content (Dropdown.Item / Menu.Item list). */
  menu?: ReactNode;
  /** Class for the menu container. */
  menuClassName?: string;
  /** Vibrant (tertiary-based) color scheme instead of standard. */
  vibrant?: boolean;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Trigger + anchor for the shared M3E vertical {@link Menu}: toggles the
 * menu below the trigger and closes on outside click, item activation or
 * Escape (ephemeral UI state). Compose the menu with Dropdown.Item
 * (an alias of Menu.Item) — or Menu.Label / Menu.Divider for groups.
 */
function Dropdown({
  apart,
  children,
  className,
  menu,
  menuClassName,
  vibrant,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const menuId = useId();
  const {exiting, mounted} = useDismissable(open, 150);

  useOutsideClose(wrapper, () => setOpen(false), open);

  // The popup ARIA belongs on the focusable trigger control, not the
  // wrapper: clone a single element child to merge the menu-button state.
  const triggerNode = isValidElement(children)
    ? cloneElement(
        children as ReactElement<{
          "aria-controls"?: string;
          "aria-expanded"?: boolean;
          "aria-haspopup"?: "menu";
        }>,
        {
          "aria-controls": open ? menuId : undefined,
          "aria-expanded": open,
          "aria-haspopup": "menu",
        },
      )
    : children;

  // Return focus to the trigger when the menu closes (WAI-ARIA / mw).
  useEffect(() => {
    if (wasOpen.current && !open) {
      trigger.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <div
      className={cn("relative flex w-fit cursor-pointer", className)}
      ref={wrapper}>
      <div
        className="contents"
        onClick={() => setOpen((active) => !active)}
        ref={trigger}>
        {triggerNode}
      </div>
      {mounted ? (
        <div className="absolute top-full left-0 z-30 flex w-full flex-col">
          <Menu
            className={cn(apart && "mt-1", menuClassName)}
            exiting={exiting}
            id={menuId}
            onClose={() => setOpen(false)}
            vibrant={vibrant}>
            {menu}
          </Menu>
        </div>
      ) : null}
    </div>
  );
}

Dropdown.Item = MenuItem;

export {Dropdown};
