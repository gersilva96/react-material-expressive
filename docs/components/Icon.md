# Icon

Icon slot helper: wraps each provided node in a fixed square box (default
24px, `shrink-0`, centered, `leading-none`) so arbitrary icons align with
adjacent text. Used internally by buttons/menus; useful for custom rows.

## Import

```tsx
import {Icon} from "react-material-expressive";
```

## API

```ts
interface IconProps {
  className?: string;
  icon?: ReactNode; // standalone slot
  iconLeft?: ReactNode; // leading slot
  iconRight?: ReactNode; // trailing slot
  size?: number; // box px, default 24
}
```

## Example

```tsx
<span className="flex items-center gap-2 text-body-large">
  <Icon iconLeft={<MaterialSymbol name="event" />} />
  Aligned with text
</span>
```

## Gotchas

- The box fixes ALIGNMENT; size the glyph itself via the icon you pass.
