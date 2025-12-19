import { describe, it, expect, vi, beforeEach } from "vitest";
import { search } from "./search";
import { getFilesToSearch } from "../files/getFilesToSearch";
import { unpack } from "../files/unpack";
import { extractTopics } from "../extraction/extractTopics";

vi.mock("../files/getFilesToSearch");
vi.mock("../files/unpack");
vi.mock("../extraction/extractTopics");
vi.mock("fast-xml-parser", () => ({
  XMLParser: vi.fn(function (this: unknown) {
    return {
      parse: vi.fn().mockReturnValue({})
    };
  })
}));

describe("search", () => {
  const mockConfig = {
    mindMapsDir: "~/Documents/Mind Maps",
    filesToSearch: "**/*.smmx",
    locale: "en-GB",
    timeZone: "CET"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("should search and find matches in files", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      { "@_text": "This is a test" },
      { "@_text": "Another test here" }
    ]);

    await search({ config: mockConfig, searchString: "test", verbose: true });

    expect(console.log).toHaveBeenCalledWith("Searching for: test");
    expect(console.log).toHaveBeenCalledWith("- text: This is a test");
    expect(console.log).toHaveBeenCalledWith("- text: Another test here");
    expect(console.log).toHaveBeenCalledWith("  file: /path/to/file.smmx");
    expect(console.log).toHaveBeenCalledWith("  created: 01/01/2024, 01:00:00");
    expect(console.log).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 01:00:00"
    );
  });

  it("should search in notes and find matches", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Topic with notes",
        children: {
          text: { note: "This is a test note" }
        }
      }
    ]);

    await search({ config: mockConfig, searchString: "test" });

    expect(console.log).toHaveBeenCalledWith("- text: Topic with notes");
    expect(console.log).toHaveBeenCalledWith("  notes:");
    expect(console.log).toHaveBeenCalledWith("    - This is a test note");
    expect(console.log).toHaveBeenCalledWith("  file: /path/to/file.smmx");
  });

  it("should display all notes for matched topics even without matches in notes", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Topic with test in text",
        children: {
          text: [{ note: "First note" }, { note: "Second note" }]
        }
      }
    ]);

    await search({ config: mockConfig, searchString: "test" });

    expect(console.log).toHaveBeenCalledWith("- text: Topic with test in text");
    expect(console.log).toHaveBeenCalledWith("  notes:");
    expect(console.log).toHaveBeenCalledWith("    - First note");
    expect(console.log).toHaveBeenCalledWith("    - Second note");
  });

  it("should handle multiple matches in single text", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([{ "@_text": "test test test" }]);

    await search({ config: mockConfig, searchString: "test" });

    expect(console.log).toHaveBeenCalledWith("  file: /path/to/file.smmx");
    expect(console.log).toHaveBeenCalledWith("  created: 01/01/2024, 01:00:00");
    expect(console.log).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 01:00:00"
    );
  });

  it("should handle no matches found", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([{ "@_text": "No match here" }]);

    await search({
      config: mockConfig,
      searchString: "missing",
      verbose: true
    });

    expect(console.log).toHaveBeenCalledWith("Searching for: missing");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("file:")
    );
  });

  it("should search multiple files", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file1.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      },
      {
        path: "/path/to/file2.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([{ "@_text": "found here" }]);

    await search({ config: mockConfig, searchString: "found" });

    expect(console.log).toHaveBeenCalledWith("  file: /path/to/file1.smmx");
    expect(console.log).toHaveBeenCalledWith("  created: 01/01/2024, 01:00:00");
    expect(console.log).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 01:00:00"
    );
  });

  it("should handle unpack errors and continue", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/bad.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      },
      {
        path: "/path/to/good.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockImplementation((_config, file) => {
      if (file === "/path/to/bad.smmx") {
        throw new Error("Invalid file");
      }
      return "<xml></xml>";
    });
    vi.mocked(extractTopics).mockReturnValue([{ "@_text": "test content" }]);

    await search({ config: mockConfig, searchString: "test" });

    expect(console.warn).toHaveBeenCalledWith("Invalid file");
    expect(console.log).toHaveBeenCalledWith("  file: /path/to/good.smmx");
    expect(console.log).toHaveBeenCalledWith("  created: 01/01/2024, 01:00:00");
    expect(console.log).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 01:00:00"
    );
  });

  it("should replace newline characters in output", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      { "@_text": "Line one\\NLine two" }
    ]);

    await search({ config: mockConfig, searchString: "Line" });

    expect(console.log).toHaveBeenCalledWith("- text: Line one Line two");
    expect(console.log).toHaveBeenCalledWith("  file: /path/to/file.smmx");
    expect(console.log).toHaveBeenCalledWith("  created: 01/01/2024, 01:00:00");
    expect(console.log).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 01:00:00"
    );
  });

  it("should handle topics without @_text", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      { someOtherProp: "value" },
      { "@_text": "found" }
    ]);

    await search({ config: mockConfig, searchString: "found" });

    expect(console.log).toHaveBeenCalledWith("  file: /path/to/file.smmx");
    expect(console.log).toHaveBeenCalledWith("  created: 01/01/2024, 01:00:00");
    expect(console.log).toHaveBeenCalledWith(
      "  modified: 02/01/2024, 01:00:00"
    );
  });

  it("should handle empty file list", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([]);

    await search({ config: mockConfig, searchString: "test", verbose: true });

    expect(console.log).toHaveBeenCalledWith("Searching for: test");
  });

  it("should extract and display URL from link node", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Check this link",
        link: { "@_urllink": "https://example.com" }
      }
    ]);

    await search({ config: mockConfig, searchString: "link" });

    expect(console.log).toHaveBeenCalledWith("- text: Check this link");
    expect(console.log).toHaveBeenCalledWith('  url: "https://example.com"');
  });

  it("should handle topics with link array", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Multiple links",
        link: [
          { "@_otherattr": "value" },
          { "@_urllink": "https://example.org" }
        ]
      }
    ]);

    await search({ config: mockConfig, searchString: "links" });

    expect(console.log).toHaveBeenCalledWith("- text: Multiple links");
    expect(console.log).toHaveBeenCalledWith('  url: "https://example.org"');
  });

  it("should not display URL when link node has no urllink attribute", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "No URL here",
        link: { "@_otherattr": "value" }
      }
    ]);

    await search({ config: mockConfig, searchString: "URL" });

    expect(console.log).toHaveBeenCalledWith("- text: No URL here");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("url:")
    );
  });

  it("should display done status as true when checkbox is complete (progress=100)", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Complete task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      }
    ]);

    await search({ config: mockConfig, searchString: "task" });

    expect(console.log).toHaveBeenCalledWith("- text: Complete task");
    expect(console.log).toHaveBeenCalledWith("  done: true");
  });

  it("should display done status as false when checkbox is incomplete (progress<100)", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Incomplete task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      }
    ]);

    await search({ config: mockConfig, searchString: "task" });

    expect(console.log).toHaveBeenCalledWith("- text: Incomplete task");
    expect(console.log).toHaveBeenCalledWith("  done: false");
  });

  it("should not display done status when checkbox-mode is not checkbox", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Not a checkbox",
        "@_checkbox-mode": "other",
        "@_checkbox": "true",
        "@_progress": "100"
      }
    ]);

    await search({ config: mockConfig, searchString: "checkbox" });

    expect(console.log).toHaveBeenCalledWith("- text: Not a checkbox");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("done:")
    );
  });

  it("should not display done status when checkbox is false", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Checkbox disabled",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "false",
        "@_progress": "100"
      }
    ]);

    await search({ config: mockConfig, searchString: "disabled" });

    expect(console.log).toHaveBeenCalledWith("- text: Checkbox disabled");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("done:")
    );
  });

  it("should not display done status when progress attribute is missing", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "No progress",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true"
      }
    ]);

    await search({ config: mockConfig, searchString: "progress" });

    expect(console.log).toHaveBeenCalledWith("- text: No progress");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("done:")
    );
  });

  it("should display both URL and done status when both are present", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      {
        "@_text": "Task with link",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100",
        link: { "@_urllink": "https://example.com" }
      }
    ]);

    await search({ config: mockConfig, searchString: "Task" });

    expect(console.log).toHaveBeenCalledWith("- text: Task with link");
    expect(console.log).toHaveBeenCalledWith('  url: "https://example.com"');
    expect(console.log).toHaveBeenCalledWith("  done: true");
  });

  it("should perform case-sensitive search by default", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      { "@_text": "This is a Test" },
      { "@_text": "Another test here" }
    ]);

    await search({ config: mockConfig, searchString: "test" });

    expect(console.log).toHaveBeenCalledWith("- text: Another test here");
    expect(console.log).not.toHaveBeenCalledWith("- text: This is a Test");
  });

  it("should perform case-insensitive search when ignoreCase is true", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      { "@_text": "This is a Test" },
      { "@_text": "Another test here" },
      { "@_text": "TEST in capitals" }
    ]);

    await search({
      config: mockConfig,
      searchString: "test",
      ignoreCase: true
    });

    expect(console.log).toHaveBeenCalledWith("- text: This is a Test");
    expect(console.log).toHaveBeenCalledWith("- text: Another test here");
    expect(console.log).toHaveBeenCalledWith("- text: TEST in capitals");
  });

  it("should handle special regex characters in search string", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/path/to/file.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);
    vi.mocked(unpack).mockReturnValue("<xml></xml>");
    vi.mocked(extractTopics).mockReturnValue([
      { "@_text": "Price: $100 (sale)" },
      { "@_text": "Regular price: 100" }
    ]);

    await search({ config: mockConfig, searchString: "$100" });

    expect(console.log).toHaveBeenCalledWith('- text: "Price: $100 (sale)"');
    expect(console.log).not.toHaveBeenCalledWith(
      '- text: "Regular price: 100"'
    );
  });
});
