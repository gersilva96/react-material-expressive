# Dropdown

Trigger + anchor for the shared M3E vertical [Menu](Menu.md): it positions
the menu below the trigger and owns the open state (toggles on trigger
click, closes on outside click, item activation or Escape, and returns
focus to the trigger). All the menu visuals and keyboard come from `Menu`,
so `Dropdown.Item` is an alias of `Menu.Item` and you can also use
`Menu.Label` / `Menu.Divider` and the `selected` / `badge` item props.
Standard (surface-based) by default or `vibrant` (tertiary-based).

## Import

```tsx
import {Dropdown} from "react-material-expressive";
```

## API

```ts
interface DropdownProps {
  apart?: boolean; // detach the menu with a 4dp gap
  children: ReactNode; // trigger
  className?: string;
  menu?: ReactNode; // Dropdown.Item list
  menuClassName?: string;
  vibrant?: boolean; // tertiary-based scheme instead of standard
}

interface DropdownItemProps {
  children?;
  className?;
  disabled?: boolean;
  label?: ReactNode;
  leftElement?: ReactNode; // 20px box (use icon size 20)
  onClick?: MouseEventHandler<HTMLButtonElement>;
  rightElement?: ReactNode; // trailing meta (body-small)
}
```

## Example

```tsx
<Dropdown
  menu={
    <>
      <Dropdown.Item
        label="Profile"
        leftElement={<MaterialSymbol name="person" size={20} />}
      />
      <Dropdown.Item
        label="Settings"
        rightElement="⌘S"
        onClick={openSettings}
      />
    </>
  }>
  <Button iconRight={<MaterialSymbol name="expand_more" size={18} />}>
    Open
  </Button>
</Dropdown>
```

## Gotchas

- The whole wrapper toggles on click, so clicking an item also closes the
  menu (select-like behavior).
- The menu is content-width, clamped to the M3 spec's 112–280dp range
  (`w-max min-w-[112px] max-w-[280px]`); use `apart` for a detached look.
- Icons are 20dp in the vertical menu — pass `size={20}` to `MaterialSymbol`
  so the glyph fills its box (the default is 24).
- The first and last items round their outer corners (top / bottom) to
  corner-medium so they sit concentric with the menu's corner-large and
  don't read as a square cut against the rounded container; the inner
  corners stay extra-small.
- The expressive shape-morph (corners growing on the active state) only
  applies to submenu parents; this flat menu keeps the extra-small corner
  and shows hover/focus/pressed through the state layer.
- For corner positioning use `OverflowMenu` instead (still the baseline
  square menu — not yet migrated to the vertical menu).
