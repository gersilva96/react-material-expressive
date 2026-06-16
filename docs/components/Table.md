# Table

Data table with a horizontal-scroll wrapper, surface-container header and
zebra rows. Fully data-agnostic — rows come from the consumer. Sub-parts:
`Table.Head`, `Table.Body`, `Table.Row`, `Table.Cell`, `Table.HeaderCell`,
`Table.TextContainer`.

> **Note**: M3 publishes no data table component (it was retired after
> M2), so this one is an in-house design over M3 foundations: official
> color tokens, `title-small` headers, `body-medium` cells and zebra rows
> on `surface-container/50` instead of dividers. Rows are non-interactive
> by default, like Card.

## Import

```tsx
import {Table} from "react-material-expressive";
```

## API

```ts
interface TableProps extends ComponentProps<"table"> {
  wrapperClassName?: string; // scroll wrapper
}
// Head/Body/Row: native thead/tbody/tr props
interface TableCellProps extends ComponentProps<"td"> {
  data?: ReactNode;
}
interface TableHeaderCellProps extends ComponentProps<"th"> {
  data?: ReactNode;
}
interface TextContainerProps {
  children?;
  className?;
  data?;
  width?: string;
} // default w-[300px]
```

## Example

```tsx
<Table>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Role</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {rows.map((row) => (
      <Table.Row key={row.id}>
        <Table.Cell>{row.name}</Table.Cell>
        <Table.Cell>
          <Table.TextContainer>{row.longText}</Table.TextContainer>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

## Gotchas

- Wrap long copy in `Table.TextContainer` to keep a readable measure.
- Cells accept `data` as a children fallback (handy when mapping objects).
