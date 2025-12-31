import { describe } from "vitest";

export function createDescribeWithDebug(debug: (message: string) => void) {
  return (description: string, fn: () => void) => {
    describe(description, () => {
      debug(description);
      fn();
    });
  };
}
