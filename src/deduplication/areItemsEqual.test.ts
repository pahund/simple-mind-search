import { describe, it, expect } from "vitest";
import { areItemsEqual } from "./areItemsEqual";
import type { SearchResult } from "../types";

describe("areItemsEqual", () => {
  it("should return true when items have same text, notes and url", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        url: "https://example.com",
        notes: ["Note 1"]
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-05"),
      modifiedAt: new Date("2024-01-10"),
      match: {
        text: "Task 1",
        url: "https://example.com",
        notes: ["Note 1"]
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(true);
  });

  it("should return true when items have same text without notes or url", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1"
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-05"),
      modifiedAt: new Date("2024-01-10"),
      match: {
        text: "Task 1"
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(true);
  });

  it("should return false when items have different text", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1"
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 2"
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(false);
  });

  it("should return false when items have different notes", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        notes: ["Note 1"]
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        notes: ["Note 2"]
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(false);
  });

  it("should return false when items have different number of notes", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        notes: ["Note 1"]
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        notes: ["Note 1", "Note 2"]
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(false);
  });

  it("should return false when items have different urls", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        url: "https://example1.com"
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        url: "https://example2.com"
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(false);
  });

  it("should ignore done status when comparing", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        done: false
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        done: true
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(true);
  });

  it("should ignore date when comparing", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        date: new Date("2024-02-01")
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1",
        date: new Date("2024-03-01")
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(true);
  });

  it("should ignore file metadata when comparing", () => {
    const item1: SearchResult = {
      file: "file1.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-02"),
      match: {
        text: "Task 1"
      }
    };

    const item2: SearchResult = {
      file: "file2.mm",
      createdAt: new Date("2024-02-01"),
      modifiedAt: new Date("2024-03-02"),
      match: {
        text: "Task 1"
      }
    };

    expect(areItemsEqual(item1, item2)).toBe(true);
  });
});
