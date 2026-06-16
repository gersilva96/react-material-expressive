import {useEffect, useLayoutEffect} from "react";

/**
 * `useLayoutEffect` that falls back to `useEffect` on the server. React warns
 * that `useLayoutEffect` does nothing during server rendering; this swap keeps
 * SSR output clean (the layout measurement only ever runs in the browser).
 * Internal — not exported from the public barrel.
 */
export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
