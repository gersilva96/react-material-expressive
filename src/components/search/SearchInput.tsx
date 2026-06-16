import {ComponentProps, ReactNode} from "react";
import {cn} from "../../utils/helpers";

export interface SearchInputLabels {
  /** Input placeholder. Default "Search". */
  placeholder?: string;
}

const SEARCH_INPUT_LABELS: Required<SearchInputLabels> = {
  placeholder: "Search",
};

export interface SearchInputProps extends Omit<
  ComponentProps<"input">,
  "placeholder" | "size"
> {
  /** Class for the wrapper. */
  className?: string;
  inputClassName?: string;
  /** Customizable text (input placeholder). */
  labels?: SearchInputLabels;
  /** Leading slot (56px box), e.g. a search icon or back button. */
  leftElement?: ReactNode;
  /** Trailing slot (56px box), e.g. an avatar or mic icon. */
  rightElement?: ReactNode;
}

/**
 * M3 search bar input row: height 56, body-large text, visible placeholder
 * (search bars do not float labels). Transparent background — the `Search`
 * wrapper provides the container color and shape. Leading icon = on-surface
 * (the search icon is the primary affordance per the search-bar token set);
 * trailing icon/avatar = on-surface-variant.
 */
function SearchInput({
  className,
  inputClassName,
  labels,
  leftElement,
  rightElement,
  ...inputProps
}: SearchInputProps) {
  const l = {...SEARCH_INPUT_LABELS, ...labels};
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
          rightElement ? "pr-14" : "pr-4",
          inputClassName,
        )}
        type="search"
        {...inputProps}
        placeholder={l.placeholder}
      />
      {rightElement ? (
        <div className="absolute right-0 flex h-14 w-14 items-center justify-center text-on-surface-variant">
          {rightElement}
        </div>
      ) : null}
    </div>
  );
}

export {SearchInput};
