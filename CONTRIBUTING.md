# Contributing

Thanks for your interest in **react-material-expressive** — a community
implementation of Material 3 Expressive for the web. Contributions of all
kinds are welcome: bug reports, fidelity fixes, new components, docs and
accessibility improvements.

## Getting started

```bash
git clone https://github.com/gersilva96/react-material-expressive.git
cd react-material-expressive
npm install
```

Useful scripts:

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run build`     | Build `dist/` (CSS + ESM + CJS + types + themes) |
| `npm test`          | Run the Vitest suite (render + a11y assertions)  |
| `npm run typecheck` | `tsc --noEmit`                                   |
| `npm run lint`      | ESLint (`--max-warnings=0`)                      |
| `npm run format`    | Prettier write                                   |

The interactive component workbench (Storybook) and the documentation site
live in separate repositories; this repo is the library itself.

## Project conventions

- **React 19**, TypeScript, no runtime framework dependencies. Components are
  presentational and controllable — no business logic or data fetching.
- **Precompiled CSS** built from `src/styles.css` with the official
  `--md-sys-*` design tokens. Use full Tailwind class literals (the compiler
  scans for them); never concatenate partial class names.
- **Accessibility is a requirement, not an extra.** Interactive components own
  their focus management, ARIA roles/names/states and keyboard support. Add
  tests for any a11y-relevant behavior.
- Icons and fonts are passed in by the consumer; the library bundles neither.

See [AGENTS.md](AGENTS.md) for the architecture and conventions, and
[FOUNDATIONS.md](FOUNDATIONS.md) for the authoritative M3 Expressive spec
values behind each component.

## Pull requests

1. Fork and branch from `main`.
2. Keep changes focused; update the relevant `docs/components/*.md` and add or
   update tests.
3. Make sure `npm run lint`, `npm run typecheck`, `npm test` and
   `npm run build` all pass.
4. Note any breaking change in the PR description so it can be captured in the
   [CHANGELOG](CHANGELOG.md) with a migration note.

Commit messages follow a lightweight [gitmoji](https://gitmoji.dev/) +
scope style (e.g. `♿️ Tooltip: announce content via aria-describedby`), but
clarity matters more than the exact format.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By
participating you are expected to uphold it.
