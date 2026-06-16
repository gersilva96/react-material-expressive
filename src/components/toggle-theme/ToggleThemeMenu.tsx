import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useMaterialTheme, type MaterialTheme} from "../../utils/theme";
import {IconButton, type IconButtonVariant} from "../button/IconButton";
import {OverflowMenu} from "../overflow-menu/OverflowMenu";

export interface ToggleThemeMenuItem {
  id: MaterialTheme;
  label: string;
}

export interface ToggleThemeMenuLabels {
  /** Suffix after the theme name when `label` is shown. Default "theme". */
  name?: string;
  /** aria-label for the menu trigger. Default "Choose theme". */
  trigger?: string;
}

const TOGGLE_THEME_MENU_LABELS: Required<ToggleThemeMenuLabels> = {
  name: "theme",
  trigger: "Choose theme",
};

export interface ToggleThemeMenuProps {
  className?: string;
  /** Trigger icon (defaults to a palette glyph). */
  icon?: ReactNode;
  /** Show the current theme name next to the trigger. */
  label?: boolean;
  /** Customizable text and accessible names for the trigger. The theme
   * names themselves are translated through `themes`. */
  labels?: ToggleThemeMenuLabels;
  /** Selectable themes (defaults to the built-in light/dark; pass your
   * own list when shipping custom token sets, also to translate the
   * theme names). */
  themes?: ToggleThemeMenuItem[];
  variant?: IconButtonVariant;
}

const DEFAULT_THEMES: ToggleThemeMenuItem[] = [
  {id: "light", label: "Light"},
  {id: "dark", label: "Dark"},
];

function PaletteIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={24}
      viewBox="0 0 24 24"
      width={24}>
      <path d="M12 22a10 10 0 1 1 10-10c0 3.3-2.2 5-4.5 5H15.7c-1 0-1.7.8-1.7 1.7 0 .4.2.8.4 1.1.3.3.5.7.5 1.2 0 1-.8 2-1.9 2H12Zm-5.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm3-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm3 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

/**
 * Theme picker menu backed by useMaterialTheme. Lists the built-in themes
 * (or a custom set) and marks the active one.
 */
function ToggleThemeMenu({
  className,
  icon,
  label,
  labels,
  themes = DEFAULT_THEMES,
  variant = "tonal",
}: ToggleThemeMenuProps) {
  const {setTheme, theme} = useMaterialTheme();
  const l = {...TOGGLE_THEME_MENU_LABELS, ...labels};

  return (
    <div className={cn("flex w-fit flex-row items-center gap-3", className)}>
      {label ? (
        <p className="flex text-body-medium text-on-surface capitalize">
          {theme} {l.name}
        </p>
      ) : null}
      <OverflowMenu
        bottomRight
        menu={themes.map((item) => (
          <OverflowMenu.Item
            key={item.id}
            label={item.label}
            onClick={() => setTheme(item.id)}
            selected={theme === item.id}
          />
        ))}>
        <IconButton
          aria-label={l.trigger}
          icon={icon ?? <PaletteIcon />}
          variant={variant}
        />
      </OverflowMenu>
    </div>
  );
}

export {ToggleThemeMenu};
