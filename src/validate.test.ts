import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import { validate } from "./validate";
import { getFilesToSearch } from "./getFilesToSearch";

vi.mock("fs");
vi.mock("os");
vi.mock("./getFilesToSearch");

describe("validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error when MIND_MAPS_DIR does not exist", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await expect(
      validate({
        MIND_MAPS_DIR: "~/Documents/Mind Maps",
        FILES_TO_SEARCH: "**/*.smmx"
      })
    ).rejects.toThrow("MIND_MAPS_DIR does not exist: ~/Documents/Mind Maps");
  });

  it("should throw error when no files found matching pattern", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(getFilesToSearch).mockResolvedValue([]);

    await expect(
      validate({
        MIND_MAPS_DIR: "~/Documents/Mind Maps",
        FILES_TO_SEARCH: "**/*.smmx"
      })
    ).rejects.toThrow(
      'No files found matching pattern "**/*.smmx" in ~/Documents/Mind Maps'
    );
  });

  it("should pass validation when directory exists and files are found", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(getFilesToSearch).mockResolvedValue([
      "/home/user/Documents/Mind Maps/file1.smmx"
    ]);

    await expect(
      validate({
        MIND_MAPS_DIR: "~/Documents/Mind Maps",
        FILES_TO_SEARCH: "**/*.smmx"
      })
    ).resolves.toBeUndefined();
  });

  it("should expand tilde in directory path", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(getFilesToSearch).mockResolvedValue(["file1.smmx"]);

    await validate({
      MIND_MAPS_DIR: "~/Documents/Mind Maps",
      FILES_TO_SEARCH: "**/*.smmx"
    });

    expect(fs.existsSync).toHaveBeenCalledWith(
      "/home/user/Documents/Mind Maps"
    );
  });
});
