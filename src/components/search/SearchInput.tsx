import {ChangeEvent, ComponentProps, ReactNode, useRef} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";

export interface SearchInputLabels {
  /** Clear-button aria-label. Default "Clear". */
  clear?: string;
  /** Input placeholder. Default "Search". */
  placeholder?: string;
}

const SEARCH_INPUT_LABELS: Required<SearchInputLabels> = {
  clear: "Clear",
  placeholder: "Search",
};

export interface SearchInputProps
  extends Omit<ComponentProps<"input">, "placeholder" | "size"> {
  /** Class for the wrapper. */
  className?: string;
  /** Render a clear (×) button in the trailing slot when the input has a
   *  value (unless `rightElement` is set). Default false. */
  clearable?: boolean;
  inputClassName?: string;
  /** Customizable text (placeholder, clear-button name). */
  labels?: SearchInputLabels;
  /** Leading slot (56px box), e.g. a search icon or back button. */
  leftElement?: ReactNode;
  /** Called after the clear button empties the input. */
  onClear?: () => void;
  /** Trailing slot (56px box), e.g. an avatar or mic icon. Takes precedence
   *  over the clear button. */
  rightElement?: ReactNode;
}

function CloseIcon() {
  return (
    <svg aria-hidden className="h-6 w-6 fill-current" viewBox="0 0 24 24">
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

/**
 * M3 search bar input row: height 56, body-large text, visible placeholder
 * (search bars do not float labels). Transparent background — the `Search`
 * wrapper provides the container color and shape. Leading icon = on-surface
 * (the search icon is the primary affordance per the search-bar token set);
 * trailing icon/avatar = on-surface-variant. With `clearable`, a trailing
 * clear button appears while there is a value (controllable or uncontrolled)
 * and the inconsistent native `type=search` clear is hidden.
 */
function SearchInput({
  className,
  clearable,
  defaultValue,
  inputClassName,
  labels,
  leftElement,
  onChange,
  onClear,
  rightElement,
  value: valueProp,
  ...inputProps
}: SearchInputProps) {
  const l = {...SEARCH_INPUT_LABELS, ...labels};
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useControlled<string>(
    valueProp as string | undefined,
    typeof defaultValue === "string" ? defaultValue : "",
  );
  const hasValue = value.length > 0;
  // The clear button only fills a trailing slot the consumer left empty.
  const showClear = Boolean(
    clearable && hasValue && !inputProps.disabled && !rightElement,
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange?.(event);
  };

  const clear = () => {
    const el = input.current;
    if (el) {
      // Native value setter + input event so React's onChange fires with "",
      // clearing controlled and uncontrolled usage alike; then refocus.
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(el, "");
      el.dispatchEvent(new Event("input", {bubbles: true}));
      el.focus();
    } else {
      setValue("");
    }
    onClear?.();
  };

  return (
    <div className={cn("relative flex h-14 w-full", className)}>
      {leftElement ? (
        <div className="absolute left-0 flex h-14 w-14 items-center justify-center text-on-surface">
          {leftElement}
        </div>
      ) : null}
      <input
        autoComplete="off"
        className={cn(
          "h-14 w-full bg-transparent text-body-large text-on-surface outline-none placeholder:text-on-surface-variant",
          leftElement ? "pl-14" : "pl-4",
          rightElement || showClear ? "pr-14" : "pr-4",
          // Hide the inconsistent native clear when we render our own.
          showClear && "[&::-webkit-search-cancel-button]:hidden",
          inputClassName,
        )}
        type="search"
        {...inputProps}
        onChange={handleChange}
        placeholder={l.placeholder}
        ref={input}
        value={value}
      />
      {rightElement ? (
        <div className="absolute right-0 flex h-14 w-14 items-center justify-center text-on-surface-variant">
          {rightElement}
        </div>
      ) : showClear ? (
        <div className="absolute right-0 flex h-14 w-14 items-center justify-center">
          <button
            aria-label={l.clear}
            className="state-layer flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-on-surface-variant"
            onClick={clear}
            type="button">
            <CloseIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export {SearchInput};
