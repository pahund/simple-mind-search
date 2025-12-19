import { describe, it, expect } from "vitest";
import { deduplicate } from "./deduplicate";
import type { SearchResult } from "../types";

describe("deduplicate", () => {
  it("should return empty array for empty input", () => {
    const result = deduplicate([]);
    expect(result).toEqual([]);
  });

  it("should return single result unchanged", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          url: "https://example.com",
          done: true,
          date: new Date("2024-01-03"),
          notes: ["Note 1"]
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toEqual([
      {
        text: "Task 1",
        url: "https://example.com",
        done: true,
        date: new Date("2024-01-03"),
        notes: ["Note 1"],
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
  });

  it("should deduplicate items with same text, notes and url", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          url: "https://example.com",
          done: false,
          notes: ["Note 1"]
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-05"),
        modifiedAt: new Date("2024-01-10"),
        match: {
          text: "Task 1",
          url: "https://example.com",
          done: true,
          notes: ["Note 1"]
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "Task 1",
      url: "https://example.com",
      done: true,
      notes: ["Note 1"],
      file: "file2.mm",
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-10"),
      date: undefined
    });
  });

  it("should keep oldest creation date", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-10"),
        modifiedAt: new Date("2024-01-15"),
        match: {
          text: "Task 1"
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-05"),
        modifiedAt: new Date("2024-01-20"),
        match: {
          text: "Task 1"
        }
      }
    ];

    const result = deduplicate(results);

    expect(result[0].createdAt).toEqual(new Date("2024-01-05"));
    expect(result[0].file).toEqual("file2.mm");
  });

  it("should keep latest modification date", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-15"),
        match: {
          text: "Task 1"
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-20"),
        match: {
          text: "Task 1"
        }
      }
    ];

    const result = deduplicate(results);

    expect(result[0].modifiedAt).toEqual(new Date("2024-01-20"));
    expect(result[0].file).toEqual("file2.mm");
  });

  it("should use done status from file with latest modification date", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-10"),
        match: {
          text: "Task 1",
          done: false
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-20"),
        match: {
          text: "Task 1",
          done: true
        }
      }
    ];

    const result = deduplicate(results);

    expect(result[0].done).toBe(true);
    expect(result[0].file).toEqual("file2.mm");
  });

  it("should use date from file with latest modification date", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-10"),
        match: {
          text: "Task 1",
          date: new Date("2024-02-01")
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-20"),
        match: {
          text: "Task 1",
          date: new Date("2024-03-01")
        }
      }
    ];

    const result = deduplicate(results);

    expect(result[0].date).toEqual(new Date("2024-03-01"));
    expect(result[0].file).toEqual("file2.mm");
  });

  it("should not deduplicate items with different text", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1"
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 2"
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(2);
  });

  it("should not deduplicate items with different number of notes", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          notes: ["Note 1"]
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          notes: ["Note 1", "Note 2"]
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(2);
  });

  it("should not deduplicate items with different note content", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          notes: ["Note 1"]
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          notes: ["Note 2"]
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(2);
  });

  it("should not deduplicate items with different urls", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          url: "https://example1.com"
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          url: "https://example2.com"
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(2);
  });

  it("should handle items without notes as equal", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1"
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-03"),
        match: {
          text: "Task 1"
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(1);
  });

  it("should treat undefined notes same as empty notes array", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02"),
        match: {
          text: "Task 1",
          notes: undefined
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-03"),
        match: {
          text: "Task 1",
          notes: []
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(1);
  });

  it("should handle multiple duplicates correctly", () => {
    const results: SearchResult[] = [
      {
        file: "file1.mm",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-05"),
        match: {
          text: "Task 1"
        }
      },
      {
        file: "file2.mm",
        createdAt: new Date("2024-01-02"),
        modifiedAt: new Date("2024-01-10"),
        match: {
          text: "Task 1"
        }
      },
      {
        file: "file3.mm",
        createdAt: new Date("2024-01-03"),
        modifiedAt: new Date("2024-01-15"),
        match: {
          text: "Task 1"
        }
      }
    ];

    const result = deduplicate(results);

    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toEqual(new Date("2024-01-01"));
    expect(result[0].modifiedAt).toEqual(new Date("2024-01-15"));
    expect(result[0].file).toEqual("file3.mm");
  });
});
