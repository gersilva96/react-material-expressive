import {ComponentProps, MouseEvent, ReactNode} from "react";
import {Icon} from "../../elements/common/Icon";
import {cn} from "../../utils/helpers";
import {useRipple} from "../../utils/_ripple";
import {CheckIcon} from "./_CheckIcon";

export type ChipsVariant = "assist" | "filter" | "input" | "suggestion";

export interface ChipsLabels {
  /** aria-label for the trailing remove affordance. Default "Remove". */
  remove?: string;
}

const CHIPS_LABELS: Required<ChipsLabels> = {remove: "Remove"};

export interface ChipsProps extends ComponentProps<"button"> {
  /** Input chips: renders the leading element as a 24dp avatar with the
   * 4dp leading padding from the spec measurements (other variants
   * ignore it, like the spec). */
  avatar?: boolean;
  /** Elevated chip: surface-container-low at level 1 instead of the
   * outline (assist/filter/suggestion; input chips are always flat). */
  elevated?: boolean;
  /** Customizable accessible names. */
  labels?: ChipsLabels;
  /** Leading element (icon/avatar, 18px box). */
  leftElement?: ReactNode;
  /** Removable input chips: renders a trailing remove affordance. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Trailing element (18px box). */
  rightElement?: ReactNode;
  /** Selected state (filter/input). */
  selected?: boolean;
  /** Label fallback when no children are passed. */
  text?: string;
  variant?: ChipsVariant;
}

function RemoveIcon() {
  return (
    <svg aria-hidden fill="none" height={18} viewBox="0 0 24 24" width={18}>
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>
  );
}

/**
 * M3 chip (height 32, shape small, label-large). Padding 16, reduced to 8
 * on the icon/remove side. Selected filter/input chips use
 * secondary-container; assist/suggestion leading icons tint primary.
 * Elevated chips swap the outline for surface-container-low at level 1
 * (2 on hover, 1 pressed, none disabled).
 */
function Chips({
  avatar = false,
  children,
  className,
  disabled,
  elevated = false,
  labels,
  leftElement,
  onRemove,
  rightElement,
  selected = false,
  text,
  type = "button",
  variant = "assist",
  ...props
}: ChipsProps) {
  useRipple();
  const l = {...CHIPS_LABELS, ...labels};
  const hasLeft = Boolean(leftElement);
  const hasRight = Boolean(rightElement) || Boolean(onRemove);
  /* Leading icon accent per the chip token sets (site + Compose):
   * assist/suggestion always primary, filter only UNselected, input
   * only SELECTED (InputChipTokens.SelectedLeadingIconColor). */
  const accentIcon = variant === "input" ? selected : !selected;
  const isElevated = elevated && variant !== "input";
  const hasAvatar = avatar && variant === "input" && hasLeft;
  /* Selected filter chips grow a leading checkmark (mw renders it in
   * place of the leading icon; the guideline video shows the chip width
   * opening with it ~150ms). Without a leading icon the graphic expands
   * 0↔26 (18 check + 8 gap) and the side padding drops 16→8; with one,
   * the check crossfades inside the fixed 18px box. */
  const filterGraphic = variant === "filter" && !hasLeft;
  // The remove "X" matches the chip's content color (it is a sibling, so it
  // can't inherit it).
  const removeColor = disabled
    ? "text-on-surface/38"
    : selected
      ? "text-on-secondary-container"
      : "text-on-surface-variant";
  const removeButton = onRemove ? (
    <button
      aria-label={l.remove}
      className={cn(
        "chipRemoveHit state-layer absolute top-1/2 right-1 flex size-[18px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full leading-none disabled:cursor-not-allowed",
        removeColor,
      )}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onRemove(event);
      }}
      type="button">
      <RemoveIcon />
    </button>
  ) : null;

  const chip = (
    <button
      aria-pressed={
        variant === "filter" || variant === "input" ? selected : undefined
      }
      className={cn(
        "chips",
        selected
          ? "border border-transparent bg-secondary-container text-on-secondary-container"
          : cn(
              isElevated
                ? "border border-transparent bg-surface-container-low"
                : cn(
                    /* Flat outline is outline-variant in the
                     * current DSDB (mw v0_192 still ships the
                     * old outline role); focused flat chips
                     * darken it per the focus outline tokens. */
                    "border border-outline-variant bg-transparent",
                    variant === "assist"
                      ? "focus-visible:border-on-surface"
                      : "focus-visible:border-on-surface-variant",
                  ),
              /* Only the assist label is on-surface; suggestion
               * joins filter/input on on-surface-variant. */
              variant === "assist"
                ? "text-on-surface"
                : "text-on-surface-variant",
            ),
        isElevated &&
          "shadow-mm-1 hover:shadow-mm-2 active:shadow-mm-1 disabled:shadow-none",
        /* Flat selected filter raises to level 1 on hover
         * (FilterChipTokens.FlatSelectedHoverContainerElevation). */
        variant === "filter" &&
          selected &&
          !isElevated &&
          "hover:shadow-mm-1 active:shadow-none disabled:shadow-none",
        hasAvatar
          ? "pl-1"
          : hasLeft || (filterGraphic && selected)
            ? "pl-2"
            : "pl-4",
        onRemove ? "pr-8" : hasRight ? "pr-2" : "pr-4",
        "disabled:border-on-surface/12 disabled:bg-transparent disabled:text-on-surface/38",
        (selected || isElevated) &&
          "disabled:bg-on-surface/12 disabled:border-transparent",
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}>
      {filterGraphic ? (
        <span
          aria-hidden
          className="segmentedGraphic -mr-2 h-[18px]"
          style={{width: selected ? 26 : 0}}>
          <span className="absolute left-0 flex size-[18px] items-center justify-center leading-none">
            <CheckIcon selected={selected} />
          </span>
        </span>
      ) : null}
      {leftElement ? (
        variant === "filter" ? (
          /* icon ↔ check crossfade in the fixed 18px box (out
           * 50ms / in 150ms +50ms, like the segmented graphic) */
          <span className="relative flex size-[18px] shrink-0 items-center justify-center leading-none">
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                selected
                  ? "opacity-100"
                  : "ease-md-linear opacity-0 transition-opacity duration-75",
              )}>
              <CheckIcon selected={selected} />
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                selected
                  ? "ease-md-linear opacity-0 transition-opacity duration-[50ms]"
                  : "ease-legacy opacity-100 transition-opacity delay-[50ms] duration-150",
                accentIcon && !disabled && "text-primary",
              )}>
              {leftElement}
            </span>
          </span>
        ) : (
          <Icon
            className={cn(
              accentIcon && !disabled && !hasAvatar && "text-primary",
            )}
            iconLeft={leftElement}
            size={hasAvatar ? 24 : 18}
          />
        )
      ) : null}
      {children ?? text}
      {rightElement ? <Icon iconRight={rightElement} size={18} /> : null}
    </button>
  );

  // The remove control must be a real, keyboard-operable button and a
  // SIBLING of the chip (interactive elements cannot nest inside a button);
  // it sits over the chip's reserved trailing padding.
  return removeButton ? (
    <span className="relative inline-flex w-fit align-middle">
      {chip}
      {removeButton}
    </span>
  ) : (
    chip
  );
}

export {Chips};
