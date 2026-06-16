# OverflowMenu

M3 contextual menu anchored to a corner of its trigger (default
bottom-right): shape extra-small (4), surface-container, elevation 2, 48dp items
with optional badges.

## Import

```tsx
import {OverflowMenu} from "react-material-expressive";
```

## API

```ts
interface OverflowMenuProps {
  bottomLeft?: boolean;
  bottomRight?: boolean;
  topLeft?: boolean;
  topRight?: boolean;
  children?: ReactNode; // trigger (usually an IconButton)
  className?: string;
  menu?: ReactNode; // OverflowMenu.Item list
  menuClassName?: string;
}

interface OverflowMenuItemProps {
  badge?: boolean;
  badgeText?: string;
  children?;
  className?;
  disabled?: boolean;
  label?: ReactNode;
  leftElement?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  rightElement?: ReactNode;
}
```

## Example

```tsx
<OverflowMenu
  bottomRight
  menu={
    <>
      <OverflowMenu.Item
        label="Share"
        leftElement={<MaterialSymbol name="share" />}
      />
      <OverflowMenu.Item badge badgeText="2" label="Comments" />
    </>
  }>
  <IconButton
    aria-label="More"
    icon={<MaterialSymbol name="more_vert" />}
    variant="standard"
  />
</OverflowMenu>
```

## Gotchas

- Position flags are booleans; with none set it falls back to bottomRight.
- Closes on outside click, item click and Escape.
