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
  body?: ReactNode;
  bodyStyle?: string; // class override
  className?: string;
  label?: ReactNode;
  labelStyle?: string;
  title?: ReactNode;
  titleStyle?: string;
}
```

## Examples

```tsx
<TextElement label="OVERLINE" title="Headline" body="Supporting copy" />
<TextElement title="Bigger" titleStyle="text-headline-small" />
```

## Gotchas

- Each slot renders only when provided; `*Style` props are class strings
  merged with `cn`.
