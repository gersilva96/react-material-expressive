# Badge / DotBadge / OnIconBadge

M3 badges: full shape on the error container. `Badge` is the large badge
(min 16px, `label-small` count), `DotBadge` the 6px small badge,
`OnIconBadge` a count badge pre-positioned on an icon's top-right corner.

## Import

```tsx
import {Badge, DotBadge, OnIconBadge} from "react-material-expressive";
```

## API

```ts
interface BadgeProps extends ComponentProps<"div"> {
  icon?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode; // 12px boxes
  text?: ReactNode; // content fallback when no children
}
type DotBadgeProps = ComponentProps<"div">;
interface OnIconBadgeProps extends ComponentProps<"div"> {
  count?: ReactNode;
}
```

## Examples

```tsx
<Badge text="3" />
<Badge className="bg-tertiary text-on-tertiary" text="new" /> // recolor via className

<span className="relative inline-flex">
    <MaterialSymbol name="notifications" size={32} />
    <OnIconBadge count="12" />
</span>
```

## Gotchas

- `OnIconBadge` positions absolutely — the icon wrapper needs
  `position: relative`.
- `OnIconBadge` follows the M3 placement spec (14×12dp from the icon's
  top-trailing corner): top −2, leading edge fixed 12px from the trailing
  edge, growing outward (trailing) with the count.
- Keep counts short ("999+" — the spec caps the badge at 4 characters /
  16×34dp); the badge grows with content.
- Dot on an icon goes flush in the corner (`top-0 right-0`), per the
  spec's 6×6dp corner measurement.
