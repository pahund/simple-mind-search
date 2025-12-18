import { describe, it, expect } from "vitest";
import { findMatches, type Topic } from "./findMatches";

describe("findMatches", () => {
  it("should find matches in topic text", () => {
    const topics: Topic[] = [
      { "@_text": "This is a test" },
      { "@_text": "Another test here" }
    ];

    const result = findMatches(topics, "test");

    expect(result.numberOfMatches).toBe(2);
    expect(result.matchedTexts).toHaveLength(2);
    expect(result.matchedTexts[0].text).toBe("This is a test");
    expect(result.matchedTexts[1].text).toBe("Another test here");
  });

  it("should find matches in notes", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with notes",
        children: {
          text: {
            note: {
              "#text": "This is a test note"
            }
          }
        }
      }
    ];

    const result = findMatches(topics, "test");

    expect(result.numberOfMatches).toBe(1);
    expect(result.matchedTexts).toHaveLength(1);
    expect(result.matchedTexts[0].text).toBe("Topic with notes");
    expect(result.matchedTexts[0].notes).toEqual(["This is a test note"]);
  });

  it("should handle case-insensitive search", () => {
    const topics: Topic[] = [
      { "@_text": "This is a Test" },
      { "@_text": "Another TEST here" }
    ];

    const result = findMatches(topics, "test", true);

    expect(result.numberOfMatches).toBe(2);
    expect(result.matchedTexts).toHaveLength(2);
  });

  it("should count multiple matches in single text", () => {
    const topics: Topic[] = [{ "@_text": "test test test" }];

    const result = findMatches(topics, "test");

    expect(result.numberOfMatches).toBe(3);
    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should extract URL from topic", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with link",
        link: { "@_urllink": "https://example.com" }
      }
    ];

    const result = findMatches(topics, "link");

    expect(result.matchedTexts[0].url).toBe("https://example.com");
  });

  it("should extract done status from checkbox topic", () => {
    const topics: Topic[] = [
      {
        "@_text": "Complete task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      }
    ];

    const result = findMatches(topics, "task");

    expect(result.matchedTexts[0].done).toBe(true);
  });

  it("should extract incomplete status from checkbox topic", () => {
    const topics: Topic[] = [
      {
        "@_text": "Incomplete task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      }
    ];

    const result = findMatches(topics, "task");

    expect(result.matchedTexts[0].done).toBe(false);
  });

  it("should handle topics without @_text", () => {
    const topics: Topic[] = [{ someOtherProp: "value" }, { "@_text": "found" }];

    const result = findMatches(topics, "found");

    expect(result.numberOfMatches).toBe(1);
    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should handle notes as strings", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with string note",
        children: {
          text: {
            note: "Simple string note with test"
          }
        }
      }
    ];

    const result = findMatches(topics, "test");

    expect(result.numberOfMatches).toBe(1);
    expect(result.matchedTexts[0].notes).toEqual([
      "Simple string note with test"
    ]);
  });

  it("should handle multiple notes in array", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with test in text",
        children: {
          text: [
            { note: { "#text": "First note" } },
            { note: { "#text": "Second note" } }
          ]
        }
      }
    ];

    const result = findMatches(topics, "test");

    expect(result.matchedTexts[0].notes).toEqual(["First note", "Second note"]);
  });

  it("should count matches in both text and notes", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with test",
        children: {
          text: {
            note: { "#text": "Note with test" }
          }
        }
      }
    ];

    const result = findMatches(topics, "test");

    expect(result.numberOfMatches).toBe(2);
  });

  it("should handle topics with link array", () => {
    const topics: Topic[] = [
      {
        "@_text": "Multiple links",
        link: [
          { "@_otherattr": "value" },
          { "@_urllink": "https://example.org" }
        ]
      }
    ];

    const result = findMatches(topics, "links");

    expect(result.matchedTexts[0].url).toBe("https://example.org");
  });

  it("should handle special regex characters in search string", () => {
    const topics: Topic[] = [
      { "@_text": "Price: $100 (sale)" },
      { "@_text": "Regular price: 100" }
    ];

    const result = findMatches(topics, "$100");

    expect(result.numberOfMatches).toBe(1);
    expect(result.matchedTexts).toHaveLength(1);
    expect(result.matchedTexts[0].text).toBe("Price: $100 (sale)");
  });

  it("should return empty result when no matches found", () => {
    const topics: Topic[] = [{ "@_text": "No match here" }];

    const result = findMatches(topics, "missing");

    expect(result.numberOfMatches).toBe(0);
    expect(result.matchedTexts).toHaveLength(0);
  });

  it("should not include done status when not a checkbox", () => {
    const topics: Topic[] = [
      {
        "@_text": "Not a checkbox",
        "@_checkbox-mode": "other",
        "@_checkbox": "true",
        "@_progress": "100"
      }
    ];

    const result = findMatches(topics, "checkbox");

    expect(result.matchedTexts[0].done).toBeUndefined();
  });

  it("should match when all tokens are found in text", () => {
    const topics: Topic[] = [{ "@_text": "Hello world from test" }];

    const result = findMatches(topics, "Hello test");

    expect(result.matchedTexts).toHaveLength(1);
    expect(result.numberOfMatches).toBe(2);
  });

  it("should match when tokens are split across text and notes", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic about Anna",
        children: {
          text: {
            note: { "#text": "Her name is Julia" }
          }
        }
      }
    ];

    const result = findMatches(topics, "Anna Julia");

    expect(result.matchedTexts).toHaveLength(1);
    expect(result.matchedTexts[0].text).toBe("Topic about Anna");
  });

  it("should not match when tokens are in different topics", () => {
    const topics: Topic[] = [
      { "@_text": "Topic about Anna" },
      { "@_text": "Topic about Julia" }
    ];

    const result = findMatches(topics, "Anna Julia");

    expect(result.matchedTexts).toHaveLength(0);
    expect(result.numberOfMatches).toBe(0);
  });

  it("should handle multiple spaces between tokens", () => {
    const topics: Topic[] = [{ "@_text": "Hello world from test" }];

    const result = findMatches(topics, "Hello    test");

    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should handle leading and trailing spaces", () => {
    const topics: Topic[] = [{ "@_text": "Hello world from test" }];

    const result = findMatches(topics, "  Hello test  ");

    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should return empty result for empty search string", () => {
    const topics: Topic[] = [{ "@_text": "Hello world" }];

    const result = findMatches(topics, "");

    expect(result.matchedTexts).toHaveLength(0);
    expect(result.numberOfMatches).toBe(0);
  });

  it("should return empty result for whitespace-only search string", () => {
    const topics: Topic[] = [{ "@_text": "Hello world" }];

    const result = findMatches(topics, "   ");

    expect(result.matchedTexts).toHaveLength(0);
    expect(result.numberOfMatches).toBe(0);
  });

  it("should count all token matches in text and notes", () => {
    const topics: Topic[] = [
      {
        "@_text": "test test world",
        children: {
          text: {
            note: { "#text": "test world world" }
          }
        }
      }
    ];

    const result = findMatches(topics, "test world");

    expect(result.numberOfMatches).toBe(6);
  });

  it("should handle case-insensitive tokenized search", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic about ANNA",
        children: {
          text: {
            note: { "#text": "Her name is julia" }
          }
        }
      }
    ];

    const result = findMatches(topics, "anna JULIA", true);

    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should match exact phrase when exactPhrase is true", () => {
    const topics: Topic[] = [
      {
        "@_text": "This is a complete phrase here"
      }
    ];

    const result = findMatches(topics, "complete phrase", false, true);

    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should not match split tokens as exact phrase", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic about Anna",
        children: {
          text: {
            note: { "#text": "Her name is Julia" }
          }
        }
      }
    ];

    const result = findMatches(topics, "Anna Julia", false, true);

    expect(result.matchedTexts).toHaveLength(0);
  });

  it("should match exact phrase in notes", () => {
    const topics: Topic[] = [
      {
        "@_text": "Some topic",
        children: {
          text: {
            note: { "#text": "This contains exact phrase here" }
          }
        }
      }
    ];

    const result = findMatches(topics, "exact phrase", false, true);

    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should handle case-insensitive exact phrase search", () => {
    const topics: Topic[] = [
      {
        "@_text": "This contains EXACT PHRASE"
      }
    ];

    const result = findMatches(topics, "exact phrase", true, true);

    expect(result.matchedTexts).toHaveLength(1);
  });

  it("should match exact phrase across text but not across text and notes", () => {
    const topics: Topic[] = [
      {
        "@_text": "Anna is here",
        children: {
          text: {
            note: { "#text": "Julia is there" }
          }
        }
      }
    ];

    const resultExact = findMatches(topics, "Anna Julia", false, true);
    expect(resultExact.matchedTexts).toHaveLength(0);

    const resultTokens = findMatches(topics, "Anna Julia", false, false);
    expect(resultTokens.matchedTexts).toHaveLength(1);
  });
});
