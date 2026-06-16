import {useCallback, useEffect, useSyncExternalStore} from "react";

/** Themes shipped with the library. Custom themes work by overriding the
 * --md-sys-* tokens in CSS; this type covers the built-in ones. */
export type MaterialTheme = "light" | "dark";

const STORAGE_KEY = "md-theme";
const THEME_EVENT = "md-theme-change";
const THEMES: readonly MaterialTheme[] = ["light", "dark"];
/** Themes whose palette is dark — they also toggle the `dark` class. */
const DARK_THEMES: readonly MaterialTheme[] = ["dark"];

function isMaterialTheme(value: unknown): value is MaterialTheme {
  return THEMES.includes(value as MaterialTheme);
}

function resolve(theme: MaterialTheme): "light" | "dark" {
  return DARK_THEMES.includes(theme) ? "dark" : "light";
}

/**
 * Imperatively apply a theme: sets `data-theme` on <html>, toggles the
 * `dark` class for dark palettes and persists the choice. SSR-safe (no-op
 * on the server).
 */
export function setMaterialTheme(theme: MaterialTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", resolve(theme) === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode, SSR mismatch) — theming
    // still works for the session.
  }
  window.dispatchEvent(new CustomEvent(THEME_EVENT, {detail: theme}));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): MaterialTheme {
  const attr = document.documentElement.getAttribute("data-theme");
  return isMaterialTheme(attr) ? attr : "light";
}

function getServerSnapshot(): MaterialTheme {
  return "light";
}

/**
 * Theme state without a provider. Reads/writes `data-theme` on
 * `document.documentElement`, persists to localStorage ("md-theme") and
 * stays in sync across hook instances and browser tabs.
 */
export function useMaterialTheme(): {
  theme: MaterialTheme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: MaterialTheme) => void;
} {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Restore the persisted theme once on mount.
  useEffect(() => {
    let stored: string | null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (isMaterialTheme(stored) && stored !== getSnapshot()) {
      setMaterialTheme(stored);
    }
  }, []);

  const setTheme = useCallback((next: MaterialTheme) => {
    setMaterialTheme(next);
  }, []);

  return {theme, resolvedTheme: resolve(theme), setTheme};
}
