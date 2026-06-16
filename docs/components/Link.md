# LinkBox / LinkContainer

Native `<a>` links — no router coupling. `LinkBox` is a **text link** that
reads as a link: primary color, **underlined at rest** (the underline is not
color-only on purpose — an inline link must be distinguishable from body text
without relying on color, WCAG 1.4.1, since `primary` vs text is only
2.64:1 light / 1.31:1 dark). The current page (`active`) gets a heavier
underline (no color change) + `aria-current="page"`. `LinkContainer` is a
block-level link that wraps arbitrary content (cards, media) without adding
text styling.

## Import

```tsx
import {LinkBox, LinkContainer} from "react-material-expressive";
```

## API

```ts
interface LinkBoxProps extends ComponentProps<"a"> {
  active?: boolean; // explicit current-page (heavier underline); else derived
  currentPath?: string; // pathname from YOUR router
}
type LinkContainerProps = ComponentProps<"a">;
```

## Examples

```tsx
<p>Read the <LinkBox href="/guidelines">guidelines</LinkBox>.</p>
<LinkBox currentPath={pathname} href="/docs">Docs</LinkBox>

<LinkContainer aria-label="Open article" href="/post/42">
    <Card variant="outlined">…</Card>
</LinkContainer>
```

## Gotchas

- Client-side routing: intercept `onClick` (preventDefault + router.push)
  or wrap with your framework's Link passing these as children styles.
- `LinkBox` inherits font size; set type scale via `className`.
