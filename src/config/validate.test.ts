import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import { validate } from "./validate";
import { getFilesToSearch } from "../files/getFilesToSearch";

vi.mock("fs");
vi.mock("os");
vi.mock("../files/getFilesToSearch");

describe("validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error when MIND_MAPS_DIR does not exist", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await expect(
      validate({
        mindMapsDir: "~/Documents/Mind Maps",
        filesToSearch: "**/*.smmx",
        locale: "en-GB"
      })
    ).rejects.toThrow("mindMapsDir does not exist: ~/Documents/Mind Maps");
  });

  it("should throw error when no files found matching pattern", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(getFilesToSearch).mockResolvedValue([]);

    await expect(
      validate({
        mindMapsDir: "~/Documents/Mind Maps",
        filesToSearch: "**/*.smmx",
        locale: "en-GB"
      })
    ).rejects.toThrow(
      'No files found matching pattern "**/*.smmx" in ~/Documents/Mind Maps'
    );
  });

  it("should pass validation when directory exists and files are found", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "/home/user/Documents/Mind Maps/file1.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);

    await expect(
      validate({
        mindMapsDir: "~/Documents/Mind Maps",
        filesToSearch: "**/*.smmx",
        locale: "en-GB"
      })
    ).resolves.toBeUndefined();
  });

  it("should expand tilde in directory path", async () => {
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(getFilesToSearch).mockResolvedValue([
      {
        path: "file1.smmx",
        createdAt: new Date("2024-01-01"),
        modifiedAt: new Date("2024-01-02")
      }
    ]);

    await validate({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB"
    });

    expect(fs.existsSync).toHaveBeenCalledWith(
      "/home/user/Documents/Mind Maps"
    );
  });
});
