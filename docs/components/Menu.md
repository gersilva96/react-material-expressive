# Menu

The M3 Expressive **vertical menu** surface and behaviour, used as the
shared primitive behind the anchored menus (`Dropdown`, and — as they
migrate — `OverflowMenu` / `ToggleThemeMenu`). It is **anchorless**: the
host positions and mounts it; `Menu` owns the surface, the reveal
animation and the WAI-ARIA menu keyboard.

Backs `Dropdown`, `OverflowMenu`, `ToggleThemeMenu` and the `SplitButton`
menu (thin trigger/anchor adapters over this primitive).

Covered: surface, items (`selected`, `badge`, leading/trailing slots),
group surfaces (`Menu.Group` — the "with gap" grouping), section labels
(`Menu.Label`), dividers (`Menu.Divider`), **submenus (`Menu.Sub`)**, the
standard + vibrant schemes and the full menu keyboard. Accepted gap: a
2-line supporting-text item (not a kit building block — use the item
content).

## Import

```tsx
import {Menu} from "react-material-expressive";
```

## API

```ts
interface MenuProps {
  children?: ReactNode; // Menu.Item list
  className?: string; // host positioning
  exiting?: boolean; // true while the close animation plays
  onClose?: () => void; // items call it on activation; Escape/Tab too
  up?: boolean; // reveal upward (anchored above the trigger)
  vibrant?: boolean; // tertiary-based scheme instead of standard
}

interface MenuItemProps {
  badge?: boolean | string; // trailing error badge (string = count/label)
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  keepOpen?: boolean; // don't close the menu on activation
  label?: ReactNode;
  leftElement?: ReactNode; // 20px leading box (use icon size 20)
  onClick?: MouseEventHandler<HTMLButtonElement>;
  rightElement?: ReactNode; // trailing shortcut text (label-large) or 20px icon
  selected?: boolean; // tertiary-container fill + corner-medium
}

interface MenuGroupProps {
  children?: ReactNode; // Menu.Item list (and nested Menu.Sub)
  className?: string;
}

interface MenuLabelProps {
  children?: ReactNode; // section label text (label-large)
  className?: string;
  leftElement?: ReactNode; // optional 20px leading icon
}

interface MenuDividerProps {
  className?: string;
}

interface MenuSubProps {
  children?: ReactNode; // submenu content (Menu.Item / nested Menu.Sub)
  className?: string;
  disabled?: boolean;
  label?: ReactNode;
  leftElement?: ReactNode; // 20px leading box
}
```

`Menu.Sub` opens a nested menu to the side (rendered in a portal so it
escapes the surface clip): on hover, Right/Enter, or click; closes on
Left/Escape (focus returns to the trigger). A leaf activation anywhere
dismisses the whole chain. The trigger keeps the on-surface state layer
while open (the M3E active state) and shows a trailing chevron.

Group items two ways — the M3 menu anatomy lists both "Gap" and "Divider"
as optional parts:

- **With a gap** — wrap each cluster in `Menu.Group`. Each group renders as
  its own surface (corner-large, its own elevation) and the menu stacks them
  with a 2dp gap. First/last items round against their own group's corner.
- **With a divider / label** — interleave `Menu.Divider` (1px
  `outline-variant`, inset) and `Menu.Label` (section header, 32 tall,
  `on-surface-variant` / `on-tertiary-container`) as flat children of
  `Menu`, separating groups within a single surface.

Either way the keyboard treats the whole menu as one list (arrows move
across groups).

## Anatomy & behaviour

- Container: corner-large (16), `surface-container-low` (standard) or
  `tertiary-container` (`vibrant`), elevation 3, width clamped 112–280dp.
  With `Menu.Group` children the container is instead a transparent stack:
  each group is its own surface (same tokens) and they sit 2dp apart.
- Item: 48 tall, inset state layer (corner extra-small) with `label-large`,
  20dp leading/trailing icons, 12dp padding. First/last items round their
  outer corner to corner-medium (concentric with the container); `selected`
  morphs the state layer to corner-medium with a tertiary fill.
- Keyboard (WAI-ARIA menu): on open the menu **surface** is focused, so no
  item is pre-highlighted and the first ArrowDown/ArrowUp lands on the
  first/last item; thereafter ArrowUp/Down move between enabled items
  (wrapping, across groups), Home/End jump, printable keys typeahead
  (matched against the item's **label** only — leading icons and trailing
  shortcuts are ignored), Escape closes. (A submenu opened by keyboard
  instead focuses its first item, per the WAI-ARIA submenu pattern.) Items
  are `role="menuitem"` with roving `tabindex`, so they are **not** in the
  Tab order on purpose — Tab moves focus out of the menu; use the arrow keys
  to move between items.

## Example

```tsx
<Menu onClose={close}>
  <Menu.Item
    label="Profile"
    leftElement={<MaterialSymbol name="person" size={20} />}
  />
  <Menu.Item label="Settings" selected onClick={openSettings} />
  <Menu.Item disabled label="Workspace" />
</Menu>
```

Grouped with a gap (separate surfaces):

```tsx
<Menu onClose={close}>
  <Menu.Group>
    <Menu.Item label="Italic" />
    <Menu.Item label="Bold" selected />
    <Menu.Item label="Underline" />
  </Menu.Group>
  <Menu.Group>
    <Menu.Item label="Cut" rightElement="⌘X" />
    <Menu.Item label="Copy" rightElement="⌘C" />
  </Menu.Group>
</Menu>
```

## Gotchas

- Anchorless: wrap it in a positioned element and control mount/unmount
  (e.g. via `useDismissable`) yourself, or use `Dropdown` which does this.
- `selected` is visual; for single-selection semantics in a picker, the
  consumer still owns the selected value.
