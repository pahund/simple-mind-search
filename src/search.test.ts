import { describe, it, expect, vi, beforeEach } from "vitest";
import { search } from "./search";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";
import { extractTopics } from "./extractTopics";

vi.mock("./getFilesToSearch");
vi.mock("./unpack");
vi.mock("./extractTopics");
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
    filesToSearch: "**/*.smmx"
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

    await search(mockConfig, "test");

    expect(console.log).toHaveBeenCalledWith("Searching for: test");
    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file.smmx contains search string "test" 2 times'
    );
    expect(console.log).toHaveBeenCalledWith(
      "  Created: 2024-01-01T00:00:00.000Z, Modified: 2024-01-02T00:00:00.000Z"
    );
    expect(console.log).toHaveBeenCalledWith("  - This is a test");
    expect(console.log).toHaveBeenCalledWith("  - Another test here");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 2");
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

    await search(mockConfig, "test");

    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file.smmx contains search string "test" 3 times'
    );
    expect(console.log).toHaveBeenCalledWith(
      "  Created: 2024-01-01T00:00:00.000Z, Modified: 2024-01-02T00:00:00.000Z"
    );
    expect(console.log).toHaveBeenCalledWith("Total matches found: 3");
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

    await search(mockConfig, "missing");

    expect(console.log).toHaveBeenCalledWith("Searching for: missing");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 0");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("contains search string")
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

    await search(mockConfig, "found");

    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file1.smmx contains search string "found" 1 times'
    );
    expect(console.log).toHaveBeenCalledWith(
      "  Created: 2024-01-01T00:00:00.000Z, Modified: 2024-01-02T00:00:00.000Z"
    );
    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file2.smmx contains search string "found" 1 times'
    );
    expect(console.log).toHaveBeenCalledWith("Total matches found: 2");
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

    await search(mockConfig, "test");

    expect(console.warn).toHaveBeenCalledWith("Invalid file");
    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/good.smmx contains search string "test" 1 times'
    );
    expect(console.log).toHaveBeenCalledWith(
      "  Created: 2024-01-01T00:00:00.000Z, Modified: 2024-01-02T00:00:00.000Z"
    );
    expect(console.log).toHaveBeenCalledWith("Total matches found: 1");
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

    await search(mockConfig, "Line");

    expect(console.log).toHaveBeenCalledWith(
      "  Created: 2024-01-01T00:00:00.000Z, Modified: 2024-01-02T00:00:00.000Z"
    );
    expect(console.log).toHaveBeenCalledWith("  - Line one Line two");
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

    await search(mockConfig, "found");

    expect(console.log).toHaveBeenCalledWith(
      "  Created: 2024-01-01T00:00:00.000Z, Modified: 2024-01-02T00:00:00.000Z"
    );
    expect(console.log).toHaveBeenCalledWith("Total matches found: 1");
  });

  it("should handle empty file list", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([]);

    await search(mockConfig, "test");

    expect(console.log).toHaveBeenCalledWith("Searching for: test");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 0");
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

    await search(mockConfig, "link");

    expect(console.log).toHaveBeenCalledWith("  - Check this link");
    expect(console.log).toHaveBeenCalledWith("    URL: https://example.com");
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

    await search(mockConfig, "links");

    expect(console.log).toHaveBeenCalledWith("  - Multiple links");
    expect(console.log).toHaveBeenCalledWith("    URL: https://example.org");
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

    await search(mockConfig, "URL");

    expect(console.log).toHaveBeenCalledWith("  - No URL here");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("URL:")
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

    await search(mockConfig, "task");

    expect(console.log).toHaveBeenCalledWith("  - Complete task");
    expect(console.log).toHaveBeenCalledWith("    Done: ✓");
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

    await search(mockConfig, "task");

    expect(console.log).toHaveBeenCalledWith("  - Incomplete task");
    expect(console.log).toHaveBeenCalledWith("    Done: ✗");
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

    await search(mockConfig, "checkbox");

    expect(console.log).toHaveBeenCalledWith("  - Not a checkbox");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("Done:")
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

    await search(mockConfig, "disabled");

    expect(console.log).toHaveBeenCalledWith("  - Checkbox disabled");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("Done:")
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

    await search(mockConfig, "progress");

    expect(console.log).toHaveBeenCalledWith("  - No progress");
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining("Done:")
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

    await search(mockConfig, "Task");

    expect(console.log).toHaveBeenCalledWith("  - Task with link");
    expect(console.log).toHaveBeenCalledWith("    URL: https://example.com");
    expect(console.log).toHaveBeenCalledWith("    Done: ✓");
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

    await search(mockConfig, "test");

    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file.smmx contains search string "test" 1 times'
    );
    expect(console.log).toHaveBeenCalledWith("  - Another test here");
    expect(console.log).not.toHaveBeenCalledWith("  - This is a Test");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 1");
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

    await search(mockConfig, "test", true);

    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file.smmx contains search string "test" 3 times'
    );
    expect(console.log).toHaveBeenCalledWith("  - This is a Test");
    expect(console.log).toHaveBeenCalledWith("  - Another test here");
    expect(console.log).toHaveBeenCalledWith("  - TEST in capitals");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 3");
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

    await search(mockConfig, "$100");

    expect(console.log).toHaveBeenCalledWith(
      'File /path/to/file.smmx contains search string "$100" 1 times'
    );
    expect(console.log).toHaveBeenCalledWith("  - Price: $100 (sale)");
    expect(console.log).not.toHaveBeenCalledWith("  - Regular price: 100");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 1");
  });
});
