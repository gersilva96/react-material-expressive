# TextElement

Label / title / body text stack on the M3 type scale: overline
`label-medium` (on-surface-variant), title `title-medium` (on-surface),
body `body-medium` (on-surface-variant).

## Import

```tsx
import {TextElement} from "react-material-expressive";
```

## API

```ts
interface TextElementProps {
  as?: ElementType; // wrapper element (multi-slot only); default "div"
  body?: ReactNode;
  bodyAs?: ElementType; // body element; default "p"
  bodyStyle?: string; // class override
  className?: string;
  label?: ReactNode;
  labelAs?: ElementType; // label element; default "p"
  labelStyle?: string;
  title?: ReactNode;
  titleAs?: ElementType; // title element; default "h2"
  titleStyle?: string;
}
```

## Examples

```tsx
<TextElement label="OVERLINE" title="Headline" body="Supporting copy" />
<TextElement title="Bigger" titleStyle="text-headline-small" />

// A lone title as a page heading — renders a bare <h1>, no wrapper div:
<TextElement title="Page title" titleAs="h1" />
```

## Gotchas

- Each slot renders only when provided; `*Style` props are class strings
  merged with `cn`.
- **Element is polymorphic**: `labelAs`/`titleAs`/`bodyAs` (default p/h2/p) set
  the rendered tag while keeping the M3 typography. Choose the title's level by
  content hierarchy, not visual size (M3 a11y: don't force `<h2>` where the
  outline needs `<h1>`/`<h3>`/a non-heading).
- **Single slot = no wrapper**: with exactly one slot the text element renders
  directly (e.g. a bare `<h2>`) and `className` applies to it. With two or more
  slots they stack in the `as` wrapper (default `<div>`), which takes
  `className`.
