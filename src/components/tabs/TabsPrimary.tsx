import {KeyboardEvent as ReactKeyboardEvent, ReactNode, useRef} from "react";
import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {useIsomorphicLayoutEffect} from "../../utils/_useIsomorphicLayoutEffect";
import {useRipple} from "../../utils/_ripple";

/* M3 Expressive tab-indicator motion = the default-spatial spring (Compose
 * `MotionSchemeKeyTokens.DefaultSpatial`, same spring the nav indicators
 * use), read from the token so it stays a single source of truth. The mw
 * 250ms emphasized was pre-Expressive. */
let cachedIndicatorEasing: string | null = null;
function indicatorEasing() {
  if (cachedIndicatorEasing !== null) return cachedIndicatorEasing;
  const fallback = "cubic-bezier(0.2, 0, 0, 1)";
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--md-sys-motion-spring-default-spatial")
    .trim();
  cachedIndicatorEasing = value || fallback;
  return cachedIndicatorEasing;
}

/**
 * Internal: slides the active-tab indicator from its previous position
 * (FLIP) with the default-spatial spring (450ms). Returns the ref to attach
 * to the indicator of the currently selected tab.
 */
export function useTabIndicator(selected: string) {
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const previousRect = useRef<DOMRect | null>(null);

  useIsomorphicLayoutEffect(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    const next = indicator.getBoundingClientRect();
    const previous = previousRect.current;
    previousRect.current = next;
    if (!previous || next.width === 0) return;
    const dx = previous.left - next.left;
    const scale = previous.width / next.width;
    if (dx === 0 && scale === 1) return;
    indicator.animate(
      [
        {transform: `translateX(${dx}px) scaleX(${scale})`},
        {transform: "none"},
      ],
      {duration: 450, easing: indicatorEasing()},
    );
  }, [selected]);

  return indicatorRef;
}

/**
 * Shared roving-focus keyboard handler for a tablist: Left/Right move between
 * enabled tabs (with wrap), Home/End jump to the first/last, and the tab is
 * activated as focus lands on it (automatic activation, WAI-ARIA tabs). Tab
 * buttons must carry id `tab-<id>`.
 */
export function onTabListKeyDown(
  event: ReactKeyboardEvent<HTMLDivElement>,
  tabs: {disabled?: boolean; id: string}[],
  selected: string,
  select: (id: string) => void,
) {
  const enabled = tabs.filter((tab) => !tab.disabled);
  if (!enabled.length) return;
  const current = enabled.findIndex((tab) => tab.id === selected);
  let next: number;
  switch (event.key) {
    case "ArrowRight":
      next = (current + 1) % enabled.length;
      break;
    case "ArrowLeft":
      next = (current - 1 + enabled.length) % enabled.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = enabled.length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  const target = enabled[next];
  if (!target) return;
  select(target.id);
  event.currentTarget
    .querySelector<HTMLElement>(`[id="tab-${target.id}"]`)
    ?.focus();
}

export interface TabItem {
  /** Panel content rendered below when the tab is selected. */
  content?: ReactNode;
  disabled?: boolean;
  header?: ReactNode;
  icon?: ReactNode;
  id: string;
}

export interface TabsPrimaryProps {
  className?: string;
  defaultSelected?: string;
  onChange?: (id: string) => void;
  /** Class for the selected tab's panel. */
  panelClassName?: string;
  selected?: string;
  tabs: TabItem[];
}

/**
 * M3 primary tabs: container 48 (64 with icon), title-small labels, 3px
 * content-width indicator with full top corners. Controllable via
 * `selected` + `onChange`.
 */
function TabsPrimary({
  className,
  defaultSelected,
  onChange,
  panelClassName,
  selected: selectedProp,
  tabs,
}: TabsPrimaryProps) {
  useRipple();
  const [selected, setSelected] = useControlled(
    selectedProp,
    defaultSelected ?? tabs[0]?.id ?? "",
  );
  const selectedTab = tabs.find((tab) => tab.id === selected);
  const hasIcons = tabs.some((tab) => tab.icon);
  const indicatorRef = useTabIndicator(selected);

  const select = (id: string) => {
    setSelected(id);
    onChange?.(id);
  };

  return (
    <div className={cn("flex h-fit w-full flex-col", className)}>
      <div
        className="flex flex-row items-stretch overflow-x-auto border-b border-outline-variant"
        onKeyDown={(event) => onTabListKeyDown(event, tabs, selected, select)}
        role="tablist">
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <button
              aria-controls={tab.content ? `panel-${tab.id}` : undefined}
              aria-selected={isSelected}
              className={cn(
                "state-layer flex w-full min-w-20 flex-auto items-center justify-center px-4 text-center text-title-small transition-colors duration-200 disabled:cursor-not-allowed disabled:text-on-surface/38 sm:min-w-max",
                hasIcons ? "h-16" : "h-12",
                isSelected
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface focus-visible:text-on-surface",
              )}
              disabled={tab.disabled}
              id={`tab-${tab.id}`}
              key={tab.id}
              onClick={() => select(tab.id)}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button">
              <span className="relative flex h-full flex-col items-center justify-center gap-0.5">
                {tab.icon ? (
                  <span className="flex h-6 w-6 items-center justify-center leading-none">
                    {tab.icon}
                  </span>
                ) : null}
                {tab.header}
                {isSelected ? (
                  // Primary indicator: 3dp, inset 2dp each
                  // side, min length 24dp, fully-rounded top
                  // corners (spec: 3,3,0,0).
                  <span
                    className="absolute inset-x-0.5 bottom-0 mx-auto h-[3px] min-w-6 origin-left rounded-t-full bg-primary"
                    ref={indicatorRef}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {selectedTab?.content !== undefined ? (
        <div
          aria-labelledby={`tab-${selectedTab.id}`}
          className={cn(
            "flex w-full flex-col gap-4 p-4 text-body-medium text-on-surface",
            panelClassName,
          )}
          id={`panel-${selectedTab.id}`}
          role="tabpanel">
          {selectedTab.content}
        </div>
      ) : null}
    </div>
  );
}

export {TabsPrimary};
