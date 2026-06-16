# FABMenu

M3 Expressive FAB menu: a 56dp FAB that morphs into a fully-round close
button — radius, container color (container → solid set color) and the
icon crossfade ride one fast-spatial spring, like Compose's
`ToggleFloatingActionButton` — revealing up to six menu-item pills above
it, right-aligned and staggered bottom-up (8dp gap to the FAB, 4dp
between items). Each pill reveals by width from its trailing edge
(fast-spatial spring) while fading in on a quicker track, and closing
runs the same springs in reverse, top-down — the Compose
`FloatingActionButtonMenu` choreography. Items use the medium button
metrics (height 56, `title-medium`, icon 24, paddings 24, level 3
shadow) on the set's container color (`md.comp.fab-menu` tokens).

## Import

```tsx
import {FABMenu} from "react-material-expressive";
```

## API

```ts
interface FABMenuProps {
  children?: ReactNode; // FABMenu.Item list (2–6 items per spec)
  className?: string;
  icon?: ReactNode; // FAB icon while closed (24px box)
  labels?: FABMenuLabels; // trigger aria-labels
  variant?: "primary" | "secondary" | "tertiary"; // color set
}

interface FABMenuLabels {
  open?: string; // trigger aria-label while closed (default "Open menu")
  close?: string; // trigger aria-label while open (default "Close menu")
}

interface FABMenuItemProps {
  className?: string;
  icon?: ReactNode; // 24px box
  label?: ReactNode;
  onClick?: MouseEventHandler;
}
```

## Example

```tsx
<FABMenu
  icon={<MaterialSymbol name="add" size={24} />}
  labels={{open: "Create"}}>
  <FABMenu.Item
    icon={<MaterialSymbol name="edit" size={24} />}
    label="Compose"
    onClick={compose}
  />
  <FABMenu.Item
    icon={<MaterialSymbol name="group" size={24} />}
    label="New group"
    onClick={newGroup}
  />
</FABMenu>
```

## Gotchas

- Position the wrapper yourself — per spec the FAB sits with 16dp margins
  (e.g. `className="fixed right-4 bottom-4"`); the menu opens upward from
  the FAB's top trailing edge.
- Item clicks close the menu (so do Escape and outside clicks); run your
  action in the item `onClick`.
- The spec recommends 2–6 items.
- Colors resolve through the `--md-sys-color-*` tokens of the chosen set,
  so themes apply automatically.
- **BREAKING:** the `label` prop was replaced by `labels={{open, close}}`
  (the open-state aria-label, previously hardcoded "Close menu", is now
  `labels.close`).
