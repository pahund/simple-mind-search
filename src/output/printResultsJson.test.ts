import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { printResultsJson } from "./printResultsJson";
import type { DeduplicatedResult } from "../deduplication";

describe("printResultsJson", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should print empty array for no results", () => {
    printResultsJson({ results: [] });

    expect(consoleLogSpy).toHaveBeenCalledWith("[]");
  });

  it("should print single result with all fields", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        notes: ["Note 1", "Note 2"],
        url: "https://example.com",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z"),
        done: true,
        date: new Date("2024-01-03T00:00:00.000Z")
      }
    ];

    printResultsJson({ results });

    const expectedJson = JSON.stringify(
      [
        {
          text: "Task 1",
          textWithBreaks: "Task 1",
          file: "file1.mm",
          created: "2024-01-01T10:00:00.000Z",
          modified: "2024-01-02T15:30:00.000Z",
          notes: ["Note 1", "Note 2"],
          url: "https://example.com",
          done: true,
          date: "2024-01-03T00:00:00.000Z"
        }
      ],
      null,
      2
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(expectedJson);
  });

  it("should print result with minimal fields", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsJson({ results });

    const expectedJson = JSON.stringify(
      [
        {
          text: "Task 1",
          textWithBreaks: "Task 1",
          file: "file1.mm",
          created: "2024-01-01T10:00:00.000Z",
          modified: "2024-01-02T15:30:00.000Z"
        }
      ],
      null,
      2
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(expectedJson);
  });

  it("should print multiple results", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z"),
        done: false
      },
      {
        text: "Task 2",
        file: "file2.mm",
        createdAt: new Date("2024-01-05T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-06T15:30:00.000Z"),
        url: "https://example.com"
      }
    ];

    printResultsJson({ results });

    const expectedJson = JSON.stringify(
      [
        {
          text: "Task 1",
          textWithBreaks: "Task 1",
          file: "file1.mm",
          created: "2024-01-01T10:00:00.000Z",
          modified: "2024-01-02T15:30:00.000Z",
          done: false
        },
        {
          text: "Task 2",
          textWithBreaks: "Task 2",
          file: "file2.mm",
          created: "2024-01-05T10:00:00.000Z",
          modified: "2024-01-06T15:30:00.000Z",
          url: "https://example.com"
        }
      ],
      null,
      2
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(expectedJson);
  });

  it("should replace newlines in text with spaces", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task\\N1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsJson({ results });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"text": "Task 1"')
    );
  });

  it("should include textWithBreaks in the output with %BREAK%", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task\\N1",
        notes: [],
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsJson({ results });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"textWithBreaks": "Task%BREAK%1"')
    );
  });

  it("should replace newlines in notes with spaces", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        notes: ["Note\n1", "Note\n2"],
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsJson({ results });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"Note 1"')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"Note 2"')
    );
  });

  it("should not include notes when empty array", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        notes: [],
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsJson({ results });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.not.stringContaining("notes")
    );
  });

  it("should include done when false", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z"),
        done: false
      }
    ];

    printResultsJson({ results });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"done": false')
    );
  });
});
