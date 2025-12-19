import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { printResultsYaml } from "./printResultsYaml";
import type { DeduplicatedResult } from "../deduplication";
import type { Config } from "../config";

describe("printResultsYaml", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  const mockConfig: Config = {
    mindMapsDir: "~/Documents/Mind Maps",
    filesToSearch: "**/*.smmx",
    locale: "en-GB",
    timeZone: "CET"
  };

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should print empty output for no results", () => {
    printResultsYaml({ results: [], config: mockConfig });

    expect(consoleLogSpy).not.toHaveBeenCalled();
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith("- text: Task 1");
    expect(consoleLogSpy).toHaveBeenCalledWith("  notes:");
    expect(consoleLogSpy).toHaveBeenCalledWith("    - Note 1");
    expect(consoleLogSpy).toHaveBeenCalledWith("    - Note 2");
    expect(consoleLogSpy).toHaveBeenCalledWith("  file: file1.mm");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  created: 01/01/2024, 11:00:00"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 16:30:00"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('  url: "https://example.com"');
    expect(consoleLogSpy).toHaveBeenCalledWith("  done: true");
    expect(consoleLogSpy).toHaveBeenCalledWith("  date: 03/01/2024");
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith("- text: Task 1");
    expect(consoleLogSpy).toHaveBeenCalledWith("  file: file1.mm");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  created: 01/01/2024, 11:00:00"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 16:30:00"
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("notes:")
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("url:")
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("done:")
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("date:")
    );
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith("- text: Task 1");
    expect(consoleLogSpy).toHaveBeenCalledWith("  file: file1.mm");
    expect(consoleLogSpy).toHaveBeenCalledWith("  done: false");
    expect(consoleLogSpy).toHaveBeenCalledWith("- text: Task 2");
    expect(consoleLogSpy).toHaveBeenCalledWith("  file: file2.mm");
    expect(consoleLogSpy).toHaveBeenCalledWith('  url: "https://example.com"');
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith("- text: Task 1");
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith("  notes:");
    expect(consoleLogSpy).toHaveBeenCalledWith("    - Note 1");
    expect(consoleLogSpy).toHaveBeenCalledWith("    - Note 2");
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("notes:")
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

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith("  done: false");
  });

  it("should escape YAML special characters in text", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task: with colon",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith('- text: "Task: with colon"');
  });

  it("should escape YAML special characters in notes", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        notes: ["Note: with colon"],
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith('    - "Note: with colon"');
  });

  it("should escape YAML special characters in file path", () => {
    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file:1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsYaml({ results, config: mockConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith('  file: "file:1.mm"');
  });

  it("should use locale for date formatting", () => {
    const customConfig: Config = {
      ...mockConfig,
      locale: "en-US"
    };

    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsYaml({ results, config: customConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  created: 1/1/2024, 11:00:00 AM"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  modified: 1/2/2024, 4:30:00 PM"
    );
  });

  it("should use timeZone for date formatting", () => {
    const customConfig: Config = {
      ...mockConfig,
      timeZone: "UTC"
    };

    const results: DeduplicatedResult[] = [
      {
        text: "Task 1",
        file: "file1.mm",
        createdAt: new Date("2024-01-01T10:00:00.000Z"),
        modifiedAt: new Date("2024-01-02T15:30:00.000Z")
      }
    ];

    printResultsYaml({ results, config: customConfig });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  created: 01/01/2024, 10:00:00"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 15:30:00"
    );
  });
});
