# MediaFrame

Presentational frame for media: size/aspect/radius/overflow plus an
optional placeholder, on a surface-container-highest backdrop. Renders no
image of its own — pair it with `Img`, `Video` or any media node.

## Import

```tsx
import {MediaFrame} from "react-material-expressive";
```

## API

```ts
interface MediaFrameProps {
  aspect?: number | string;
  children?: ReactNode; // the media
  className?: string;
  height?: number | string;
  width?: number | string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  overflow?: boolean; // clip to shape (default true)
  placeholder?: ReactNode; // centered fallback
  radius?: number | string;
  size?: number | string;
  style?: CSSProperties;
}
```

## Example

```tsx
<MediaFrame
  aspect={16 / 9}
  radius={16}
  width={320}
  placeholder={<MaterialSymbol name="movie" size={32} />}>
  <Video className="absolute inset-0 size-full" src="/clip.mp4" />
</MediaFrame>
```

## Gotchas

- Children should usually be absolutely positioned (`absolute inset-0
size-full`) to fill the frame.
