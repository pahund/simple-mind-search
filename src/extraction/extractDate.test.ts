import { describe, it, expect } from "vitest";
import { extractDate } from "./extractDate";
import type { Topic } from "../types";

describe("extractDate", () => {
  it("should extract valid date in DD-MM-YYYY format", () => {
    const topic: Topic = {
      "@_date": "24-12-2025"
    };
    const result = extractDate(topic);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(11);
    expect(result?.getDate()).toBe(24);
  });

  it("should return undefined when no date attribute", () => {
    const topic: Topic = {};
    expect(extractDate(topic)).toBeUndefined();
  });

  it("should handle YYYY-MM-DD format by parsing year as day", () => {
    const topic: Topic = {
      "@_date": "2025-12-24"
    };
    const result = extractDate(topic);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(1930);
  });

  it("should parse date with day 32 as next month", () => {
    const topic: Topic = {
      "@_date": "32-12-2025"
    };
    const result = extractDate(topic);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getMonth()).toBe(0);
  });

  it("should return undefined for non-string date", () => {
    const topic: Topic = {
      "@_date": 12345 as unknown as string
    };
    expect(extractDate(topic)).toBeUndefined();
  });

  it("should return undefined for date with wrong number of parts", () => {
    const topic: Topic = {
      "@_date": "24-12"
    };
    expect(extractDate(topic)).toBeUndefined();
  });

  it("should return undefined for date with non-numeric parts", () => {
    const topic: Topic = {
      "@_date": "aa-bb-cccc"
    };
    expect(extractDate(topic)).toBeUndefined();
  });

  it("should handle valid date with single digit day and month", () => {
    const topic: Topic = {
      "@_date": "5-3-2025"
    };
    const result = extractDate(topic);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2025);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(5);
  });
});
