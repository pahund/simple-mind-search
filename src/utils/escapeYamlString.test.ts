import { describe, it, expect } from "vitest";
import { escapeYamlString } from "./escapeYamlString";

describe("escapeYamlString", () => {
  it("should return string as-is when no special characters present", () => {
    expect(escapeYamlString("Hello world")).toBe("Hello world");
  });

  it("should escape string with colon", () => {
    expect(escapeYamlString("Hello: world")).toBe('"Hello: world"');
  });

  it("should escape string with hash", () => {
    expect(escapeYamlString("Hello #tag")).toBe('"Hello #tag"');
  });

  it("should escape string with single quote", () => {
    expect(escapeYamlString("It's working")).toBe('"It\'s working"');
  });

  it("should not escape string with only double quotes", () => {
    expect(escapeYamlString('He said "hello"')).toBe('He said "hello"');
  });

  it("should escape string with multiple special characters", () => {
    expect(escapeYamlString("URL: http://example.com #tag")).toBe(
      '"URL: http://example.com #tag"'
    );
  });

  it("should handle empty string", () => {
    expect(escapeYamlString("")).toBe("");
  });

  it("should escape URL with colon", () => {
    expect(escapeYamlString("https://example.com")).toBe(
      '"https://example.com"'
    );
  });
});
