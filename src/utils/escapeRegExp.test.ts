import { describe, it, expect } from "vitest";
import { escapeRegExp } from "./escapeRegExp";

describe("escapeRegExp", () => {
  it("should escape special regex characters", () => {
    expect(escapeRegExp("$100")).toBe("\\$100");
    expect(escapeRegExp("a.b")).toBe("a\\.b");
    expect(escapeRegExp("a*b")).toBe("a\\*b");
    expect(escapeRegExp("a+b")).toBe("a\\+b");
    expect(escapeRegExp("a?b")).toBe("a\\?b");
    expect(escapeRegExp("a^b")).toBe("a\\^b");
    expect(escapeRegExp("a|b")).toBe("a\\|b");
    expect(escapeRegExp("a[b]")).toBe("a\\[b\\]");
    expect(escapeRegExp("a{b}")).toBe("a\\{b\\}");
    expect(escapeRegExp("a(b)")).toBe("a\\(b\\)");
    expect(escapeRegExp("a\\b")).toBe("a\\\\b");
  });

  it("should not escape regular characters", () => {
    expect(escapeRegExp("hello world")).toBe("hello world");
    expect(escapeRegExp("test123")).toBe("test123");
  });

  it("should handle empty string", () => {
    expect(escapeRegExp("")).toBe("");
  });
});
