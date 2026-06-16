# BottomSheet / SideSheet

M3 modal sheets over a 32% scrim, on surface-container-low at elevation 1.
Both stay mounted during their exit animation (slide down / slide right)
and lock body scroll while open.

## Import

```tsx
import {BottomSheet, SideSheet} from "react-material-expressive";
```

## API

```ts
interface BottomSheetProps {
  children?: ReactNode;
  className?: string;
  dragHandle?: boolean; // M3 32x4 handle (default true; clicking it closes)
  isVisible?: boolean;
  onClose?: () => void;
}

interface SideSheetProps {
  children?: ReactNode;
  className?: string;
  closeButton?: boolean | ReactNode; // true = default X icon button
  isVisible?: boolean;
  labels?: SideSheetLabels; // accessible names
  onClose?: () => void;
  title?: ReactNode; // title-large header
}

interface SideSheetLabels {
  close?: string; // default close button aria-label (default "Close")
}
```

- BottomSheet: extra-large top corners, max width 640, 72dp top margin,
  slides from the bottom. The 32×4 drag handle is `on-surface-variant`
  (full opacity, per token) with 22dp padding above/below.
- SideSheet: docked right, 360px (400 on ≥sm; max-width 400), large start
  corners, slides from the right. The `title` headline is `on-surface-variant`
  (M3 side-sheet color role), not on-surface.

## Example

```tsx
<BottomSheet isVisible={open} onClose={() => setOpen(false)}>
    <List>…</List>
</BottomSheet>

<SideSheet closeButton isVisible={open} onClose={close} title="Filters">
    …
</SideSheet>
```

## Gotchas

- Controlled-only (`isVisible` + `onClose`); Escape and scrim click close.
- Content scrolls inside the sheet; the bottom sheet caps at
  `100vh − 72px`.
