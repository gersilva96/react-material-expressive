# Tooltip

M3 tooltips shown on hover/focus of the wrapped trigger, animating in with
a fade + scale (0.8→1) on the fast-spatial spring. Plain: shape extra-small
on inverse-surface with `body-small` text. Rich: shape medium on
surface-container (elevation 2, max 320dp wide) with optional `title-small`
subhead and an action slot.

## Import

```tsx
import {Tooltip} from "react-material-expressive";
```

## API

```ts
interface TooltipProps {
  action?: ReactNode; // rich only (e.g. <Button variant="text">)
  bottomLeft?: boolean;
  bottomRight?: boolean;
  topLeft?: boolean;
  topRight?: boolean; // default bottomLeft
  children?: ReactNode; // trigger
  className?: string;
  text?: ReactNode;
  title?: ReactNode; // rich subhead
  variant?: "plain" | "rich"; // default "plain"
}
```

## Examples

```tsx
<Tooltip text="Save to favorites" topLeft>
    <IconButton aria-label="Favorite" icon={<MaterialSymbol name="favorite" />} variant="standard" />
</Tooltip>

<Tooltip variant="rich" title="Rich tooltip" text="Longer supporting copy"
         action={<Button variant="text">Learn more</Button>} bottomRight>
    <IconButton aria-label="Info" icon={<MaterialSymbol name="info" />} variant="standard" />
</Tooltip>
```

## Gotchas

- Display is pure CSS (hover/focus-within) with a 150ms appearance delay,
  animating fade + scale 0.8→1 from center on the fast-spatial spring (the
  same FadeInFadeOutWithScale choreography as the Snackbar); hide is
  immediate. Hover is gated under `@media (hover: hover)` so a touch tap
  doesn't leave it stuck open. Rich tooltips become interactive
  (`pointer-events`) while shown so the action is clickable.
- Keep the trigger inside the wrapper — the tooltip positions against it.

## Accessibility

- The tooltip container is `role="tooltip"` with a generated `id`. When the
  trigger is a single element, the library merges that id into the trigger's
  `aria-describedby`, so the supporting text is announced when the trigger is
  focused (the WAI-ARIA tooltip pattern). Any `aria-describedby` you already
  set on the trigger is preserved.
- Give the trigger its own accessible name (e.g. `aria-label` on an icon-only
  `IconButton`) — the tooltip describes the control, it does not name it.
