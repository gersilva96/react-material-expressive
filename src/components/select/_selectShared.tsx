// Internal helpers shared by SelectFilled/SelectOutlined. Not exported
// from the public barrel.
import {KeyboardEvent, ReactNode, useEffect, useRef, useState} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";

/* @material/web select: max time between typeahead keystrokes. */
const TYPEAHEAD_BUFFER_MS = 200;

export interface SelectOption {
  disabled?: boolean;
  /** Display content; defaults to the value. */
  label?: ReactNode;
  value: string;
}

export interface SelectBaseProps {
  /** Class for the wrapper. */
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  id?: string;
  /** Floating label. */
  label?: string;
  /** Leading icon (24px box; the field pads 48 on that side). */
  leftElement?: ReactNode;
  /** Posts the value in native forms via a hidden input. */
  name?: string;
  /** Fires with the next selected value. */
  onChange?: (value: string) => void;
  options: SelectOption[];
  supportingText?: ReactNode;
  value?: string;
}

/** Typeahead text of an option (string labels win over the value). */
function optionText(option: SelectOption): string {
  return typeof option.label === "string" ? option.label : option.value;
}

/**
 * Select behavior shared by both variants: controlled value, open/close
 * with the menu exit animation, keyboard navigation and the 200ms
 * typeahead of @material/web.
 */
export function useSelect({
  defaultValue,
  disabled,
  onChange,
  options,
  value: valueProp,
}: Pick<
  SelectBaseProps,
  "defaultValue" | "disabled" | "onChange" | "options" | "value"
>) {
  const [value, setValue] = useControlled(valueProp, defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);
  const typeahead = useRef({buffer: "", time: 0});
  const {exiting, mounted} = useDismissable(isOpen, 150);

  useOutsideClose(wrapper, () => setIsOpen(false), isOpen);

  const selectedIndex = options.findIndex((option) => option.value === value);

  /** Next enabled index from `start` in `delta` direction (wraps). */
  const move = (start: number, delta: number) => {
    for (let step = 1; step <= options.length; step += 1) {
      const index =
        (start + delta * step + options.length * step) % options.length;
      if (!options[index]?.disabled) return index;
    }
    return -1;
  };

  const openMenu = () => {
    if (disabled) return;
    setHighlighted(
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : move(-1, 1),
    );
    setIsOpen(true);
  };

  const commit = (next: string) => {
    setValue(next);
    onChange?.(next);
    setIsOpen(false);
  };

  /** First enabled option matching the accumulated typeahead buffer. */
  const typeaheadFind = (char: string) => {
    const now = Date.now();
    const stale = now - typeahead.current.time > TYPEAHEAD_BUFFER_MS;
    typeahead.current = {
      buffer: (stale ? "" : typeahead.current.buffer) + char.toLowerCase(),
      time: now,
    };
    return options.findIndex(
      (option) =>
        !option.disabled &&
        optionText(option).toLowerCase().startsWith(typeahead.current.buffer),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const {key} = event;
    const printable =
      key.length === 1 &&
      key !== " " &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey;

    if (!isOpen) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        event.preventDefault();
        openMenu();
      } else if (printable) {
        // @material/web: typeahead while closed selects directly.
        const index = typeaheadFind(key);
        if (index >= 0) {
          setValue(options[index].value);
          onChange?.(options[index].value);
        }
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlighted((current) => move(current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlighted((current) => move(current, -1));
        break;
      case "Home":
        event.preventDefault();
        setHighlighted(move(-1, 1));
        break;
      case "End":
        event.preventDefault();
        setHighlighted(move(options.length, -1));
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = options[highlighted];
        if (option && !option.disabled) commit(option.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        if (printable) {
          const index = typeaheadFind(key);
          if (index >= 0) setHighlighted(index);
        }
    }
  };

  return {
    commit,
    exiting,
    focused: focused && !disabled,
    handleKeyDown,
    highlighted,
    isOpen,
    mounted,
    openMenu,
    selectedIndex,
    setFocused,
    setHighlighted,
    setIsOpen,
    value,
    wrapper,
  };
}

export interface SelectMenuProps {
  baseId: string;
  exiting: boolean;
  highlighted: number;
  onHighlight: (index: number) => void;
  onSelect: (value: string) => void;
  options: SelectOption[];
  value: string;
}

/**
 * The select listbox: the M3E vertical-menu surface (corner-large 16,
 * surface-container-low, elevation 3) matching the field width, with the
 * @material/web open/close animation (500ms emphasized reveal / 150ms
 * accelerate). Options are 48dp with an inset state layer, label-large;
 * the selected one morphs to corner-medium with a tertiary-container fill
 * (the vertical-menu selected state). Listbox semantics are kept.
 */
export function SelectMenu({
  baseId,
  exiting,
  highlighted,
  onHighlight,
  onSelect,
  options,
  value,
}: SelectMenuProps) {
  useEffect(() => {
    if (highlighted < 0) return;
    document
      .getElementById(`${baseId}-opt-${highlighted}`)
      ?.scrollIntoView({block: "nearest"});
  }, [baseId, highlighted]);

  return (
    <ul
      className={cn(
        "absolute top-full left-0 z-[var(--md-sys-z-dropdown)] mt-1 flex max-h-[280px] w-full min-w-max flex-col overflow-hidden overflow-y-auto rounded-large bg-surface-container-low py-0.5 shadow-mm-3 [--menu-clip-bleed:-24px]",
        exiting ? "animate-menu-out" : "animate-menu-in",
      )}
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
  );
}

/**
 * M3 dropdown caret: down/up arrows cross-faded while the menu is open,
 * like @material/web's select (75ms linear delayed 75ms — half the menu
 * animation).
 */
export function SelectCaret({open = false}: {open?: boolean}) {
  const fade = "ease-md-linear transition-opacity delay-75 duration-75";
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={24}
      viewBox="0 0 24 24"
      width={24}>
      <path
        className={cn(fade, open ? "opacity-0" : "opacity-100")}
        d="M7 10l5 5 5-5z"
      />
      <path
        className={cn(fade, open ? "opacity-100" : "opacity-0")}
        d="M7 15l5-5 5 5z"
      />
    </svg>
  );
}
