# Snackbar / SnackbarWrapper

M3 snackbar: shape extra-small (4), inverse-surface, min height 48, width
344–600, `body-medium` text. Action and close render as real M3 buttons
recolored to inverse roles. `SnackbarWrapper` is the fixed bottom-centered
stacking area.

## Import

```tsx
import {Snackbar, SnackbarWrapper} from "react-material-expressive";
```

## API

```ts
interface SnackbarProps {
  actionLabel?: string; // optional text action
  autoHideDuration?: number; // ms; auto-calls onClose, pauses on hover/focus
  button?: ReactNode; // extra trailing content
  className?: string;
  closeIcon?: ReactNode; // custom X
  isVisible: boolean;
  labels?: SnackbarLabels; // accessible names
  onAction?: () => void;
  onClose?: () => void;
  showClose?: boolean; // optional close icon button
  text?: ReactNode;
}

interface SnackbarLabels {
  dismiss?: string; // close button aria-label (default "Dismiss")
}

interface SnackbarWrapperProps {
  children: ReactNode;
  className?: string;
}
```

Everything but `isVisible` is optional — a message-only snackbar is valid.

## Example

```tsx
<SnackbarWrapper>
  <Snackbar
    actionLabel="Undo"
    autoHideDuration={4000}
    isVisible={open}
    onAction={undo}
    onClose={() => setOpen(false)}
    showClose
    text="Photo archived"
  />
</SnackbarWrapper>
```

## Gotchas

- Auto-hide pauses while hovered or focused (M3 a11y) and resumes with a
  full interval on leave.
- Enter/exit are a fade + scale (0.8↔1) — the M3 Expressive snackbar motion
  (Compose `FadeInFadeOutWithScale`), not a slide; the component unmounts
  ~200ms after `isVisible` goes false.
- Single-line is 48dp, two-line 68dp; elevation level 3.
- `role="status"` announces politely to screen readers.
- The dismiss button aria-label is customizable via `labels.dismiss`
  (default "Dismiss").
- `SnackbarWrapper` portals to `document.body`, so it always paints above app
  content no matter where it is mounted — a positioned, z-indexed ancestor
  can't trap it in a lower stacking context. It renders only on the client
  (SSR-safe).
