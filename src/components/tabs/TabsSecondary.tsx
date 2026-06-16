import {cn} from "../../utils/helpers";
import {useControlled} from "../../utils/_useControlled";
import {onTabListKeyDown, useTabIndicator, type TabItem} from "./TabsPrimary";
import {useRipple} from "../../utils/_ripple";

export interface TabsSecondaryProps {
  className?: string;
  defaultSelected?: string;
  onChange?: (id: string) => void;
  /** Class for the selected tab's panel. */
  panelClassName?: string;
  selected?: string;
  tabs: TabItem[];
}

/**
 * M3 secondary tabs: container 48, title-small labels, 2px full-width
 * indicator. Controllable via `selected` + `onChange`.
 */
function TabsSecondary({
  className,
  defaultSelected,
  onChange,
  panelClassName,
  selected: selectedProp,
  tabs,
}: TabsSecondaryProps) {
  useRipple();
  const [selected, setSelected] = useControlled(
    selectedProp,
    defaultSelected ?? tabs[0]?.id ?? "",
  );
  const selectedTab = tabs.find((tab) => tab.id === selected);
  const indicatorRef = useTabIndicator(selected);

  const select = (id: string) => {
    setSelected(id);
    onChange?.(id);
  };

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <div
        className="flex h-12 flex-row overflow-x-auto border-b border-outline-variant"
        onKeyDown={(event) => onTabListKeyDown(event, tabs, selected, select)}
        role="tablist">
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <button
              aria-controls={tab.content ? `panel-${tab.id}` : undefined}
              aria-selected={isSelected}
              className={cn(
                "state-layer relative flex h-12 w-full min-w-[100px] flex-auto items-center justify-center gap-2 px-4 text-center text-title-small transition-colors duration-200 disabled:cursor-not-allowed disabled:text-on-surface/38 sm:min-w-max",
                isSelected
                  ? "text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface focus-visible:text-on-surface",
              )}
              disabled={tab.disabled}
              id={`tab-${tab.id}`}
              key={tab.id}
              onClick={() => select(tab.id)}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button">
              {tab.icon ? (
                <span className="flex h-6 w-6 items-center justify-center leading-none">
                  {tab.icon}
                </span>
              ) : null}
              {tab.header}
              {isSelected ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                  ref={indicatorRef}
                />
              ) : null}
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

export {TabsSecondary};
