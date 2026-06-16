# Dialog

M3 modal dialog: shape extra-large (28), 280–560dp wide,
surface-container-high container, 32% scrim, elevation 3. Mounts/unmounts
with fade enter/exit animations and locks body scroll while open.

## Import

```tsx
import {Dialog} from "react-material-expressive";
```

## API

```ts
interface DialogProps {
    children?: ReactNode;
    className?: string;
    dismissable?: boolean;   // scrim click + Escape close (default true)
    isVisible: boolean;
    onClose: () => void;
}

// Sub-parts
Dialog.Header: {headline?: ReactNode; icon?: ReactNode; text?: ReactNode; className?}
Dialog.Body:   ComponentProps<"div">  // body-medium, on-surface-variant
Dialog.Footer: ComponentProps<"div">  // right-aligned action row
```

`Dialog.Header` renders an optional 24px hero icon (secondary color, which
centers the header per M3), an `headline-small` headline and
`body-medium` supporting text. The headline also gives the dialog its
accessible name: `Dialog` wires `aria-labelledby` to the `Dialog.Header`
headline through an internal context.

## Accessibility & keyboard

The panel is a `div` (not the native `<dialog>`), so it replicates
`showModal()` behaviour manually:

- `role="dialog"` + `aria-modal="true"`, named by the `Dialog.Header`
  headline via `aria-labelledby`. Provide a headline for an accessible
  name; if you compose a custom header instead, name it yourself.
- On open, focus moves into the dialog — to a child carrying the
  `autofocus` attribute if present, otherwise the panel itself — and is
  restored to the previously focused element on close.
- `Tab` / `Shift+Tab` are trapped inside the panel and wrap around.
- `Escape` closes the dialog when `dismissable` (default), same as a
  scrim click.

## Example

```tsx
const [open, setOpen] = useState(false);

<Dialog isVisible={open} onClose={() => setOpen(false)}>
  <Dialog.Header
    headline="Reset settings?"
    icon={<MaterialSymbol name="restart_alt" />}
    text="This cannot be undone."
  />
  <Dialog.Footer>
    <Button variant="text" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button variant="text" onClick={confirm}>
      Accept
    </Button>
  </Dialog.Footer>
</Dialog>;
```

## Gotchas

- Controlled-only: there is no internal open state.
- The exit animation runs 150ms after `isVisible` goes false; the
  component stays mounted until it finishes (`useDismissable`).
- Long content scrolls inside the panel as a whole (max-height
  100vh − 48). This is the only modeled variant: there are no per-section
  scroll dividers, no full-screen dialog and no `alertdialog` type — the
  M3 spec lists those as optional/separate, and the basic dialog is
  faithful to it value-for-value (verified 2026-06-12 against
  m3.material.io and @material/web).
