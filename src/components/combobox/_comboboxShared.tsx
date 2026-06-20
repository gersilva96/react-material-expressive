// Internal helpers shared by ComboboxFilled/ComboboxOutlined. Not exported
// from the public barrel.
import {
  ComponentProps,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {createPortal} from "react-dom";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {usePopoverPosition} from "../_usePopoverPosition";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";
import {SelectCaret} from "../select/_selectShared";

export interface ComboboxOption {
  disabled?: boolean;
  /** Display text; becomes the input's text when selected. Defaults to value. */
  label?: string;
  value: string;
}

export interface ComboboxLabels {
  /** aria-label for the clear button. Default "Clear". */
  clear?: string;
  /** Status row shown when there are no options. Default "No results". */
  empty?: string;
  /** Status row shown while options load. Default "Loading…". */
  loading?: string;
}

export const COMBOBOX_LABELS: Required<ComboboxLabels> = {
  clear: "Clear",
  empty: "No results",
  loading: "Loading…",
};

export interface ComboboxBaseProps
  extends Omit<
    ComponentProps<"input">,
    "defaultValue" | "onChange" | "size" | "value"
  > {
  /** Class for the wrapper. */
  className?: string;
  /** Show a trailing clear button when the input has text (default true). */
  clearable?: boolean;
  /** Uncontrolled initial selected value. */
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  id?: string;
  inputClassName?: string;
  /** Floating label. */
  label?: string;
  /** Accessible names for the chrome. */
  labels?: ComboboxLabels;
  /** Leading icon (24px box; the field pads 48 on that side). */
  leftElement?: ReactNode;
  /** Class for the portaled listbox surface. */
  listboxClassName?: string;
  /** Consumer signals an in-flight async fetch (shows a status row). */
  loading?: boolean;
  /** Posts the selected value in native forms via a hidden input. */
  name?: string;
  /** Fires with the selected option value, or "" when cleared. */
  onChange?: (value: string) => void;
  /** Fires when the consumer should re-query (debounce on your side). */
  onInputChange?: (query: string) => void;
  /** Already-filtered options. The library does NOT fetch or filter. */
  options: ComboboxOption[];
  supportingText?: ReactNode;
  /** Controlled selected value. */
  value?: string;
}

/**
 * Combobox behavior shared by both variants: a controlled selected value plus
 * a separate input-text (query) state. Typing opens the popover and notifies
 * the consumer via `onInputChange` (the consumer owns fetching/filtering);
 * picking an option commits the value and sets the input text to its label;
 * blur/Escape/Tab without a pick reverts the text to the selected label.
 */
export function useCombobox({
  defaultValue,
  disabled,
  onChange,
  onInputChange,
  options,
  value: valueProp,
}: Pick<
  ComboboxBaseProps,
  | "defaultValue"
  | "disabled"
  | "onChange"
  | "onInputChange"
  | "options"
  | "value"
>) {
  const [value, setValue] = useControlled(valueProp, defaultValue ?? "");
  const labelFor = (next: string) =>
    options.find((option) => option.value === next)?.label ?? next;
  const [query, setQuery] = useState(() => (value ? labelFor(value) : ""));
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const {exiting, mounted} = useDismissable(isOpen, 150);

  // While closed, the input text mirrors the selected option's label, so an
  // external (controlled) value change shows the right text. Open state is
  // owned by typing — don't fight the user's input.
  // labelFor closes over options; we deliberately only resync on value/open
  // changes (not on every options update while the user is typing).
  useEffect(() => {
    if (!isOpen) setQuery(value ? labelFor(value) : "");
  }, [isOpen, value]);

  /** Next enabled index from `start` in `delta` direction (wraps). */
  const move = (start: number, delta: number) => {
    if (options.length === 0) return -1;
    for (let step = 1; step <= options.length; step += 1) {
      const index =
        (start + delta * step + options.length * step) % options.length;
      if (!options[index]?.disabled) return index;
    }
    return -1;
  };

  const open = () => {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlighted(
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : move(-1, 1),
    );
    setIsOpen(true);
  };

  const closeAndRevert = () => {
    setIsOpen(false);
    setHighlighted(-1);
    setQuery(value ? labelFor(value) : "");
  };

  useOutsideClose(wrapper, closeAndRevert, isOpen);

  const onType = (next: string) => {
    setQuery(next);
    setIsOpen(true);
    setHighlighted(-1);
    onInputChange?.(next);
  };

  const commit = (next: string) => {
    setValue(next);
    onChange?.(next);
    setQuery(labelFor(next));
    setIsOpen(false);
    setHighlighted(-1);
  };

  const clear = () => {
    setValue("");
    onChange?.("");
    setQuery("");
    setHighlighted(-1);
    onInputChange?.("");
    input.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (isOpen) setHighlighted((current) => move(current, 1));
        else open();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) setHighlighted((current) => move(current, -1));
        else open();
        break;
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setHighlighted(move(-1, 1));
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setHighlighted(move(options.length, -1));
        }
        break;
      case "Enter":
        if (isOpen && highlighted >= 0) {
          event.preventDefault();
          const option = options[highlighted];
          if (option && !option.disabled) commit(option.value);
        }
        break;
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          closeAndRevert();
        }
        break;
      case "Tab":
        if (isOpen) closeAndRevert();
        break;
      default:
        break;
    }
  };

  return {
    clear,
    commit,
    exiting,
    focused: focused && !disabled,
    handleKeyDown,
    highlighted,
    input,
    isOpen,
    mounted,
    onType,
    query,
    setFocused,
    setHighlighted,
    setIsOpen,
    value,
    wrapper,
  };
}

function CloseGlyph() {
  return (
    <svg aria-hidden fill="currentColor" height={18} viewBox="0 0 24 24" width={18}>
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

export interface ComboboxTrailingProps {
  clearLabel: string;
  disabled?: boolean;
  error?: boolean;
  isOpen: boolean;
  onClear: () => void;
  showClear: boolean;
}

/** Trailing chrome: an optional clear button and the open/close caret. */
export function ComboboxTrailing({
  clearLabel,
  disabled,
  error,
  isOpen,
  onClear,
  showClear,
}: ComboboxTrailingProps) {
  return (
    <div className="pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
      {showClear ? (
        <button
          aria-label={clearLabel}
          className="state-layer pointer-events-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-on-surface-variant"
          // Keep input focus on press; the click still fires and clears.
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClear}
          type="button">
          <CloseGlyph />
        </button>
      ) : null}
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center text-on-surface-variant",
          error && "text-error",
          disabled && "text-on-surface/38",
        )}>
        <SelectCaret open={isOpen} />
      </span>
    </div>
  );
}

export interface ComboboxListboxProps {
  anchorRef: RefObject<HTMLElement | null>;
  baseId: string;
  emptyText: string;
  exiting: boolean;
  highlighted: number;
  listboxClassName?: string;
  loading?: boolean;
  loadingText: string;
  onHighlight: (index: number) => void;
  onSelect: (value: string) => void;
  options: ComboboxOption[];
  value: string;
}

/**
 * The combobox listbox: the M3E vertical-menu surface (corner-large 16,
 * surface-container-low, elevation 3) matching the input width, portaled to
 * `document.body` with fixed positioning so it escapes `overflow` ancestors
 * and flips up when there is no room below. Empty/loading render a status row
 * instead of an (invalid) empty listbox.
 */
export function ComboboxListbox({
  anchorRef,
  baseId,
  emptyText,
  exiting,
  highlighted,
  listboxClassName,
  loading,
  loadingText,
  onHighlight,
  onSelect,
  options,
  value,
}: ComboboxListboxProps) {
  const floating = useRef<HTMLDivElement>(null);
  const pos = usePopoverPosition(anchorRef, floating, true, {
    gap: 4,
    matchWidth: true,
    placement: "bottom-start",
  });

  useEffect(() => {
    if (highlighted < 0) return;
    // Optional call: jsdom doesn't implement scrollIntoView.
    document
      .getElementById(`${baseId}-opt-${highlighted}`)
      ?.scrollIntoView?.({block: "nearest"});
  }, [baseId, highlighted]);

  if (typeof document === "undefined") return null;

  const anim = exiting ? "animate-menu-out" : "animate-menu-in";
  const surface =
    "max-h-[280px] w-full overflow-hidden overflow-y-auto rounded-large bg-surface-container-low py-0.5 shadow-mm-3 [--menu-clip-bleed:-24px]";

  return createPortal(
    <div
      className="fixed z-[var(--md-sys-z-menu)]"
      ref={floating}
      style={{left: pos.left, top: pos.top, width: pos.width}}>
      {loading || options.length === 0 ? (
        // An empty listbox is an a11y violation — show a status row instead.
        <div
          aria-live="polite"
          className={cn(
            surface,
            anim,
            "px-4 py-3 text-body-medium text-on-surface-variant",
            listboxClassName,
          )}
          role="status">
          {loading ? loadingText : emptyText}
        </div>
      ) : (
        <ul
          className={cn("flex flex-col", surface, anim, listboxClassName)}
          id={`${baseId}-listbox`}
          role="listbox">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                aria-disabled={option.disabled || undefined}
                aria-selected={isSelected}
                className={cn(
                  "mx-1 my-0.5 flex h-11 shrink-0 cursor-pointer items-center rounded-extra-small px-3 text-label-large first:rounded-t-medium last:rounded-b-medium",
                  isSelected
                    ? "rounded-medium bg-tertiary-container text-on-tertiary-container"
                    : "text-on-surface",
                  highlighted === index && !isSelected && "bg-on-surface/8",
                  option.disabled && "cursor-not-allowed text-on-surface/38",
                )}
                id={`${baseId}-opt-${index}`}
                key={option.value}
                onClick={() => {
                  if (!option.disabled) onSelect(option.value);
                }}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => {
                  if (!option.disabled) onHighlight(index);
                }}
                role="option">
                <span className="truncate">{option.label ?? option.value}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>,
    document.body,
  );
}
