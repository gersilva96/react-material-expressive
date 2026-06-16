# TopAppBar

M3 top app bar container with the variants as sub-parts:
`TopAppBar.Small` / `.Center` (64dp, `title-large`), `.Medium` and
`.Large`. The container is `surface` (swap to `surface-container` on
scroll); bar padding is 4dp. Every variant takes an optional `subtitle`
(rendered under the title).

`.Medium` and `.Large` render the **M3 Expressive flexible** variants:
Medium is `headline-medium` (112dp, 136dp with a subtitle), Large is
`display-small` (120dp, 152dp with a subtitle). `.Center` is the small bar
with centered title text (M3E merged center-aligned into small).

> **M3 Expressive note** — flexible is the only Medium/Large variant. The
> baseline Medium/Large bars were removed because M3E marks them "no longer
> recommended".

## Import

```tsx
import {TopAppBar} from "react-material-expressive";
```

## API

```ts
type TopAppBarProps = ComponentProps<"header">; // bg-surface by default

// Small / Center
interface AppBarRowProps {
  children?: ReactNode; // title fallback
  className?: string;
  leftElement?: ReactNode; // nav icon
  rightElement?: ReactNode; // action icons
  subtitle?: ReactNode; // label-medium, under the title
  title?: ReactNode;
}

// Medium / Large (flexible only)
interface CollapsingAppBarProps {
  children?: ReactNode; // title fallback
  className?: string;
  leftElement?: ReactNode; // nav icon
  rightElement?: ReactNode; // action icons
  subtitle?: ReactNode; // medium label-large / large title-medium
  title?: ReactNode;
}
```

## Example

```tsx
<TopAppBar>
  <TopAppBar.Small
    leftElement={
      <IconButton
        aria-label="Menu"
        icon={<MaterialSymbol name="menu" />}
        variant="standard"
      />
    }
    rightElement={
      <IconButton
        aria-label="More"
        icon={<MaterialSymbol name="more_vert" />}
        variant="standard"
      />
    }
    title="Page title"
  />
</TopAppBar>
```

## Gotchas

- On-scroll surface change is the consumer's call: toggle
  `className="bg-surface-container shadow-mm-2"` when `scrollY > 0` (the M3
  on-scroll color + elevation level 2). The collapse-on-scroll motion
  (height shrink + title resize) is not built in.
- `Center` keeps the title optically centered by reserving symmetric side
  slots — pass compact elements (icon buttons / avatar).
- Leading/trailing icon colors come from the `IconButton`s you pass; M3's
  leading-`on-surface` / trailing-`on-surface-variant` split is yours to
  set if you need it.
