# Video

Native looping video for ambient/media content: `autoPlay`, `muted`,
`loop` and `playsInline` are on by default (override via props),
object-fit cover. The autoplay is decorative motion, so it pauses under
`prefers-reduced-motion: reduce`.

## Import

```tsx
import {Video} from "react-material-expressive";
```

## API

```ts
type VideoProps = ComponentProps<"video">;
```

## Example

```tsx
<Video
  className="aspect-video w-full rounded-large"
  poster="/poster.jpg"
  src="/clip.mp4"
/>
```

## Gotchas

- Muted autoplay is required by browsers; unmute only on user gesture.
- Autoplay pauses when the user prefers reduced motion (WCAG 2.2.2). Pass
  `controls` if you also want an explicit play/pause affordance.
- Combine with `MediaFrame` for framed/clipped placements.
