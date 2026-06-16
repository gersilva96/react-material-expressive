# Layers — Container / Section

Layout helpers. `Container` is a dotted showcase panel (token-based dot
grid, large shape) for presenting content over a neutral, theme-aware
background. `Section` is a responsive content band: column on small
screens, row on `lg+`.

## Import

```tsx
import {Container, Section} from "react-material-expressive";
```

## API

```ts
interface ContainerProps {
  children?: ReactNode;
  className?: string;
  padding?: string; // padding class override (default p-6)
}

interface SectionProps {
  children: ReactNode;
  className?: string;
}
```

## Example

```tsx
<Section>
  <Card>…</Card>
  <Container className="mx-0">
    <Button>Showcased</Button>
  </Container>
</Section>
```

## Gotchas

- The dot grid uses `--md-sys-color-outline-variant`, so it adapts to the
  active theme.
