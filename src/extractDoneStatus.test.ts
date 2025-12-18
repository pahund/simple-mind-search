import { describe, it, expect } from "vitest";
import { extractDoneStatus } from "./extractDoneStatus";
import type { Topic } from "./types";

describe("extractDoneStatus", () => {
  it("should return true when checkbox is complete (progress=100)", () => {
    const topic: Topic = {
      "@_checkbox-mode": "checkbox",
      "@_checkbox": "true",
      "@_progress": "100"
    };
    expect(extractDoneStatus(topic)).toBe(true);
  });

  it("should return false when checkbox is incomplete (progress<100)", () => {
    const topic: Topic = {
      "@_checkbox-mode": "checkbox",
      "@_checkbox": "true",
      "@_progress": "50"
    };
    expect(extractDoneStatus(topic)).toBe(false);
  });

  it("should return undefined when checkbox-mode is not checkbox", () => {
    const topic: Topic = {
      "@_checkbox-mode": "other",
      "@_checkbox": "true",
      "@_progress": "100"
    };
    expect(extractDoneStatus(topic)).toBeUndefined();
  });

  it("should return undefined when checkbox is false", () => {
    const topic: Topic = {
      "@_checkbox-mode": "checkbox",
      "@_checkbox": "false",
      "@_progress": "100"
    };
    expect(extractDoneStatus(topic)).toBeUndefined();
  });

  it("should return undefined when progress is missing", () => {
    const topic: Topic = {
      "@_checkbox-mode": "checkbox",
      "@_checkbox": "true"
    };
    expect(extractDoneStatus(topic)).toBeUndefined();
  });

  it("should return undefined for non-checkbox topics", () => {
    const topic: Topic = {};
    expect(extractDoneStatus(topic)).toBeUndefined();
  });

  it("should handle progress=0 as incomplete", () => {
    const topic: Topic = {
      "@_checkbox-mode": "checkbox",
      "@_checkbox": "true",
      "@_progress": "0"
    };
    expect(extractDoneStatus(topic)).toBe(false);
  });
});
