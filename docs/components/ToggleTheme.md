# ToggleTheme / ToggleThemeMenu

Prebuilt theme controls. `ToggleTheme` flips
light↔dark; `ToggleThemeMenu` opens an OverflowMenu listing the built-in
themes (light/dark) or a custom set, marking the active one.

## Import

```tsx
import {ToggleTheme, ToggleThemeMenu} from "react-material-expressive";
```

## API

```ts
interface ToggleThemeProps {
  className?: string;
  darkIcon?: ReactNode; // shown while light (click → dark)
  label?: boolean; // show the current theme name
  labels?: ToggleThemeLabels; // accessible names
  lightIcon?: ReactNode; // shown while dark (click → light)
  variant?: IconButtonVariant; // default "tonal"
}

interface ToggleThemeLabels {
  toLight?: string; // aria-label while dark (default "Switch to light theme")
  toDark?: string; // aria-label while light (default "Switch to dark theme")
  name?: string; // visible suffix when `label` is shown (default "theme")
}

interface ToggleThemeMenuProps {
  className?: string;
  icon?: ReactNode; // trigger icon (default palette)
  label?: boolean;
  labels?: ToggleThemeMenuLabels; // accessible names
  themes?: {id: "light" | "dark"; label: string}[];
  variant?: IconButtonVariant;
}

interface ToggleThemeMenuLabels {
  trigger?: string; // trigger aria-label (default "Choose theme")
  name?: string; // visible suffix when `label` is shown (default "theme")
}
```

## Example

```tsx
<ToggleTheme label />
<ToggleThemeMenu themes={[{id: "light", label: "Claro"}, {id: "dark", label: "Oscuro"}]} />
```

## Gotchas

- They mutate `data-theme`/`.dark` on `<html>` and persist to
  `localStorage("md-theme")`.
- Default icons are inline SVGs; pass your own for brand consistency.
- **Not an M3 component.** Theme switching has no Material 3 spec — these are
  app-level helpers. `ToggleTheme` is an [IconButton](IconButton.md) (default
  `tonal`) whose icon/`aria-label` swap with the resolved theme;
  `ToggleThemeMenu` is an [OverflowMenu](OverflowMenu.md) over the shared M3E
  [vertical Menu](Menu.md). All M3 fidelity (sizing, shape morph, state
  layers, menu visuals) is inherited from those components.
- `ToggleThemeMenu` marks the active theme **visually only** (the item turns
  `tertiary-container`, no checkmark) — same convention as `Menu.Item`
  `selected`; there is no `aria-checked`/`aria-current`. Pass a custom
  `themes` list when shipping custom token sets (`id` must match the theme
  you set via tokens).
- The theme **names** ("Light"/"Dark") are translated through the existing
  `themes` prop (an `{id, label}` list), not through `labels` — `labels` only
  covers the trigger aria-label and the visible "theme" suffix.
