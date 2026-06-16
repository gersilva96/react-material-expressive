# PerspectiveImage / PerspectiveCard

3D tilt showcases. `PerspectiveImage` follows the cursor anywhere on the
page (hero/parallax); `PerspectiveCard` tilts only while hovered and
resets on leave. Pointer-only — static on touch devices, and the tilt is
suppressed under `prefers-reduced-motion` (the effect is purely
decorative).

## Import

```tsx
import {
  PerspectiveCard,
  PerspectiveImage,
} from "react-material-expressive";
```

## API

```ts
interface PerspectiveImageProps {
  children?: ReactNode;
  className?: string;
  intensity?: number; // deg per cursor px (default 0.03)
  perspective?: number; // px (default 800)
}
// PerspectiveCardProps: same (intensity default 0.025)
```

## Example

```tsx
<PerspectiveCard>
    <Card variant="elevated">…</Card>
</PerspectiveCard>

<PerspectiveImage intensity={0.02}>
    <div className="w-fit"><Img alt="" size={280} src={art} /></div>
</PerspectiveImage>
```

## Gotchas

- The transform applies to the wrapper — keep it `w-fit` so the rotation
  pivots on the content, not a full-width row.
