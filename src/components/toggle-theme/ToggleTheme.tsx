import {ReactNode} from "react";
import {cn} from "../../utils/helpers";
import {useMaterialTheme} from "../../utils/theme";
import {IconButton, type IconButtonVariant} from "../button/IconButton";

export interface ToggleThemeLabels {
  /** Suffix after the theme name when `label` is shown. Default "theme". */
  name?: string;
  /** aria-label while light (clicking switches to dark). Default "Switch to dark theme". */
  toDark?: string;
  /** aria-label while dark (clicking switches to light). Default "Switch to light theme". */
  toLight?: string;
}

const TOGGLE_THEME_LABELS: Required<ToggleThemeLabels> = {
  name: "theme",
  toDark: "Switch to dark theme",
  toLight: "Switch to light theme",
};

export interface ToggleThemeProps {
  className?: string;
  /** Icon shown while dark (click switches to light). */
  darkIcon?: ReactNode;
  /** Show the current theme name next to the button. */
  label?: boolean;
  /** Customizable text and accessible names. */
  labels?: ToggleThemeLabels;
  /** Icon shown while light (click switches to dark). */
  lightIcon?: ReactNode;
  variant?: IconButtonVariant;
}

function SunIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={24}
      viewBox="0 0 24 24"
      width={24}>
      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-1-15h2v3h-2V2Zm0 17h2v3h-2v-3ZM3.5 4.9 4.9 3.5l2.2 2.1-1.5 1.5-2.1-2.2Zm13.4 13.4 1.5-1.5 2.1 2.2-1.4 1.4-2.2-2.1ZM19 11h3v2h-3v-2ZM2 11h3v2H2v-2Zm15-4.4 2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4ZM3.5 19.1l2.2-2.2 1.4 1.5-2.1 2.1-1.5-1.4Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={24}
      viewBox="0 0 24 24"
      width={24}>
      <path d="M12.3 21c-5 0-9.1-4-9.1-9 0-4.6 3.5-8.5 8-9a.8.8 0 0 1 .8 1.2 7.2 7.2 0 0 0 6.3 10.7c.9 0 1.8-.2 2.6-.5a.8.8 0 0 1 1 1A9.1 9.1 0 0 1 12.4 21Z" />
    </svg>
  );
}

/**
 * Light/dark toggle backed by useMaterialTheme (persists to localStorage,
 * toggles data-theme + the dark class on <html>).
 */
function ToggleTheme({
  className,
  darkIcon,
  label,
  labels,
  lightIcon,
  variant = "tonal",
}: ToggleThemeProps) {
  const {resolvedTheme, setTheme, theme} = useMaterialTheme();
  const isDark = resolvedTheme === "dark";
  const l = {...TOGGLE_THEME_LABELS, ...labels};

  return (
    <div className={cn("flex w-fit flex-row items-center gap-3", className)}>
      {label ? (
        <p className="flex text-body-medium text-on-surface capitalize">
          {theme} {l.name}
        </p>
      ) : null}
      <IconButton
        aria-label={isDark ? l.toLight : l.toDark}
        icon={isDark ? (lightIcon ?? <SunIcon />) : (darkIcon ?? <MoonIcon />)}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        variant={variant}
      />
    </div>
  );
}

export {ToggleTheme};
