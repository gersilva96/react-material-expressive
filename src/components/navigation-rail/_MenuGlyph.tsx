// Internal: the navigation rail's menu glyph. M3 mandates the icon swap
// `menu` -> `menu_open` when the rail expands ("the menu icon should change to
// represent that it can be collapsed"), so it is NOT customizable — the library
// draws it (currentColor, recolored by the IconButton) instead of taking it as
// a prop. Official Material Symbols Rounded paths (viewBox 0 -960 960 960).
const MENU =
  "M150-240q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-210q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-210q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h660q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Z";

const MENU_OPEN =
  "M150-240q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h460q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm627-74L630-460q-9-9-9-21t9-21l146-146q9-9 21.5-9t21.5 9q9 9 9 21.5t-9 21.5L695-481l125 125q9 9 9 21t-9 21q-9 9-21.5 9t-21.5-9ZM150-452q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h340q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Zm0-208q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h460q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H150Z";

/** The rail's menu glyph: `menu` collapsed, `menu_open` expanded. */
function MenuGlyph({open}: {open: boolean}) {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={24}
      viewBox="0 -960 960 960"
      width={24}>
      <path d={open ? MENU_OPEN : MENU} />
    </svg>
  );
}

export {MenuGlyph};
