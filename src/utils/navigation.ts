/**
 * Router-agnostic helpers for navigation components. The consumer passes
 * the current pathname (from whatever router they use) and the component
 * derives its active state.
 */

function normalize(path: string): string {
  const noQuery = path.split(/[?#]/, 1)[0] ?? path;
  if (noQuery.length > 1 && noQuery.endsWith("/")) {
    return noQuery.slice(0, -1);
  }
  return noQuery;
}

/**
 * True when `currentPath` matches `href` exactly, or is nested under it
 * (e.g. href="/docs" is active on "/docs/intro"). Root ("/") only matches
 * exactly.
 */
export function isActivePath(
  href: string | undefined | null,
  currentPath: string | undefined | null,
): boolean {
  if (!href || !currentPath) return false;
  const target = normalize(href);
  const current = normalize(currentPath);
  if (target === current) return true;
  if (target === "/") return false;
  return current.startsWith(`${target}/`);
}

/**
 * Resolution order for the active state of a navigation item:
 * explicit `active` prop wins; otherwise it derives from `href` +
 * `currentPath`.
 */
export function resolveActive(
  active: boolean | undefined,
  href: string | undefined,
  currentPath: string | undefined | null,
): boolean {
  if (typeof active === "boolean") return active;
  return isActivePath(href, currentPath);
}
