# Search / SearchInput / SearchItem

M3 search bar + docked search view. Default = the M3 Expressive **contained**
style: a persistent full-pill bar on `surface-container-high` that, on
click/focus, opens a **separate** suggestions card below — `corner-medium`
(12) all around, a 2dp gap, no divider, elevation 3. The bar leading icon is
`on-surface` (primary affordance), the trailing icon/avatar `on-surface-variant`.
Items are 56dp `body-large` rows. Closes on outside click or Escape.

> **M3 Expressive note:** the legacy **divided** style (`divided`) joins the
> bar and results with an `outline` divider and squares off the bar's bottom
> corners (extra-large). M3 Expressive marks it _"not recommended — use
> contained"_; it stays for baseline parity.

## Import

```tsx
import {Search, SearchInput} from "react-material-expressive";
```

## API

```ts
interface SearchProps {
  children: ReactNode; // the bar content (SearchInput)
  className?: string;
  divided?: boolean; // baseline joined-with-divider style (legacy)
  result?: ReactNode; // Search.Item list shown while open
  resultClassName?: string;
}

interface SearchInputProps extends Omit<
  ComponentProps<"input">,
  "placeholder" | "size"
> {
  className?: string;
  clearable?: boolean; // trailing clear (×) button when there's a value
  inputClassName?: string;
  labels?: SearchInputLabels; // accessible names
  leftElement?: ReactNode; // 56px slot (search icon / back)
  onClear?: () => void; // called after the clear button empties the input
  rightElement?: ReactNode; // 56px slot (avatar / mic) — wins over clear
}

interface SearchInputLabels {
  clear?: string; // clear-button aria-label (default "Clear")
  placeholder?: string; // input placeholder (default "Search")
}

interface SearchItemProps {
  children?;
  className?;
  label?: ReactNode;
  leftElement?: ReactNode; // 24px box
  onClick?: MouseEventHandler<HTMLButtonElement>;
  rightElement?: ReactNode;
}
```

`Search.Input` and `Search.Item` are also exposed as statics.

## Example

```tsx
<Search
  result={
    <>
      <Search.Item
        label="Recent query"
        leftElement={<MaterialSymbol name="history" />}
        onClick={pick}
      />
      <Search.Item
        label="Trending"
        leftElement={<MaterialSymbol name="trending_up" />}
      />
    </>
  }>
  <SearchInput
    clearable
    labels={{placeholder: "Search"}}
    leftElement={<MaterialSymbol name="search" />}
    onChange={onQuery}
  />
</Search>
```

## Gotchas

- `SearchInput` is transparent — the `Search` wrapper owns the container
  color/shape. Standalone bars: wrap in `Search` without `result`.
- Search bars don't float labels (M3); the placeholder stays visible.
- `clearable` renders a trailing clear (×) button while the input has a value
  (controlled or uncontrolled; clearing refocuses the input and fires
  `onClear`). It hides the inconsistent native `type=search` clear, and a
  `rightElement` takes precedence over it.
- The suggestions card opens with the menu choreography (500ms emphasized
  clip reveal with staggered items, 150ms accelerate exit). In the default
  **contained** style the bar keeps its 28px pill shape and the card floats
  2dp below (corner-medium, level-3 shadow). With `divided` the bar's bottom
  corners square off in step with the reveal (real 28px pill — half the 56dp
  bar) and the card joins it via the `outline` divider.
- The bar is flat at rest (tonal-first, matching Compose's `Level0` default);
  the search-bar token nominally specifies elevation 3.
- Like the lib's menus, the docked card is an inline overlay (no full-page
  scrim).
- **BREAKING:** the native `placeholder` prop was replaced by
  `labels={{placeholder}}`.
