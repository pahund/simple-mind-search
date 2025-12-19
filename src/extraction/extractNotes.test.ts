import { describe, it, expect } from "vitest";
import { extractNotes } from "./extractNotes";
import type { Topic } from "../types";

describe("extractNotes", () => {
  it("should extract note from single text node with object note", () => {
    const topic: Topic = {
      children: {
        text: {
          note: {
            "#text": "This is a note"
          }
        }
      }
    };
    expect(extractNotes(topic)).toEqual(["This is a note"]);
  });

  it("should extract note from single text node with string note", () => {
    const topic: Topic = {
      children: {
        text: {
          note: "Simple string note"
        }
      }
    };
    expect(extractNotes(topic)).toEqual(["Simple string note"]);
  });

  it("should extract notes from multiple text nodes", () => {
    const topic: Topic = {
      children: {
        text: [
          { note: { "#text": "First note" } },
          { note: { "#text": "Second note" } },
          { note: "Third note" }
        ]
      }
    };
    expect(extractNotes(topic)).toEqual([
      "First note",
      "Second note",
      "Third note"
    ]);
  });

  it("should return empty array when no children", () => {
    const topic: Topic = {};
    expect(extractNotes(topic)).toEqual([]);
  });

  it("should return empty array when no text nodes", () => {
    const topic: Topic = {
      children: {}
    };
    expect(extractNotes(topic)).toEqual([]);
  });

  it("should skip text nodes without note", () => {
    const topic: Topic = {
      children: {
        text: [{ note: { "#text": "Has note" } }, { otherProp: "value" }]
      }
    };
    expect(extractNotes(topic)).toEqual(["Has note"]);
  });

  it("should handle note object without #text", () => {
    const topic: Topic = {
      children: {
        text: {
          note: {
            "@_textfmt": "plain"
          }
        }
      }
    };
    expect(extractNotes(topic)).toEqual([]);
  });

  it("should handle multiline notes", () => {
    const topic: Topic = {
      children: {
        text: {
          note: {
            "#text": "Line one\nLine two"
          }
        }
      }
    };
    expect(extractNotes(topic)).toEqual(["Line one\nLine two"]);
  });
});
