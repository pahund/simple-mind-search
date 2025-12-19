import { describe, it, expect, vi, beforeEach } from "vitest";
import AdmZip from "adm-zip";
import { unpack } from "./unpack";
import { MINDMAP_XML_PATH } from "../constants";

vi.mock("adm-zip", () => {
  return {
    default: vi.fn()
  };
});

describe("unpack", () => {
  const mockConfig = {
    mindMapsDir: "~/Documents/Mind Maps",
    filesToSearch: "**/*.smmx",
    locale: "en-GB"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully extract XML content from valid SimpleMind file", () => {
    const mockXmlContent = '<mindmap><topic text="Root"/></mindmap>';
    const mockEntry = { name: MINDMAP_XML_PATH };
    const mockZip = {
      getEntry: vi.fn().mockReturnValue(mockEntry),
      readAsText: vi.fn().mockReturnValue(mockXmlContent)
    };

    vi.mocked(AdmZip).mockImplementation(function (this: unknown) {
      return mockZip as unknown as AdmZip;
    });

    const result = unpack(mockConfig, "/path/to/file.smmx");

    expect(AdmZip).toHaveBeenCalledWith("/path/to/file.smmx");
    expect(mockZip.getEntry).toHaveBeenCalledWith(MINDMAP_XML_PATH);
    expect(mockZip.readAsText).toHaveBeenCalledWith(mockEntry);
    expect(result).toBe(mockXmlContent);
  });

  it("should throw error when mindmap.xml entry is not found", () => {
    const mockZip = {
      getEntry: vi.fn().mockReturnValue(null),
      readAsText: vi.fn()
    };

    vi.mocked(AdmZip).mockImplementation(function (this: unknown) {
      return mockZip as unknown as AdmZip;
    });

    expect(() => unpack(mockConfig, "/path/to/invalid.smmx")).toThrow(
      "This does not seem to be a SimpleMind file: /path/to/invalid.smmx"
    );

    expect(mockZip.getEntry).toHaveBeenCalledWith(MINDMAP_XML_PATH);
    expect(mockZip.readAsText).not.toHaveBeenCalled();
  });

  it("should handle different file paths correctly", () => {
    const mockXmlContent = "<mindmap/>";
    const mockEntry = { name: MINDMAP_XML_PATH };
    const mockZip = {
      getEntry: vi.fn().mockReturnValue(mockEntry),
      readAsText: vi.fn().mockReturnValue(mockXmlContent)
    };

    vi.mocked(AdmZip).mockImplementation(function (this: unknown) {
      return mockZip as unknown as AdmZip;
    });

    const filePath = "/Users/test/Documents/Mind Maps/My Mind Map.smmx";
    unpack(mockConfig, filePath);

    expect(AdmZip).toHaveBeenCalledWith(filePath);
  });
});
