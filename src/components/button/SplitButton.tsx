import {MouseEventHandler, ReactNode, useEffect, useRef, useState} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";
import {Menu} from "../menu/Menu";
import {MenuItem} from "../menu/MenuItem";
import type {ButtonSize} from "./Button";

/** Split buttons have no text variant (M3 Expressive spec). */
export type SplitButtonVariant = "elevated" | "filled" | "tonal" | "outlined";

interface SizeConfig {
  /** .btn size class (shared metrics with Button). */
  btn: string;
  /** Trailing menu icon size (m3 split-button trailing-button.icon). */
  caret: number;
  /** Optical menu icon offset while unselected (spec measurements). */
  caretOffset: string;
  /** Leading button icon size (same as Button). */
  icon: number;
  /** Leading button paddings + inner corner rest/hover/focus/press. */
  leading: string;
  /** Outer pill corners as real px (half the height) — 9999px would
   * crush the sibling inner corner on the same edge and snap instead
   * of animating. */
  pillL: string;
  pillR: string;
  /** Trailing button paddings (square-ish per token spaces). */
  trailingPad: string;
  /** Trailing inner corner rest/hover/focus/press (while closed). */
  trailingCorners: string;
}

/* Inner corners per size: rest 4/4/4/8/12 morphing to 8/12/12/20/20 on
 * hover/focus/press (md.comp.split-button.<size>.inner-corner tokens). */
const SIZES: Record<ButtonSize, SizeConfig> = {
  xs: {
    btn: "sizeXs",
    caret: 22,
    caretOffset: "-translate-x-px",
    icon: 20,
    pillL: "rounded-l-[16px]",
    pillR: "rounded-r-[16px]",
    leading:
      "pl-3 pr-2.5 rounded-r-extra-small hover:rounded-r-small focus-visible:rounded-r-small active:rounded-r-small",
    trailingPad: "px-[13px]",
    trailingCorners:
      "rounded-l-extra-small hover:rounded-l-small focus-visible:rounded-l-small active:rounded-l-small",
  },
  s: {
    btn: "sizeS",
    caret: 22,
    caretOffset: "-translate-x-px",
    icon: 20,
    pillL: "rounded-l-[20px]",
    pillR: "rounded-r-[20px]",
    leading:
      "pl-4 pr-3 rounded-r-extra-small hover:rounded-r-medium focus-visible:rounded-r-medium active:rounded-r-medium",
    trailingPad: "px-[13px]",
    trailingCorners:
      "rounded-l-extra-small hover:rounded-l-medium focus-visible:rounded-l-medium active:rounded-l-medium",
  },
  m: {
    btn: "sizeM",
    caret: 26,
    caretOffset: "-translate-x-[2px]",
    icon: 24,
    pillL: "rounded-l-[28px]",
    pillR: "rounded-r-[28px]",
    leading:
      "px-6 rounded-r-extra-small hover:rounded-r-medium focus-visible:rounded-r-medium active:rounded-r-medium",
    trailingPad: "px-[15px]",
    trailingCorners:
      "rounded-l-extra-small hover:rounded-l-medium focus-visible:rounded-l-medium active:rounded-l-medium",
  },
  l: {
    btn: "sizeL",
    caret: 38,
    caretOffset: "-translate-x-[3px]",
    icon: 32,
    pillL: "rounded-l-[48px]",
    pillR: "rounded-r-[48px]",
    leading:
      "px-12 rounded-r-small hover:rounded-r-large-increased focus-visible:rounded-r-large-increased active:rounded-r-large-increased",
    trailingPad: "px-[29px]",
    trailingCorners:
      "rounded-l-small hover:rounded-l-large-increased focus-visible:rounded-l-large-increased active:rounded-l-large-increased",
  },
  xl: {
    btn: "sizeXl",
    caret: 50,
    caretOffset: "-translate-x-[6px]",
    icon: 40,
    pillL: "rounded-l-[68px]",
    pillR: "rounded-r-[68px]",
    leading:
      "px-16 rounded-r-medium hover:rounded-r-large-increased focus-visible:rounded-r-large-increased active:rounded-r-large-increased",
    trailingPad: "px-[43px]",
    trailingCorners:
      "rounded-l-medium hover:rounded-l-large-increased focus-visible:rounded-l-large-increased active:rounded-l-large-increased",
  },
};

export interface SplitButtonLabels {
  /** aria-label for the trailing menu button. Default "More options". */
  menu?: string;
}

const SPLIT_BUTTON_LABELS: Required<SplitButtonLabels> = {menu: "More options"};

export interface SplitButtonProps {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  /** Leading button icon (sized like the Button icon per size). */
  iconLeft?: ReactNode;
  /** Customizable accessible names. */
  labels?: SplitButtonLabels;
  /** Menu content (SplitButton.Item list), opened by the trailing
   * button and anchored to its bottom right. */
  menu?: ReactNode;
  /** Class for the menu container. */
  menuClassName?: string;
  /** Leading button action. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** M3 Expressive size (xs 32 / s 40 / m 56 / l 96 / xl 136). */
  size?: ButtonSize;
  /** Label fallback when no children are passed. */
  text?: string;
  variant?: SplitButtonVariant;
}

/**
 * M3 Expressive split button: a leading action button and a trailing menu
 * button separated by a 2dp gap, with full outer corners and inner
 * corners that morph on hover/focus/press (4/4/4/8/12 → 8/12/12/20/20 per
 * size). While the menu is open the trailing button rounds to full,
 * centers its caret (rotated 180°) and keeps a pressed state layer; the
 * container colors never change on selection. Colors, state layers,
 * elevation and disabled states are the standard button ones.
 */
function SplitButton({
  children,
  className,
  disabled,
  iconLeft,
  labels,
  menu,
  menuClassName,
  onClick,
  size = "s",
  text,
  variant = "filled",
}: SplitButtonProps) {
  useRipple();
  const l = {...SPLIT_BUTTON_LABELS, ...labels};
  const [isOpen, setIsOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trailing = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const {exiting, mounted} = useDismissable(isOpen, 150);
  const config = SIZES[size];
  // A disabled split button gives no interactive feedback, so drop the
  // inner-corner hover/focus/press morphs — a disabled <button> still
  // matches :hover, which would otherwise morph its radius on hover.
  const corners = (classes: string) =>
    disabled
      ? classes.replace(/ (?:hover|focus-visible|active):\S+/g, "")
      : classes;

  useOutsideClose(wrapper, () => setIsOpen(false), isOpen);

  // Return focus to the trailing (menu) button when the menu closes — the
  // Menu primitive moves focus into its surface on open (WAI-ARIA / mw).
  useEffect(() => {
    if (wasOpen.current && !isOpen) trailing.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <div
      className={cn(
        "relative inline-flex w-fit items-center gap-0.5",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
      ref={wrapper}>
      {/* min-w-12: Compose Leading/TrailingButtonMinWidth (48dp, all
       * sizes) — only binds on icon-only/short-label xs (42px). */}
      <button
        className={cn(
          "btn min-w-12",
          config.pillL,
          variant,
          config.btn,
          corners(config.leading),
        )}
        disabled={disabled}
        onClick={onClick}
        type="button">
        <Icon iconLeft={iconLeft} size={config.icon} />
        {children ?? text}
      </button>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={l.menu}
        className={cn(
          "btn min-w-12",
          config.pillR,
          variant,
          config.btn,
          config.trailingPad,
          isOpen
            ? cn("splitOpen", config.pillL)
            : corners(config.trailingCorners),
        )}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        ref={trailing}
        type="button">
        <svg
          aria-hidden
          className={cn(
            "shrink-0 transition-transform duration-200 ease-emphasized",
            isOpen ? "rotate-180" : config.caretOffset,
          )}
          fill="currentColor"
          height={config.caret}
          viewBox="0 0 24 24"
          width={config.caret}>
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
        </svg>
      </button>
      {mounted ? (
        <div className="absolute top-full right-0 z-20 flex flex-col">
          <Menu
            className={cn("mt-2", menuClassName)}
            exiting={exiting}
            onClose={() => setIsOpen(false)}>
            {menu}
          </Menu>
        </div>
      ) : null}
    </div>
  );
}

SplitButton.Item = MenuItem;

export {SplitButton};
