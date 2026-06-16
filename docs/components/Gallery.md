# Gallery

Stacked media gallery with 8dp gaps; compose rows with `Gallery.Row` and
size each media by width fractions.

## Import

```tsx
import {Gallery} from "react-material-expressive";
```

## API

```ts
type GalleryProps = ComponentProps<"div">;
type ImageRowProps = ComponentProps<"div">; // Gallery.Row
```

## Example

```tsx
<Gallery>
  <Gallery.Row>
    <Img alt="" aspect={21 / 9} className="w-full" radius={16} src={hero} />
  </Gallery.Row>
  <Gallery.Row>
    <Img alt="" aspect={1} className="w-1/2" radius={16} src={a} />
    <Img alt="" aspect={1} className="w-1/2" radius={16} src={b} />
  </Gallery.Row>
</Gallery>
```

## Gotchas

- Layout-only: pair with `Img`/`Video` or any media node.
