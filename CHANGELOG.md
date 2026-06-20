# Changelog

All notable changes to `react-material-expressive` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the project follows [Semantic Versioning](https://semver.org/).

Each breaking entry includes a **Migration** note so consumers know exactly
what to adjust when upgrading.

## [Unreleased]

### Added

- **Documented `--md-sys-z-*` stacking tokens** — every overlay (menus,
  tooltips, dialogs/sheets, snackbar) now layers through one ascending,
  consumer-overridable z-index scale instead of scattered hard-coded values.
  See FOUNDATIONS.md → Stacking & z-index.

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

[Unreleased]: https://github.com/gersilva96/react-material-expressive/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gersilva96/react-material-expressive/releases/tag/v1.0.0
