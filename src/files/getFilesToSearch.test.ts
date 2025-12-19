import { describe, it, expect, vi, beforeEach } from "vitest";
import * as os from "os";
import * as fs from "fs/promises";
import fg from "fast-glob";
import { getFilesToSearch } from "./getFilesToSearch";

vi.mock("os");
vi.mock("fs/promises");
vi.mock("fast-glob");

describe("getFilesToSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should expand tilde in MIND_MAPS_DIR", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fg).mockResolvedValue([]);

    await getFilesToSearch({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB"
    });

    expect(fg).toHaveBeenCalledWith("**/*.smmx", {
      cwd: "/home/user/Documents/Mind Maps",
      absolute: true
    });
  });

  it("should call fast-glob with correct parameters", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fg).mockResolvedValue([]);

    await getFilesToSearch({
      mindMapsDir: "/path/to/mind-maps",
      filesToSearch: "*.smmx",
      locale: "en-GB"
    });

    expect(fg).toHaveBeenCalledWith("*.smmx", {
      cwd: "/path/to/mind-maps",
      absolute: true
    });
  });

  it("should return files found by fast-glob with metadata", async () => {
    const mockFiles = [
      "/home/user/Documents/Mind Maps/file1.smmx",
      "/home/user/Documents/Mind Maps/file2.smmx"
    ];
    const mockStats = {
      birthtime: new Date("2024-01-01"),
      mtime: new Date("2024-01-02")
    };
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fg).mockResolvedValue(mockFiles);
    vi.mocked(fs.stat).mockResolvedValue(mockStats as never);

    const result = await getFilesToSearch({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB"
    });

    expect(result).toEqual([
      {
        path: "/home/user/Documents/Mind Maps/file1.smmx",
        createdAt: mockStats.birthtime,
        modifiedAt: mockStats.mtime
      },
      {
        path: "/home/user/Documents/Mind Maps/file2.smmx",
        createdAt: mockStats.birthtime,
        modifiedAt: mockStats.mtime
      }
    ]);
  });

  it("should return empty array when no files found", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fg).mockResolvedValue([]);

    const result = await getFilesToSearch({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB"
    });

    expect(result).toEqual([]);
  });

  it("should handle complex glob patterns", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fg).mockResolvedValue([
      "/home/user/Documents/Mind Maps/test.smmx"
    ]);

    await getFilesToSearch({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/My Project*.smmx",
      locale: "en-GB"
    });

    expect(fg).toHaveBeenCalledWith("**/My Project*.smmx", {
      cwd: "/home/user/Documents/Mind Maps",
      absolute: true
    });
  });

  it("should not modify MIND_MAPS_DIR without tilde", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fg).mockResolvedValue([]);

    await getFilesToSearch({
      mindMapsDir: "/absolute/path/to/mind-maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB"
    });

    expect(fg).toHaveBeenCalledWith("**/*.smmx", {
      cwd: "/absolute/path/to/mind-maps",
      absolute: true
    });
  });
});
