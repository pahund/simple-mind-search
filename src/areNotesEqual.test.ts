import { describe, it, expect } from "vitest";
import { areNotesEqual } from "./areNotesEqual";

describe("areNotesEqual", () => {
  it("should return true when both notes are undefined", () => {
    expect(areNotesEqual(undefined, undefined)).toBe(true);
  });

  it("should return true when both notes are empty arrays", () => {
    expect(areNotesEqual([], [])).toBe(true);
  });

  it("should return true when one is undefined and other is empty array", () => {
    expect(areNotesEqual(undefined, [])).toBe(true);
    expect(areNotesEqual([], undefined)).toBe(true);
  });

  it("should return true when notes have same content", () => {
    expect(areNotesEqual(["Note 1"], ["Note 1"])).toBe(true);
    expect(areNotesEqual(["Note 1", "Note 2"], ["Note 1", "Note 2"])).toBe(
      true
    );
  });

  it("should return false when notes have different lengths", () => {
    expect(areNotesEqual(["Note 1"], ["Note 1", "Note 2"])).toBe(false);
    expect(areNotesEqual(["Note 1", "Note 2"], ["Note 1"])).toBe(false);
  });

  it("should return false when notes have different content", () => {
    expect(areNotesEqual(["Note 1"], ["Note 2"])).toBe(false);
    expect(areNotesEqual(["Note 1", "Note 2"], ["Note 1", "Note 3"])).toBe(
      false
    );
  });

  it("should return false when notes are in different order", () => {
    expect(areNotesEqual(["Note 1", "Note 2"], ["Note 2", "Note 1"])).toBe(
      false
    );
  });

  it("should be case-sensitive", () => {
    expect(areNotesEqual(["note"], ["Note"])).toBe(false);
  });

  it("should consider whitespace", () => {
    expect(areNotesEqual(["note"], ["note "])).toBe(false);
    expect(areNotesEqual(["note"], [" note"])).toBe(false);
  });
});
