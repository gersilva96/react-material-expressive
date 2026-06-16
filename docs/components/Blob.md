# Blob

Decorative blurred blob with organic border-radius morphing
(`animate-blob`, 10s loop). Token-colored (`bg-primary/10` by default) and
non-interactive.

## Import

```tsx
import {Blob} from "react-material-expressive";
```

## API

```ts
interface BlobProps {
  children?: ReactNode;
  className?: string;
  color?: string; // background class, e.g. "bg-tertiary/15"
  delay?: number; // ms phase offset into the loop, stagger multiple blobs
  height?: number; // default 300
  position?: string; // position classes (default centered)
  width?: number; // default 300
}
```

## Example

```tsx
<section className="relative overflow-hidden">
  <Blob color="bg-primary/15" position="top-10 left-1/4" />
  <Blob color="bg-tertiary/15" delay={3000} width={220} height={220} />
  <h1 className="relative z-10 text-display-small">Hero</h1>
</section>
```

## Gotchas

- Absolutely positioned: the parent needs `position: relative` and usually
  `overflow-hidden`.
- It's `aria-hidden` and `pointer-events-none` by design.
- `delay` is applied as a **negative** `animation-delay` (phase offset):
  staggered blobs morph from the first frame instead of sitting frozen as
  perfect circles until the delay elapses.
