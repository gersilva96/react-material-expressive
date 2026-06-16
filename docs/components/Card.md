# Card

M3 card (shape medium, 16dp padding) with composable sub-parts:
`Card.Header`, `Card.Body`, `Card.Footer`.

## Import

```tsx
import {Card} from "react-material-expressive";
```

## API

```ts
interface CardProps extends ComponentProps<"div"> {
  variant?: "elevated" | "filled" | "outlined"; // default "filled"
}
// Card.Header / Card.Body / Card.Footer: ComponentProps<"div">
```

## Variants (M3 spec)

- `elevated` — surface-container-low + elevation level 1.
- `filled` — surface-container-highest.
- `outlined` — surface + outline-variant border.

## Example

```tsx
<Card variant="elevated" className="max-w-sm">
  <Card.Header>
    <Avatar name="MX" />
    <TextElement title="Headline" body="Subhead" />
  </Card.Header>
  <Card.Body>
    <p className="text-body-medium text-on-surface-variant">Content…</p>
  </Card.Body>
  <Card.Footer className="justify-end">
    <Button variant="text">Dismiss</Button>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

## Gotchas

- For edge-to-edge media use `className="p-0"` and pad inner content
  manually (see the WithMedia story).
- Cards are non-interactive by default; wrap with `LinkContainer` for a
  clickable card. The hover/pressed/dragged tokens in the M3 card sets
  apply only to actionable cards, so the base component ships none.
- Spec guidance: keep at most 8dp between sibling cards.
