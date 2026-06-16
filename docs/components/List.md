# List

M3 list: transparent container (inherits the surface it sits on) with
8dp vertical padding; item height follows the text-row count — **56dp**
one-line, **72dp** two-line, **88dp** three-line (overline + headline +
supporting; three-line items top-align their leading + text, the trailing
element stays centered). 16dp leading/trailing space, 12dp between elements.
Compose with `List.Item`. `variant` defaults to `"expressive"` (filled
`surface-container` tiles separated by a 2dp gap, with a container shape that
morphs on interaction (4 → 12 → 16dp) and 20px icons — recommended for new
designs); pass `variant="plain"` for the transparent, rectangular list with
24px icons, which M3E keeps available.

## Import

```tsx
import {List} from "react-material-expressive";
```

## API

```ts
interface ListProps extends ComponentProps<"ul"> {
  variant?: "expressive" | "plain"; // default "expressive"
}

interface ListItemProps {
  body?: ReactNode; // supporting text → 72dp item
  children?: ReactNode; // custom content replacing the text block
  className?: string;
  disabled?: boolean;
  headline?: ReactNode; // body-large
  href?: string; // renders a native <a>
  label?: ReactNode; // overline (label-small)
  leftElement?: ReactNode; // 24px min box, on-surface-variant
  onClick?: MouseEventHandler<HTMLElement>;
  rightElement?: ReactNode;
  selected?: boolean; // secondary-container fill + on-secondary-container (visual)
  target?: string;
}
```

Interactive items (`href`/`onClick`) render `<a>`/`<button>` with an M3
state layer; static items render a plain row. `selected` is visual only
(secondary-container) — the consumer owns selection semantics, as with
`Menu.Item`.

## Example

```tsx
<List>
    <List.Item
        headline="Inbox"
        leftElement={<MaterialSymbol name="inbox" />}
        onClick={openInbox}
        rightElement={<span>24</span>}
    />
    <List.Item
        headline="Profile"
        body="Account settings"
        href="/profile"
        leftElement={<Avatar name="A" size={40} />}
    />
</List>

// Plain (transparent, rectangular) variant.
<List variant="plain">
    <List.Item
        headline="Inbox"
        leftElement={<MaterialSymbol name="inbox" />}
        onClick={openInbox}
    />
</List>
```

## Gotchas

- The container is transparent on purpose (M3) — it picks up the sheet,
  card or surface behind it.
- For dividers between items use `<Divider className="my-0" inset />`.
- The default is the **Expressive** variant (`variant="expressive"`): filled
  `surface-container` tiles with a shape that morphs on interaction
  (extra-small → medium → large) and 20px icons. The filled tiles read against
  a plain `surface` background; inside a `surface-container` set a different
  container via `className`. Pass `variant="plain"` for the M3 **plain** list
  (transparent, rectangular items, 24px icons), which M3E keeps fully
  supported.
