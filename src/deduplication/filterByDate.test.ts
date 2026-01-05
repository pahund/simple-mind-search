import { describe, it, expect } from "vitest";
import { filterByDate } from "./filterByDate";
import type { DeduplicatedResult } from "./deduplicate";

describe("filterByDate", () => {
  it("should filter results where target date is within lifetime", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-20"),
        modifiedAt: new Date("2025-11-30")
      },
      {
        text: "Topic 2",
        file: "file2.smmx",
        createdAt: new Date("2025-12-01"),
        modifiedAt: new Date("2025-12-10")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-11-25" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].text).toBe("Topic 1");
  });

  it("should include results where target date equals createdAt", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-25"),
        modifiedAt: new Date("2025-11-30")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-11-25" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].text).toBe("Topic 1");
  });

  it("should include results where target date equals modifiedAt", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-20"),
        modifiedAt: new Date("2025-11-25")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-11-25" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].text).toBe("Topic 1");
  });

  it("should exclude results where target date is before createdAt", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-25"),
        modifiedAt: new Date("2025-11-30")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-11-24" });

    expect(filtered).toHaveLength(0);
  });

  it("should exclude results where target date is after modifiedAt", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-20"),
        modifiedAt: new Date("2025-11-25")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-11-26" });

    expect(filtered).toHaveLength(0);
  });

  it("should filter multiple results correctly", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-01"),
        modifiedAt: new Date("2025-11-10")
      },
      {
        text: "Topic 2",
        file: "file2.smmx",
        createdAt: new Date("2025-11-15"),
        modifiedAt: new Date("2025-11-30")
      },
      {
        text: "Topic 3",
        file: "file3.smmx",
        createdAt: new Date("2025-12-01"),
        modifiedAt: new Date("2025-12-10")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-11-25" });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].text).toBe("Topic 2");
  });

  it("should return empty array when no results match", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-01"),
        modifiedAt: new Date("2025-11-10")
      }
    ];

    const filtered = filterByDate({ results, date: "2025-12-01" });

    expect(filtered).toHaveLength(0);
  });

  it("should throw error for invalid date format", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Topic 1",
        file: "file1.smmx",
        createdAt: new Date("2025-11-01"),
        modifiedAt: new Date("2025-11-10")
      }
    ];

    expect(() => filterByDate({ results, date: "invalid-date" })).toThrow(
      "Invalid date format: invalid-date. Expected YYYY-MM-DD"
    );
  });

  it("should handle empty results array", () => {
    const results: DeduplicatedResult[] = [];

    const filtered = filterByDate({ results, date: "2025-11-25" });

    expect(filtered).toHaveLength(0);
  });
});
