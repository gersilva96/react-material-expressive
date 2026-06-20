# SplitButton

M3 Expressive split button: a leading action button plus a trailing menu
button separated by a 2dp gap. Outer corners are full; the inner corners
morph on hover/focus/press (4/4/4/8/12dp at rest → 8/12/12/20/20dp per
size). While the menu is open the trailing button rounds to full, centers
its caret (rotated 180°) and keeps a pressed-opacity state layer — the
container colors never change on selection (spec). Colors, state layers,
elevation and disabled states are the standard button ones, so themes
apply via the same tokens.

## Import

```tsx
import {SplitButton} from "react-material-expressive";
```

## API

```ts
interface SplitButtonProps {
  children?: ReactNode; // leading button label
  className?: string;
  disabled?: boolean; // disables both buttons
  iconLeft?: ReactNode; // leading icon (sized per size like Button)
  labels?: SplitButtonLabels; // trailing menu aria-label
  menu?: ReactNode; // SplitButton.Item list (anchored bottom right)
  menuClassName?: string;
  onClick?: MouseEventHandler; // leading button action
  size?: "xs" | "s" | "m" | "l" | "xl"; // default "s" (40dp)
  text?: string; // label fallback when no children
  variant?: "elevated" | "filled" | "tonal" | "outlined"; // default "filled"
}

interface SplitButtonLabels {
  menu?: string; // trailing button aria-label (default "More options")
}
```

The menu is the shared M3E vertical [`Menu`](Menu.md) (corner-large surface,
`surface-container-low`, elevation 3) anchored to the trailing button's
bottom-right; focus returns to that button when it closes. `SplitButton.Item`
is the shared `Menu.Item` (same as `OverflowMenu.Item`). The menu renders in a
portal on `document.body` (fixed-positioned), so it escapes `overflow`
ancestors and auto-flips above the button when there's no room below.

## Sizes

Heights match the Expressive button sizes (32/40/56/96/136). The trailing
button uses the spec menu icon (22/22/26/38/50dp) with the optical offset
(−1/−1/−2/−3/−6dp) that disappears when open. Both buttons keep the
Compose 48dp minimum width — it only shows on an icon-only XS leading
button (which would otherwise be 42dp wide).

## Example

```tsx
<SplitButton
  iconLeft={<MaterialSymbol name="send" size={20} />}
  onClick={send}
  text="Send"
  menu={
    <>
      <SplitButton.Item label="Schedule send" onClick={schedule} />
      <SplitButton.Item label="Save draft" onClick={saveDraft} />
    </>
  }
/>
```

## Gotchas

- The leading button never opens the menu — only the trailing one does
  (clicks on items close it; Escape and outside clicks too).
- There is no `text` color variant: the spec only defines elevated,
  filled, tonal and outlined.
- **BREAKING:** `menuLabel` was replaced by `labels={{menu}}`.
