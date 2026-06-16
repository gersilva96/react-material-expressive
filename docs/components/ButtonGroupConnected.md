# ButtonGroupConnected

M3 Expressive connected button group: buttons joined by 2dp gaps where
the group controls the corners. Outer edges keep the group shape — full
(round) or the per-size square value (4/8/8/16/20dp) — while inner
corners stay small (8/8/8/16/20dp), sharpen while pressed (4/4/4/12/16dp)
and round to full when a toggle button is selected. Unlike the standard
`ButtonGroup` there is no interaction between neighbors. It is the
M3 Expressive successor of the segmented buttons.

## Import

```tsx
import {ButtonGroupConnected} from "react-material-expressive";
```

## API

```ts
interface ButtonGroupConnectedProps {
  children?: ReactNode; // Buttons / IconButtons with the same `size`
  className?: string;
  label?: string; // aria-label for the group
  shape?: "round" | "square"; // outer corners (default "round")
  size?: "xs" | "s" | "m" | "l" | "xl"; // default "s"
}
```

## Selection

The group reads selection from the children's `aria-pressed` — toggle
`IconButton`s (`selected`) work out of the box; manage single or
multi-select state in your app. The selected button rounds to full and
its colors follow the button toggle specs.

## Example

```tsx
const [active, setActive] = useState(0);

<ButtonGroupConnected label="Transport mode">
  {modes.map((mode, index) => (
    <IconButton
      icon={<MaterialSymbol name={mode.icon} size={24} />}
      key={mode.id}
      onClick={() => setActive(index)}
      selected={active === index}
      size="s"
      variant="tonal"
    />
  ))}
</ButtonGroupConnected>;
```

## Gotchas

- Pass the same `size` to the group and every button inside.
- The group corner system overrides the children's own shape (including
  their standalone pressed morphs) on purpose — it must, per spec.
- XS/S groups enforce a 48dp minimum button width for touch targets.
- The group has no colors of its own — theming comes entirely from the
  buttons' tokens.
