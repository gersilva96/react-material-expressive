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
import {createPortal} from "react-dom";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";
import {
  type PopoverPlacement,
  usePopoverPosition,
} from "../_usePopoverPosition";
import {Menu} from "../menu/Menu";
import {MenuItem} from "../menu/MenuItem";

export interface OverflowMenuProps {
  bottomLeft?: boolean;
  bottomRight?: boolean;
  /** Trigger content (usually an IconButton). */
  children?: ReactNode;
  className?: string;
  /** Menu content (OverflowMenu.Item / Menu.Item list). */
  menu?: ReactNode;
  /** Class for the menu container. */
  menuClassName?: string;
  topLeft?: boolean;
  topRight?: boolean;
  /** Vibrant (tertiary-based) color scheme instead of standard. */
  vibrant?: boolean;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Contextual menu anchored to a corner of its trigger, over the shared M3E
 * vertical {@link Menu}. Position via topLeft/topRight/bottomLeft/
 * bottomRight (default bottomRight); compose with OverflowMenu.Item
 * (an alias of Menu.Item), Menu.Label and Menu.Divider.
 */
function OverflowMenu({
  bottomLeft,
  bottomRight,
  children,
  className,
  menu,
  menuClassName,
  topLeft,
  topRight,
  vibrant,
}: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLDivElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const menuId = useId();
  // Map the corner props to a preferred placement (default bottom-end).
  const placement: PopoverPlacement = topRight
    ? "top-end"
    : topLeft
      ? "top-start"
      : bottomLeft
        ? "bottom-start"
        : bottomRight
          ? "bottom-end"
          : "bottom-end";
  const {exiting, mounted} = useDismissable(open, 150);
  // Portaled + fixed so the menu escapes any `overflow` ancestor; anchored to
  // the wrapper box (the inner trigger node is `display: contents`).
  const pos = usePopoverPosition(wrapper, floating, mounted, {
    gap: 8,
    placement,
  });
  // Grow away from the trigger: a top placement opens up unless it flipped
  // down (and vice-versa for a bottom placement).
  const up = placement.startsWith("top") !== pos.flippedVertically;

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
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-[var(--md-sys-z-menu)]"
              ref={floating}
              style={{left: pos.left, top: pos.top}}>
              <Menu
                className={menuClassName}
                exiting={exiting}
                id={menuId}
                onClose={() => setOpen(false)}
                up={up}
                vibrant={vibrant}>
                {menu}
              </Menu>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

OverflowMenu.Item = MenuItem;

export {OverflowMenu};
