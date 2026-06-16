# react-material-expressive

[![npm version](https://img.shields.io/npm/v/react-material-expressive.svg)](https://www.npmjs.com/package/react-material-expressive)
[![CI](https://github.com/gersilva96/react-material-expressive/actions/workflows/ci.yml/badge.svg)](https://github.com/gersilva96/react-material-expressive/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/npm/l/react-material-expressive.svg)](LICENSE)

React component system implementing **Material 3 Expressive**: official M3
design tokens, state layers, the full type/shape/elevation scales and
motion — framework-agnostic (no `next/*`), RSC/SSR friendly, with
**precompiled CSS** (you don't set up Tailwind) and runtime theming via CSS
variables.

- React `>= 19` (peer dependency). ESM + CJS + TypeScript types.
- Pure UI kit: presentational, controllable components. No business logic,
  no data fetching, no app state.
- Machine-readable docs per component in [`docs/components/`](docs/components)
  and an LLM index in [`llms.txt`](llms.txt).
- **Live demo**: [ger-material-expressive.vercel.app](https://ger-material-expressive.vercel.app)
  (the Storybook, redeployed on every push).

## Installation

```bash
npm install react-material-expressive react react-dom
```

React 19+ is a peer dependency. The package ships precompiled CSS, ESM + CJS
builds and TypeScript types — there is nothing else to configure.

## Quickstart

```tsx
// 1. Import the precompiled stylesheet ONCE (global CSS / root layout).
import "react-material-expressive/styles.css";

// 2. Use the components.
import {Button, Card, Dialog, Switch} from "react-material-expressive";

export function Example() {
  return (
    <Card variant="elevated">
      <Card.Body>
        <Switch defaultChecked label="Notifications" />
      </Card.Body>
      <Card.Footer className="justify-end">
        <Button variant="text">Dismiss</Button>
        <Button>Accept</Button>
      </Card.Footer>
    </Card>
  );
}
```

No Tailwind, no ThemeProvider, no configuration. Components are client
components (`"use client"` is embedded in every entry), so they can be
imported directly from React Server Components.

### Exports

The package has a single JavaScript entry, the precompiled stylesheet and an
optional Tailwind partial:

| Import                                      | Contents                                             |
| ------------------------------------------- | ---------------------------------------------------- |
| `react-material-expressive`            | all components, elements and layers                  |
| `react-material-expressive/styles.css` | precompiled stylesheet (import once)                 |
| `react-material-expressive/theme.css`  | raw Tailwind v4 partial — only to extend (see below) |

## Theming

Everything resolves through **official M3 tokens** at runtime:
`--md-sys-color-*` (full 49-role scheme), `--md-sys-shape-corner-*`,
`--md-sys-elevation-level1..5`, `--md-ref-typeface-brand/plain`.

- `:root` ships the light scheme and `.dark, [data-theme="dark"]` the dark
  one — both verbatim Material Theme Builder exports.

Theme switching uses the prebuilt `ToggleTheme` / `ToggleThemeMenu`
components (there is no ThemeProvider): they read/write `data-theme` on
`<html>` (SSR-safe, synced across instances and tabs) and persist to
`localStorage`.

```tsx
import {ToggleTheme} from "react-material-expressive";

<ToggleTheme />;
```

There is no public JavaScript theming API — customization is done purely
through CSS token overrides (see below).

### Custom themes (cascade override)

The CSS is precompiled and only reads variables, so a custom theme is just
a token override. Paste a [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/)
export verbatim:

```css
/* my-brand.css — loaded after styles.css */
:root {
  --md-sys-color-primary: #006a60;
  --md-sys-color-on-primary: #ffffff;
  /* ...rest of the export... */
}
```

Scoped themes work the same way on any element: any class or
`data-theme` scope that overrides the tokens re-themes its subtree.

### Typography

The type scale ships as utilities (`text-display-large` …
`text-label-small`) that inherit two typeface tokens. Fonts are **named but
never bundled** — load yours and point the tokens at it:

```css
:root {
  --md-ref-typeface-brand: "Google Sans", system-ui, sans-serif;
  --md-ref-typeface-plain: "Google Sans Text", system-ui, sans-serif;
}
```

### Extending with your own Tailwind (optional)

Most apps only import `styles.css`. If you run **your own Tailwind v4** and want
to write markup with the same M3 utilities the library uses — `bg-primary`,
`text-on-surface`, `rounded-extra-large`, `shadow-mm-1`, `text-headline-small`,
even token roles the precompiled CSS never emitted — import the raw partial into
your Tailwind entry:

```css
@import "tailwindcss";
@import "react-material-expressive/theme.css";
```

That's all you need: the mappings are `@theme inline`, so the utilities
re-resolve per element and switch light/dark automatically by following the
tokens (their **values** come from the `styles.css` you already import for the
components — or a Material Theme Builder paste). `theme.css` also registers the
`dark:` variant against the library's `.dark`/`[data-theme]` toggle, so explicit
`dark:` utilities in your code match the components.

## Icons

Components take icons as `ReactNode` (`icon`, `iconLeft`, `iconRight`,
`leftElement`…) — the library bundles **no icon font or icon package**.
Recommended: [Material Symbols](https://fonts.google.com/icons) (variable
font). Load it yourself, e.g.:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
  rel="stylesheet" />
```

and use the zero-dependency helper:

```tsx
import {MaterialSymbol} from "react-material-expressive";

<Button iconLeft={<MaterialSymbol name="add" size={18} />}>New</Button>;
```

## Images and links (framework-agnostic)

There are no proprietary `Image`/`Link` components. Image-like components
(`Avatar`, `Img`, `Stories.User`…) accept `src: string | StaticImageData`
and render a native `<img>` (object-fit + hide-on-error), or let you inject
your framework's component with priority **render > image > children**:

```tsx
import Image from "next/image"; // in YOUR app, not in the library

<Avatar
  src={photo}
  render={({src, alt, className, style}) => (
    <Image alt={alt} className={className} fill src={src!} style={style} />
  )}
/>;
```

Navigation components render native `<a href>` and derive their active
state from `active` or `currentPath` (`resolveActive`); client-side routing
plugs in via `onClick` or a wrapper.

## State layers, disabled, motion

- Interaction states follow M3 **state layers** (hover 8%, focus 10%,
  pressed 10%) — exposed as the `.state-layer` class for custom items.
- Disabled follows M3: container 12% / content 38% of `on-surface`.
- Entrances use emphasized-decelerate (400ms), exits emphasized-accelerate
  (200ms); overlays stay mounted during their exit animation.

## Internationalization (i18n)

Every component with user-facing text accepts a **`labels` prop** — an object
of optional strings (a few are `ReactNode`) merged over the built-in English
defaults. Override one instance, or pass the same object everywhere to localize
the whole app. The library ships **English defaults only**; the translations
are yours to provide (like the fonts and icons, named but not bundled).

```tsx
<Snackbar text="Foto archivada" labels={{dismiss: "Descartar"}} showClose />
<Chips onRemove={remove} labels={{remove: "Quitar"}}>Etiqueta</Chips>
<SearchInput labels={{placeholder: "Buscar"}} />
```

`labels` covers chrome and accessible names only. Date/number formatting is
driven by a separate **`locale`** prop on the pickers (native `Intl`), and the
date/time pickers expose their full label sets too (`DatePickerLabels`,
`TimePickerLabels`, …). Each component's `*Labels` type is exported from the
barrel.

Consolidating every string under `labels` renamed a few single-purpose text
props (breaking):

| Component                            | Old prop      | New                      |
| ------------------------------------ | ------------- | ------------------------ |
| FABMenu                              | `label`       | `labels={{open}}`        |
| SplitButton                          | `menuLabel`   | `labels={{menu}}`        |
| SearchInput                          | `placeholder` | `labels={{placeholder}}` |
| Slider / SliderDual                  | `aria-label`  | `labels={{label}}`       |
| Progress / Circle / LoadingIndicator | `aria-label`  | `labels={{label}}`       |
| Amount                               | `aria-label`  | `labels={{label}}`       |
| Loading                              | `label`       | `labels={{label}}`       |

The theme-name strings of `ToggleThemeMenu` stay in its `themes` list (an
`{id, label}` array), not in `labels`.

## Component catalog

| Family            | Docs                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buttons           | [Button](docs/components/Button.md) · [ButtonGroup](docs/components/ButtonGroup.md) · [ButtonGroupConnected](docs/components/ButtonGroupConnected.md) · [IconButton](docs/components/IconButton.md) · [FAB / ExtendedFAB](docs/components/FAB.md) · [FABMenu](docs/components/FABMenu.md) · [SplitButton](docs/components/SplitButton.md)                                                                                    |
| Communication     | [Badge](docs/components/Badge.md) · [Progress / Circle](docs/components/Progress.md) · [LoadingIndicator](docs/components/LoadingIndicator.md) · [Snackbar](docs/components/Snackbar.md) · [Tooltip](docs/components/Tooltip.md) · [Loading](docs/components/Loading.md)                                                                                                                                                     |
| Containment       | [Card](docs/components/Card.md) · [Dialog](docs/components/Dialog.md) · [Sheets](docs/components/Sheets.md) · [Divider](docs/components/Divider.md) · [List](docs/components/List.md) · [Table](docs/components/Table.md)                                                                                                                                                                                                    |
| Selection & input | [Checkbox](docs/components/Checkbox.md) · [Radio](docs/components/Radio.md) · [Switch](docs/components/Switch.md) · [Chips](docs/components/Chips.md) · [Slider / SliderDual](docs/components/Slider.md) · [TextField](docs/components/TextField.md) · [Select](docs/components/Select.md) · [Amount](docs/components/Amount.md) · [DatePicker](docs/components/DatePicker.md) · [TimePicker](docs/components/TimePicker.md) |
| Navigation        | [NavigationBar](docs/components/NavigationBar.md) · [NavigationRail](docs/components/NavigationRail.md) · [TopAppBar](docs/components/TopAppBar.md) · [Toolbars](docs/components/Toolbar.md) · [Tabs](docs/components/Tabs.md) · [Link](docs/components/Link.md) · [Search](docs/components/Search.md)                                                                                                                       |
| Menus             | [Menu](docs/components/Menu.md) · [Dropdown](docs/components/Dropdown.md) · [OverflowMenu](docs/components/OverflowMenu.md) · [ToggleTheme](docs/components/ToggleTheme.md)                                                                                                                                                                                                                                                  |
| Media & showcase  | [Avatar](docs/components/Avatar.md) · [AvatarStack](docs/components/AvatarStack.md) · [Img](docs/components/Img.md) · [MediaFrame](docs/components/MediaFrame.md) · [Gallery](docs/components/Gallery.md) · [Stories](docs/components/Stories.md) · [Video](docs/components/Video.md) · [Perspective](docs/components/Perspective.md) · [Blob](docs/components/Blob.md)                                                      |
| Text & icons      | [TextElement](docs/components/TextElement.md) · [Icon](docs/components/Icon.md) · [MaterialSymbol](docs/components/MaterialSymbol.md)                                                                                                                                                                                                                                                                                        |
| Layout            | [Layers](docs/components/Layers.md)                                                                                                                                                                                                                                                                                                                                                                                          |

### Expressive-only

This kit is **Material 3 Expressive only**. Components and variants that the
M3 Expressive spec marks "no longer recommended" are not shipped: the
NavigationDrawer (→ expanded [NavigationRail](docs/components/NavigationRail.md)),
BottomAppBar (→ [DockedToolbar](docs/components/Toolbar.md)) and SegmentedButtons
(→ [ButtonGroupConnected](docs/components/ButtonGroupConnected.md) with toggles)
components were removed, as were the FAB `surface` color / small (40dp) size,
the Slider `classic` prop, the TopAppBar `Medium`/`Large` `baseline` prop and
the NavigationBar `tall` height. The expressive default is the only path.

Where the spec keeps more than one valid style, the **recommended** one is the
default and the alternative stays available:

| Component                                        | Default (recommended)          | Still-available alternative |
| ------------------------------------------------ | ------------------------------ | --------------------------- |
| [List](docs/components/List.md)                  | `variant="expressive"` (tiles) | `variant="plain"`           |
| [Search](docs/components/Search.md)              | contained (gapped card)        | `divided` prop              |
| [Progress / Circle](docs/components/Progress.md) | flat indicator                 | `wavy` prop                 |

## Versioning

This project follows [Semantic Versioning](https://semver.org/): breaking
changes bump the _major_ version, new features the _minor_, and fixes the
_patch_. See the [CHANGELOG](CHANGELOG.md) for every release, with a
**migration note** on each breaking change so you know exactly what to adjust
when upgrading.

## Development (this repo)

```bash
npm install
npm run build            # dist/: css + esm + cjs + dts + themes
npm run typecheck && npm run lint && npm test
```

See [AGENTS.md](AGENTS.md) for architecture and conventions, and
[CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute. The interactive
component workbench (Storybook) lives in a separate repository.

## License

MIT
