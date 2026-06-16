# AvatarStack

Overlapping avatar row with a surface ring and a hover raise per avatar.
The hover raise (−2px + scale 1.05) runs on the M3E fast-spatial spring
(350ms `linear()` port) and lifts the hovered avatar above its neighbors.

## Import

```tsx
import {AvatarStack} from "react-material-expressive";
```

## API

```ts
interface AvatarStackItem {
  alt?: string;
  height?: number;
  width?: number;
  id: string; // stable key
  initials?: string; // fallback when no src
  src?: string | StaticImageData;
}

interface AvatarStackProps {
  avatars: AvatarStackItem[];
  className?: string;
  size?: number; // default 40
}
```

## Example

```tsx
<AvatarStack
  avatars={[
    {id: "1", src: "/a.jpg"},
    {id: "2", src: "/b.jpg"},
    {id: "3", initials: "+5"},
  ]}
  size={48}
/>
```

## Gotchas

- The ring color is `ring-surface`, so it blends with the page surface —
  place the stack over `bg-surface` (or recolor via `className`).
- `size` defaults to 40 (the M3 leading-avatar token); initials-only items
  render the Avatar fallback (`primary-container` + `title-medium`).
