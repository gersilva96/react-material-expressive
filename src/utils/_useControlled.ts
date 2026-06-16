// Internal: controlled/uncontrolled state for form-like components.
// Not exported from the public barrel.
import {useCallback, useRef, useState} from "react";

/**
 * Controllable state. When `controlled` is defined the component is fully
 * driven by props (internal updates are ignored); otherwise an internal
 * state seeded with `defaultValue` is used.
 */
export function useControlled<T>(
  controlled: T | undefined,
  defaultValue: T,
): [T, (next: T) => void] {
  const isControlled = useRef(controlled !== undefined).current;
  const [internal, setInternal] = useState<T>(defaultValue);

  const value =
    isControlled && controlled !== undefined ? controlled : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
    },
    [isControlled],
  );

  return [value, setValue];
}
