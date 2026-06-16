# ButtonGroup

M3 Expressive standard button group: an invisible container that spaces
its buttons per size (18/12/8/8/8dp — wider on small sizes to preserve
48dp touch targets) and adds the press interaction between them: the
pressed button widens while its direct neighbors compress, animated by
the shared 200ms emphasized morph (web approximation of the Compose
~15% width spring).

## Import

```tsx
import {ButtonGroup} from "react-material-expressive";
```

## API

```ts
interface ButtonGroupProps {
  children?: ReactNode; // Buttons / IconButtons with the same `size`
  className?: string;
  label?: string; // aria-label for the group
  size?: "xs" | "s" | "m" | "l" | "xl"; // default "s"
}
```

## Example

```tsx
<ButtonGroup label="Playback controls" size="s">
  <Button size="s" text="Back" variant="tonal" />
  <Button size="s" text="Pause" variant="filled" />
  <Button size="s" text="Next" variant="tonal" />
</ButtonGroup>
```

## Gotchas

- Pass the same `size` to the group and every button inside — the press
  width-morph assumes the size's symmetric padding.
- Per spec, avoid text buttons and standard icon buttons inside groups
  (they have no container treatment). Use filled/tonal/outlined/elevated.
- The width morph applies to label `Button`s (padding-driven width); icon
  buttons keep their fixed square size.
- The group has no colors of its own — theming comes entirely from the
  buttons' tokens.
