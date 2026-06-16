# Stories

Horizontal scrollable story strip with two item types: `Stories.User`
(circular, ring/badges/live, name below) and `Stories.Business` (rounded
media with primary ring and start-aligned label). Media is injectable.

## Import

```tsx
import {Stories} from "react-material-expressive";
```

## API

```ts
interface StoriesProps {
  children: ReactNode;
  className?: string;
}

interface UserItemProps extends MediaInjectionProps {
  alt?: string;
  badge?: boolean;
  badgeColor?: string;
  badgeIcon?: ReactNode;
  badgeText?: string;
  className?: string;
  live?: boolean;
  liveColor?: string;
  liveIcon?: ReactNode;
  liveText?: string; // default "LIVE"
  name?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  radius?: number;
  size?: number; // default 64
  ring?: boolean; // animated token-gradient ring
  src?: string | StaticImageData;
}

interface BusinessItemProps extends MediaInjectionProps {
  alt?: string;
  className?: string;
  height?: number;
  width?: number; // default 64
  onClick?: MouseEventHandler<HTMLDivElement>;
  radius?: number;
  ring?: boolean; // static primary ring
  src?: string | StaticImageData;
  text?: string;
}
```

## Example

```tsx
<Stories>
  <Stories.User name="Ada" ring src="/ada.jpg" />
  <Stories.User live name="Grace" src="/grace.jpg" />
  <Stories.Business src="/brand.png" text="Coffee & Co" />
</Stories>
```

## Gotchas

- Pure presentation: wire `onClick` for your story viewer. `onClick` lands
  on a `<div>` (no button semantics) — wrap in a `<button>` for keyboard
  users, like `Avatar`.
- All imagery falls back per the media-injection contract (render > image
  > children > native `<img>`).
- `Stories.User`'s animated ring stops under `prefers-reduced-motion`;
  `Stories.Business`'s ring is static.
