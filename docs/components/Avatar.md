# Avatar

Circular (or custom-radius) avatar with initials/placeholder fallback,
optional badges and an animated token-gradient ring. Media is injectable —
no proprietary Image component.

The initials/placeholder fallback follows the M3 avatar token set
(`md.comp.list.list-item.leading-avatar`): `primary-container` container
with `on-primary-container` `title-medium` initials, 40dp, corner-full.

## Import

```tsx
import {Avatar} from "react-material-expressive";
```

## API

```ts
interface AvatarProps extends MediaInjectionProps {
  // children | image | render
  alt?: string;
  badge?: boolean;
  badgeColor?: string;
  badgeIcon?: ReactNode;
  badgeText?: string;
  className?: string;
  dotBadge?: boolean;
  height?: number;
  width?: number;
  size?: number; // default 40
  name?: string; // initials fallback
  onClick?: MouseEventHandler<HTMLDivElement>;
  placeholder?: ReactNode; // fallback when no image nor name
  radius?: number; // default 9999 (circle)
  ring?: boolean; // animated decorative ring
  smallBadge?: boolean; // OnIconBadge overlay
  src?: string | StaticImageData;
}
```

Media priority: `render({src, alt, className, style})` > `image` >
`children` > native `<img>` (object-fit cover, hides on error so the
initials/placeholder show).

## Examples

```tsx
<Avatar alt="Ada" src="/ada.jpg" />
<Avatar name="AL" size={56} />
<Avatar src={photo} dotBadge ring />

// Framework image injection (e.g. Next.js)
<Avatar src={photo} render={({src, alt, className, style}) => (
    <Image alt={alt} className={className} fill src={src!} style={style} />
)} />
```

## Gotchas

- `badgeColor` is a class override (e.g. `"bg-tertiary text-on-tertiary"`).
- With `width`/`height` unequal, `radius` still applies to both corners.
- The initials don't scale with `size` (M3 only defines the 40dp avatar);
  recolor/resize via `className` if you need a denser fallback.
- The decorative `ring` is a 2px token conic gradient
  (`primary → tertiary → primary`) spinning at 5s/turn (linear).
- `onClick` is a convenience on a plain `<div>` — it adds no button
  semantics. Wrap the avatar in a `<button>`/`<a>` when it must be
  focusable and keyboard-activatable.
