# Img

MediaFrame + image: renders a native `<img>` (object-fit, hides on error
so the placeholder shows) or your injected media. Accepts
`string | StaticImageData` sources.

## Import

```tsx
import {Img} from "react-material-expressive";
```

## API

```ts
interface ImgProps extends MediaInjectionProps {
  // children | image | render
  alt?: string;
  aspect?: number | string; // e.g. 16/9
  className?: string;
  height?: number | string;
  width?: number | string;
  objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down"; // default cover
  onClick?: MouseEventHandler<HTMLDivElement>;
  placeholder?: ReactNode; // shown with no media or on error
  radius?: number | string; // px or CSS value
  size?: number | string; // width = height shorthand
  src?: string | StaticImageData;
  style?: CSSProperties;
}
```

Injection priority: `render({src, alt, className, style})` > `image` >
`children` > native `<img>`.

## Examples

```tsx
<Img alt="Cover" aspect={16 / 9} radius={16} src="/cover.jpg" width={320} />
<Img alt="Broken" placeholder={<MaterialSymbol name="broken_image" />} size={140} src={maybeUrl} />

// Next.js injection
<Img aspect={1} size={140} src={photo} render={({src, alt, className, style}) => (
    <Image alt={alt} className={className} fill src={src!} style={style} />
)} />
```

## Gotchas

- The frame paints `surface-container-highest` behind the media — visible
  while loading and on error.
- `radius` accepts CSS strings (e.g. `"var(--md-sys-shape-corner-large)"`).
