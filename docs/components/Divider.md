# Divider

M3 divider: a 1px rule in `outline-variant` (decorative — per M3 never use
`outline` for dividers).

## Import

```tsx
import {Divider} from "react-material-expressive";
```

## API

```ts
interface DividerProps extends ComponentProps<"hr"> {
  // M3 inset dividers (16dp). Omit for a full-width rule.
  inset?: "start" | "middle" | "end";
}
```

`inset` mirrors the M3 spec's named insets:

| Value      | M3 name      | Leading / trailing          |
| ---------- | ------------ | --------------------------- |
| (omitted)  | full-width   | 0 / 0 (100%)                |
| `"start"`  | inset        | 16dp / 0 (the list divider) |
| `"middle"` | middle-inset | 16dp / 16dp                 |
| `"end"`    | —            | 0 / 16dp (RTL-symmetric)    |

Margins are logical (`ms`/`me`), so the inset follows the writing
direction.

## Examples

```tsx
<Divider />
<Divider inset="start" />        // list divider (leading 16dp)
<Divider inset="middle" />       // middle-inset (16dp both)
<Divider className="my-2" />     // tighter spacing
```

## Gotchas

- Renders an `<hr>` (1px `outline-variant`); default vertical margin is
  16dp (`my-4`) — override with `className` for context-specific spacing.
- Horizontal only. M3's web spec and @material/web don't define a vertical
  divider (it exists only in Compose as `VerticalDivider`); for a vertical
  rule use a `1px`-wide `bg-outline-variant` element directly.
