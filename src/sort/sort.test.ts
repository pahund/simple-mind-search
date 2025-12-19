import { describe, it, expect } from "vitest";
import { sort } from "./sort";
import type { DeduplicatedResult } from "../deduplication";

describe("sort", () => {
  it("should return empty array for empty input", () => {
    const result = sort([]);
    expect(result).toEqual([]);
  });

  it("should return single result unchanged", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result).toEqual(results);
  });

  it("should sort results by modifiedAt in descending order", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      },
      {
        text: "Task 2",
        file: "file2.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-05T15:30:00.000Z")
      },
      {
        text: "Task 3",
        file: "file3.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-03T15:30:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result[0].text).toBe("Task 2");
    expect(result[1].text).toBe("Task 3");
    expect(result[2].text).toBe("Task 1");
  });

  it("should not modify original array", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      },
      {
        text: "Task 2",
        file: "file2.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-05T15:30:00.000Z")
      }
    ];

    const originalOrder = results.map((r) => r.text);
    sort(results);

    expect(results.map((r) => r.text)).toEqual(originalOrder);
  });

  it("should sort by lifetime when modifiedAt is same (shorter lifetime first)", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Longer lifetime",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      },
      {
        text: "Shorter lifetime",
        file: "file2.mm",
        createdAt: new Date("2024-01-02T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("Shorter lifetime");
    expect(result[1].text).toBe("Longer lifetime");
  });

  it("should put newest modification first", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Oldest",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-01T15:30:00.000Z")
      },
      {
        text: "Newest",
        file: "file2.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-10T15:30:00.000Z")
      },
      {
        text: "Middle",
        file: "file3.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-05T15:30:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result[0].text).toBe("Newest");
    expect(result[2].text).toBe("Oldest");
  });

  it("should preserve all result properties", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        notes: ["Note 1"],
        url: "https://example.com",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z"),
        done: true,
        date: new Date("2024-01-03T00:00:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result[0]).toEqual(results[0]);
    expect(result[0].notes).toEqual(["Note 1"]);
    expect(result[0].url).toBe("https://example.com");
    expect(result[0].done).toBe(true);
    expect(result[0].date).toEqual(new Date("2024-01-03T00:00:00.000Z"));
  });

  it("should sort multiple items with same modifiedAt by lifetime", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "5 hour lifetime",
        file: "file1.mm",
        createdAt: new Date("2024-01-02T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:00:00.000Z")
      },
      {
        text: "1 hour lifetime",
        file: "file2.mm",
        createdAt: new Date("2024-01-02T14:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:00:00.000Z")
      },
      {
        text: "10 hour lifetime",
        file: "file3.mm",
        createdAt: new Date("2024-01-02T05:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:00:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result[0].text).toBe("1 hour lifetime");
    expect(result[1].text).toBe("5 hour lifetime");
    expect(result[2].text).toBe("10 hour lifetime");
  });

  it("should prioritize modifiedAt over lifetime", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Newer with long lifetime",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-05T15:00:00.000Z")
      },
      {
        text: "Older with short lifetime",
        file: "file2.mm",
        createdAt: new Date("2024-01-02T14:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:00:00.000Z")
      }
    ];

    const result = sort(results);

    expect(result[0].text).toBe("Newer with long lifetime");
    expect(result[1].text).toBe("Older with short lifetime");
  });
});
