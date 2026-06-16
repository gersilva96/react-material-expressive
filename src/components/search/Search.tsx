import {ReactNode, useRef, useState} from "react";
import {cn} from "../../utils/helpers";
import {useDismissable} from "../_useDismissable";
import {useOutsideClose} from "../_useOutsideClose";
import {SearchItem} from "./SearchItem";
import {SearchInput} from "./SearchInput";

export interface SearchProps {
  /** The search bar content (usually a SearchInput). */
  children: ReactNode;
  className?: string;
  /**
   * M3 baseline ("divided") style: the bar joins the results panel with a
   * divider instead of staying a separate, gapped card. The M3 Expressive
   * spec marks this "not recommended — use contained" (the default).
   */
  divided?: boolean;
  /** Suggestions shown while open (Search.Item list). */
  result?: ReactNode;
  /** Class for the results container. */
  resultClassName?: string;
}

/**
 * M3 search bar + docked search view. Default = the M3 Expressive **contained**
 * style: a persistent full-pill bar on surface-container-high that opens a
 * separate results card below (corner-medium, 2dp gap, no divider). The legacy
 * **divided** style (`divided`) joins the bar and results with a divider and
 * squares off the bar's bottom corners — kept for baseline parity. Closes on
 * outside click or Escape.
 */
function Search({
  children,
  className,
  divided = false,
  result,
  resultClassName,
}: SearchProps) {
  const [isActive, setIsActive] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const open = isActive && Boolean(result);
  // Menu choreography: open 500ms emphasized, close 150ms accelerate.
  const {exiting, mounted} = useDismissable(open, 150);

  useOutsideClose(wrapper, () => setIsActive(false), isActive);

  return (
    <div
      className={cn(
        "relative z-30 flex h-fit w-full min-w-[360px] max-w-[720px] cursor-pointer bg-surface-container-high text-on-surface",
        // Contained (M3 Expressive): the bar stays a persistent 28px
        // pill (real px — corner-full would snap instead of morphing).
        // Divided (baseline): its bottom corners square off in step
        // with the panel reveal and round back with its exit.
        divided && open
          ? "rounded-[28px] rounded-b-none transition-all duration-500 ease-emphasized"
          : divided
            ? "rounded-[28px] transition-all duration-150 ease-emphasized-accelerate"
            : "rounded-[28px]",
        className,
      )}
      onClick={() => setIsActive(true)}
      onFocus={() => setIsActive(true)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsActive(false);
      }}
      ref={wrapper}
      role="search">
      {children}
      {mounted ? (
        <div
          className={cn(
            "absolute top-full left-0 flex w-full flex-col",
            // Contained: 2dp gap between the bar and the card.
            divided ? "" : "pt-0.5",
          )}>
          <div
            className={cn(
              // Both styles carry shadow-mm-3 (level 3); bleed the
              // static edges so the clip-path reveal doesn't crop
              // that shadow (the box-shadow gotcha).
              "flex max-h-[310px] flex-col overflow-hidden overflow-y-auto bg-surface-container-high py-2 shadow-mm-3 [--menu-clip-bleed:-24px]",
              divided
                ? "rounded-b-extra-large border-t border-outline"
                : // Separate card: corner-medium all around.
                  "rounded-medium",
              exiting ? "animate-menu-out" : "animate-menu-in",
              resultClassName,
            )}>
            {result}
          </div>
        </div>
      ) : null}
    </div>
  );
}

Search.Item = SearchItem;
Search.Input = SearchInput;

export {Search};
