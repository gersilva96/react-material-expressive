# TabsPrimary / TabsSecondary

M3 tabs with `title-small` labels and proper a11y roles. Primary: 48dp
container (64 with 24px icons) and a 3px content-width indicator (inset 2dp
each side, min length 24dp, fully-rounded top corners). Secondary: 48dp with
inline 24px icons and a 2px full-width indicator. Active label/icon is
`primary` (primary) / `on-surface` (secondary); inactive is
`on-surface-variant` and darkens to `on-surface` on hover/focus. The
indicator slides between tabs with the default-spatial spring (FLIP).
Controllable; each tab may carry panel `content`.

## Import

```tsx
import {TabsPrimary, TabsSecondary} from "react-material-expressive";
```

## API

```ts
interface TabItem {
  content?: ReactNode; // panel rendered below when selected
  disabled?: boolean;
  header?: ReactNode;
  icon?: ReactNode;
  id: string;
}

interface TabsPrimaryProps {
  className?: string;
  defaultSelected?: string; // falls back to the first tab
  onChange?: (id: string) => void;
  panelClassName?: string;
  selected?: string; // controlled
  tabs: TabItem[];
}
// TabsSecondaryProps: identical
```

## Example

```tsx
<TabsPrimary
  onChange={setSection}
  tabs={[
    {
      content: <Flights />,
      header: "Flights",
      icon: <MaterialSymbol name="flight" />,
      id: "f",
    },
    {
      content: <Hotels />,
      header: "Hotels",
      icon: <MaterialSymbol name="hotel" />,
      id: "h",
    },
  ]}
/>
```

## Gotchas

- Omit `content` to use the tabs as pure navigation and render panels
  yourself (wire `onChange`).
- Primary's indicator hugs the icon+label width per M3 (it sits inside the
  content wrapper).
