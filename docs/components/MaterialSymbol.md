# MaterialSymbol

Zero-dependency Material Symbols glyph: renders a ligature `<span>` with
`font-variation-settings`. It only displays if the consumer loaded the
corresponding Material Symbols variable font — the library bundles no
font.

## Import

```tsx
import {MaterialSymbol} from "react-material-expressive";
```

Load the font (once, in your app):

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
  rel="stylesheet" />
```

## API

```ts
interface MaterialSymbolProps extends Omit<ComponentProps<"span">, "children"> {
  fill?: boolean; // FILL axis
  grade?: number; // GRAD (-25..200)
  name: string; // ligature, e.g. "favorite"
  opticalSize?: number; // opsz (defaults to size)
  size?: number; // px, default 24
  variant?: "rounded" | "outlined" | "sharp"; // must match the loaded font
  weight?: number; // wght (100..700)
}
```

## Examples

```tsx
<MaterialSymbol name="favorite" />
<MaterialSymbol fill name="favorite" className="text-error" />
<MaterialSymbol name="settings" size={18} weight={500} />
```

## Gotchas

- `aria-hidden` by default — give the parent control an `aria-label`.
- Components accept ANY ReactNode icon; this helper is just the
  recommended zero-dep path.
