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
    MIND_MAPS_DIR: "~/Documents/Mind Maps",
    FILES_TO_SEARCH: "**/*.smmx"
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

    expect(console.log).toHaveBeenCalledWith("Total matches found: 1");
  });

  it("should handle empty file list", async () => {
    vi.mocked(getFilesToSearch).mockResolvedValue([]);

    await search(mockConfig, "test");

    expect(console.log).toHaveBeenCalledWith("Searching for: test");
    expect(console.log).toHaveBeenCalledWith("Total matches found: 0");
  });
});
