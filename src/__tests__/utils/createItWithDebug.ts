import { it } from "vitest";

export function createItWithDebug(debug: (message: string) => void) {
  return (description: string, fn: () => void) => {
    it(description, () => {
      debug(description);
      fn();
    });
  };
}
