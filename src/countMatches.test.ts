import { describe, it, expect } from "vitest";
import { countMatches } from "./countMatches";

describe("countMatches", () => {
  it("should count single match", () => {
    expect(countMatches("hello world", "world", false)).toBe(1);
  });

  it("should count multiple matches", () => {
    expect(countMatches("test test test", "test", false)).toBe(3);
  });

  it("should return 0 when no matches found", () => {
    expect(countMatches("hello world", "goodbye", false)).toBe(0);
  });

  it("should handle case-sensitive search", () => {
    expect(countMatches("Hello World", "world", false)).toBe(0);
    expect(countMatches("Hello World", "World", false)).toBe(1);
  });

  it("should handle case-insensitive search", () => {
    expect(countMatches("Hello World", "world", true)).toBe(1);
    expect(countMatches("Test TEST test", "test", true)).toBe(3);
  });

  it("should handle special regex characters", () => {
    expect(countMatches("Price: $100", "$100", false)).toBe(1);
    expect(countMatches("a.b.c", ".", false)).toBe(2);
  });
});
