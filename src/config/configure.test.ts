import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { configure } from "./configure";

vi.mock("fs");
vi.mock("os");
vi.mock("path");

describe("configure", () => {
  const mockHomedir = "/home/user";
  const mockConfigPath = "/home/user/.simple-mind-search.yml";
  const mockConfigContent =
    "mindMapsDir: ~/Documents/Mind Maps\nfilesToSearch: '**/*.smmx'\nlocale: 'en-GB'\ntimeZone: 'CET'";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHomedir);
    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should load existing config file successfully", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockConfigContent);

    const config = configure();

    expect(config).toEqual({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB",
      timeZone: "CET"
    });
    expect(fs.existsSync).toHaveBeenCalledWith(mockConfigPath);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockConfigPath, "utf-8");
  });

  it("should create config file from default when config does not exist", () => {
    const existsSyncCalls: string[] = [];
    vi.mocked(fs.existsSync).mockImplementation((filePath) => {
      existsSyncCalls.push(filePath as string);
      if (filePath === mockConfigPath) return false;
      return true;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(mockConfigContent);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const config = configure();

    expect(fs.copyFileSync).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Created new configuration file:")
    );
    expect(config).toEqual({
      mindMapsDir: "~/Documents/Mind Maps",
      filesToSearch: "**/*.smmx",
      locale: "en-GB",
      timeZone: "CET"
    });
  });

  it("should exit when default config file does not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(() => configure()).toThrow("process.exit: 1");
    expect(console.error).toHaveBeenCalledWith(
      "Default configuration file not found"
    );
  });

  it("should exit when required key is missing", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "mindMapsDir: ~/Documents/Mind Maps"
    );

    expect(() => configure()).toThrow("process.exit: 1");
    expect(console.error).toHaveBeenCalledWith(
      "Missing required configuration: filesToSearch"
    );
  });

  it("should log the final configuration", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(mockConfigContent);

    const config = configure(true);

    expect(console.log).toHaveBeenCalledWith("Using configuration:");
    expect(console.log).toHaveBeenCalledWith(config);
  });
});
