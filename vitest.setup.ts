import "@testing-library/jest-dom/vitest";
import {cleanup} from "@testing-library/react";
import {toHaveNoViolations} from "jest-axe";
import {afterEach, expect} from "vitest";

// jest-axe matcher for structural accessibility assertions.
expect.extend(toHaveNoViolations);

// Unmount React trees between tests so queries stay scoped.
afterEach(() => cleanup());

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module "vitest" {
  // The type-parameter signature must match Vitest's own `Assertion<T = any>`.
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
}
