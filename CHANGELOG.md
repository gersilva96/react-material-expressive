# Changelog

All notable changes to `react-material-expressive` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project follows [Semantic Versioning](https://semver.org/).

Each breaking entry includes a **Migration** note so consumers know exactly
what to adjust when upgrading.

## [Unreleased]

## [1.1.1] - 2026-06-21

### Fixed

- **`ComboboxFilled` / `ComboboxOutlined` placeholder** — when a `label` is set,
  the `placeholder` no longer shows underneath the resting label; it now stays
  hidden until the field floats (focus or value), matching the text field
  behavior. Without a `label` the placeholder shows at rest as before.
- **Form field shape** — `ComboboxFilled` / `ComboboxOutlined` and
  `SelectFilled` / `SelectOutlined` used `small` (8dp) corners while the text
  fields use `extra-small` (4dp). They now all share the text field's
  `extra-small` shape, so fields sitting together in a form line up.

## [1.1.0] - 2026-06-20

### Added

- **`ComboboxOutlined` / `ComboboxFilled`** — an ARIA combobox (text field +
  portaled `role="listbox"`) with consumer-controlled async options: type to
  fire `onInputChange`, feed back already-filtered `options`, with `loading`,
  `clearable`, error states and full keyboard. Closes the gap that forced
  integrators to use `Search` as a combobox substitute.
- **Documented `--md-sys-z-*` stacking tokens** — every overlay (menus,
  tooltips, dialogs/sheets, snackbar) now layers through one ascending,
  consumer-overridable z-index scale instead of scattered hard-coded values.
  See FOUNDATIONS.md → Stacking & z-index.
- **`DatePickerDocked` error state** — accepts `error` / `errorText` /
  `supportingText`, forwarded to its underlying outlined field (MD3 error role
  with `aria-invalid` / `role="alert"` / `aria-describedby`).
- **`SearchInput` clear button** — opt-in `clearable` renders a trailing clear
  (×) button while the input has a value; it clears (controlled or
  uncontrolled), refocuses the input, fires `onClear`, hides the inconsistent
  native search clear, and yields to an explicit `rightElement`. Adds
  `labels.clear`.
- **Polymorphic `TextElement`** — new `as` / `titleAs` / `labelAs` / `bodyAs`
  props set each rendered element (defaults preserved: div/p/h2/p) so the
  heading level follows content hierarchy (M3 a11y). With a single slot the
  text element now renders directly, without the wrapper `<div>`.
- **`llms.txt` discoverability** — exposed as the
  `react-material-expressive/llms.txt` export subpath and pointed to by an
  `llmsTxt` field in `package.json`, plus a prominent pointer at the top of the
  README.

### Changed

- **`llms.txt` review** — every entry now carries a one-line description, the
  new components/props are reflected, a FOUNDATIONS pointer was added, and the
  stale pre-1.0 versioning note was corrected. Links stay relative (the package
  bundles `docs/`).

### Fixed

- **Top-level menus no longer clip inside `overflow` ancestors** — `Dropdown`,
  `OverflowMenu` and `SplitButton` now render their menu in a portal on
  `document.body` with fixed positioning (like `Menu.Sub` already did),
  auto-flipping above the trigger when there's no room below and tracking it
  on scroll/resize. Positioning is unified in a shared internal helper.
- **NavigationRail no longer shows a needless scrollbar** — the destinations
  area is the sole flexible region and scrolls only on real overflow; the
  header and bottom slot keep their natural size.
- **README links resolve on npm** — the relative links (component docs,
  `LICENSE`, `llms.txt`, `CHANGELOG`, `AGENTS.md`, `CONTRIBUTING.md`) are now
  absolute GitHub URLs, so they work on the npmjs.com package page (where
  relative links 404) as well as on GitHub.

## [1.0.0] - 2026-06-17

Initial public release — the first complete implementation of **Material 3
Expressive** for the web (the official Material Web library only ships the
baseline).

### Added

- **Components, elements and layers** covering the M3
  Expressive surface: buttons (incl. FAB, split, button groups), cards,
  dialogs, sheets, navigation (bar/rail/tabs/top app bar/toolbars), menus,
  selection and input (text fields, select, chips, sliders, checkbox, radio,
  switch, date and time pickers), communication (snackbar, tooltip, badges,
  progress, loading indicator) and more.
- **Precompiled CSS** — import one stylesheet; no Tailwind setup required.
- **Runtime theming** through the official `--md-sys-*` tokens, with built-in
  light/dark and any scoped or custom Material Theme Builder export.
- **Framework-agnostic** — native `<img>`/`<a>` with media/link injection, no
  `next/*`; RSC/SSR friendly with `"use client"` embedded in every entry.
- **i18n** via a per-component `labels` prop (English defaults).
- **Accessibility** hardened across the interactive components: focus
  management and trapping, ARIA names/roles/states, and full keyboard support.
- React 19+, **ESM + CJS** builds and **TypeScript** types, plus
  machine-readable per-component docs and an LLM index.

[Unreleased]: https://github.com/gersilva96/react-material-expressive/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/gersilva96/react-material-expressive/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/gersilva96/react-material-expressive/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/gersilva96/react-material-expressive/releases/tag/v1.0.0
