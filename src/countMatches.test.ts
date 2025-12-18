import { describe, it, expect } from "vitest";
import { countMatches } from "./countMatches";

describe("countMatches", () => {
  it("should count single match", () => {
    expect(
      countMatches({
        text: "hello world",
        searchString: "world",
        ignoreCase: false
      })
    ).toBe(1);
  });

  it("should count multiple matches", () => {
    expect(
      countMatches({
        text: "test test test",
        searchString: "test",
        ignoreCase: false
      })
    ).toBe(3);
  });

  it("should return 0 when no matches found", () => {
    expect(
      countMatches({
        text: "hello world",
        searchString: "goodbye",
        ignoreCase: false
      })
    ).toBe(0);
  });

  it("should handle case-sensitive search", () => {
    expect(
      countMatches({
        text: "Hello World",
        searchString: "world",
        ignoreCase: false
      })
    ).toBe(0);
    expect(
      countMatches({
        text: "Hello World",
        searchString: "World",
        ignoreCase: false
      })
    ).toBe(1);
  });

  it("should handle case-insensitive search", () => {
    expect(
      countMatches({
        text: "Hello World",
        searchString: "world",
        ignoreCase: true
      })
    ).toBe(1);
    expect(
      countMatches({
        text: "Test TEST test",
        searchString: "test",
        ignoreCase: true
      })
    ).toBe(3);
  });

  it("should handle special regex characters", () => {
    expect(
      countMatches({
        text: "Price: $100",
        searchString: "$100",
        ignoreCase: false
      })
    ).toBe(1);
    expect(
      countMatches({ text: "a.b.c", searchString: ".", ignoreCase: false })
    ).toBe(2);
  });
});
