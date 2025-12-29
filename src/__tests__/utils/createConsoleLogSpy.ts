import { vi } from "vitest";

export function createConsoleLogSpy() {
  return vi.spyOn(console, "log").mockImplementation(() => {});
}
