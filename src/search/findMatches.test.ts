import { describe, it, expect } from "vitest";
import { findMatches, type Topic } from "./findMatches";

describe("findMatches", () => {
  it("should find matches in topic text", () => {
    const topics: Topic[] = [
      { "@_text": "This is a test" },
      { "@_text": "Another test here" }
    ];

    const result = findMatches({ topics, searchString: "test" });

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("This is a test");
    expect(result[1].text).toBe("Another test here");
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

    const result = findMatches({ topics, searchString: "test" });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Topic with notes");
    expect(result[0].notes).toEqual(["This is a test note"]);
  });

  it("should handle case-insensitive search", () => {
    const topics: Topic[] = [
      { "@_text": "This is a Test" },
      { "@_text": "Another TEST here" }
    ];

    const result = findMatches({
      topics,
      searchString: "test",
      ignoreCase: true
    });

    expect(result).toHaveLength(2);
  });

  it("should find topics with multiple matches in single text", () => {
    const topics: Topic[] = [{ "@_text": "test test test" }];

    const result = findMatches({ topics, searchString: "test" });

    expect(result).toHaveLength(1);
  });

  it("should extract URL from topic", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with link",
        link: { "@_urllink": "https://example.com" }
      }
    ];

    const result = findMatches({ topics, searchString: "link" });

    expect(result[0].url).toBe("https://example.com");
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

    const result = findMatches({ topics, searchString: "task" });

    expect(result[0].done).toBe(true);
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

    const result = findMatches({ topics, searchString: "task" });

    expect(result[0].done).toBe(false);
  });

  it("should handle topics without @_text", () => {
    const topics: Topic[] = [{ someOtherProp: "value" }, { "@_text": "found" }];

    const result = findMatches({ topics, searchString: "found" });

    expect(result).toHaveLength(1);
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

    const result = findMatches({ topics, searchString: "test" });

    expect(result).toHaveLength(1);
    expect(result[0].notes).toEqual(["Simple string note with test"]);
  });

  it("should only include notes that match search terms", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with test in text",
        children: {
          text: [
            { note: { "#text": "First note with test" } },
            { note: { "#text": "Second note without match" } },
            { note: { "#text": "Third note with test" } }
          ]
        }
      }
    ];

    const result = findMatches({ topics, searchString: "test" });

    expect(result[0].notes).toEqual([
      "First note with test",
      "Third note with test"
    ]);
  });

  it("should find matches in both text and notes", () => {
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

    const result = findMatches({ topics, searchString: "test" });

    expect(result).toHaveLength(1);
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

    const result = findMatches({ topics, searchString: "links" });

    expect(result[0].url).toBe("https://example.org");
  });

  it("should handle special regex characters in search string", () => {
    const topics: Topic[] = [
      { "@_text": "Price: $100 (sale)" },
      { "@_text": "Regular price: 100" }
    ];

    const result = findMatches({ topics, searchString: "$100" });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Price: $100 (sale)");
  });

  it("should return empty result when no matches found", () => {
    const topics: Topic[] = [{ "@_text": "No match here" }];

    const result = findMatches({ topics, searchString: "missing" });

    expect(result).toHaveLength(0);
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

    const result = findMatches({ topics, searchString: "checkbox" });

    expect(result[0].done).toBeUndefined();
  });

  it("should match when all tokens are found in text", () => {
    const topics: Topic[] = [{ "@_text": "Hello world from test" }];

    const result = findMatches({ topics, searchString: "Hello test" });

    expect(result).toHaveLength(1);
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

    const result = findMatches({ topics, searchString: "Anna Julia" });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Topic about Anna");
  });

  it("should not match when tokens are in different topics", () => {
    const topics: Topic[] = [
      { "@_text": "Topic about Anna" },
      { "@_text": "Topic about Julia" }
    ];

    const result = findMatches({ topics, searchString: "Anna Julia" });

    expect(result).toHaveLength(0);
  });

  it("should handle multiple spaces between tokens", () => {
    const topics: Topic[] = [{ "@_text": "Hello world from test" }];

    const result = findMatches({ topics, searchString: "Hello    test" });

    expect(result).toHaveLength(1);
  });

  it("should handle leading and trailing spaces", () => {
    const topics: Topic[] = [{ "@_text": "Hello world from test" }];

    const result = findMatches({ topics, searchString: "  Hello test  " });

    expect(result).toHaveLength(1);
  });

  it("should return empty result for empty search string", () => {
    const topics: Topic[] = [{ "@_text": "Hello world" }];

    const result = findMatches({ topics, searchString: "" });

    expect(result).toHaveLength(0);
  });

  it("should return empty result for whitespace-only search string", () => {
    const topics: Topic[] = [{ "@_text": "Hello world" }];

    const result = findMatches({ topics, searchString: "   " });

    expect(result).toHaveLength(0);
  });

  it("should find topics with all tokens in text and notes", () => {
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

    const result = findMatches({ topics, searchString: "test world" });

    expect(result).toHaveLength(1);
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

    const result = findMatches({
      topics,
      searchString: "anna JULIA",
      ignoreCase: true
    });

    expect(result).toHaveLength(1);
  });

  it("should match exact phrase when exactPhrase is true", () => {
    const topics: Topic[] = [
      {
        "@_text": "This is a complete phrase here"
      }
    ];

    const result = findMatches({
      topics,
      searchString: "complete phrase",
      ignoreCase: false,
      exactPhrase: true
    });

    expect(result).toHaveLength(1);
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

    const result = findMatches({
      topics,
      searchString: "Anna Julia",
      ignoreCase: false,
      exactPhrase: true
    });

    expect(result).toHaveLength(0);
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

    const result = findMatches({
      topics,
      searchString: "exact phrase",
      ignoreCase: false,
      exactPhrase: true
    });

    expect(result).toHaveLength(1);
  });

  it("should handle case-insensitive exact phrase search", () => {
    const topics: Topic[] = [
      {
        "@_text": "This contains EXACT PHRASE"
      }
    ];

    const result = findMatches({
      topics,
      searchString: "exact phrase",
      ignoreCase: true,
      exactPhrase: true
    });

    expect(result).toHaveLength(1);
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

    const resultExact = findMatches({
      topics,
      searchString: "Anna Julia",
      ignoreCase: false,
      exactPhrase: true
    });
    expect(resultExact).toHaveLength(0);

    const resultTokens = findMatches({
      topics,
      searchString: "Anna Julia",
      ignoreCase: false,
      exactPhrase: false
    });
    expect(resultTokens).toHaveLength(1);
  });

  it("should extract and include date from topic", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic with date",
        "@_date": "24-12-2025"
      }
    ];

    const result = findMatches({ topics, searchString: "date" });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].date?.getFullYear()).toBe(2025);
    expect(result[0].date?.getMonth()).toBe(11);
    expect(result[0].date?.getDate()).toBe(24);
  });

  it("should not include date when topic has no date", () => {
    const topics: Topic[] = [
      {
        "@_text": "Topic without date"
      }
    ];

    const result = findMatches({ topics, searchString: "Topic" });

    expect(result).toHaveLength(1);
    expect(result[0].date).toBeUndefined();
  });

  it("should filter to only unchecked todos when todo flag is true", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      },
      {
        "@_text": "Checked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "No checkbox task"
      }
    ];

    const result = findMatches({ topics, searchString: "task", todo: true });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Unchecked task");
    expect(result[0].done).toBe(false);
  });

  it("should include all matching topics when todo flag is false", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      },
      {
        "@_text": "Checked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "No checkbox task"
      }
    ];

    const result = findMatches({ topics, searchString: "task", todo: false });

    expect(result).toHaveLength(3);
  });

  it("should filter to only unchecked todos with exact phrase", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task with exact phrase",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "0"
      },
      {
        "@_text": "Checked task with exact phrase",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      }
    ];

    const result = findMatches({
      topics,
      searchString: "exact phrase",
      todo: true,
      exactPhrase: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Unchecked task with exact phrase");
  });

  it("should return empty result when no unchecked todos match", () => {
    const topics: Topic[] = [
      {
        "@_text": "Checked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "No checkbox task"
      }
    ];

    const result = findMatches({ topics, searchString: "task", todo: true });

    expect(result).toHaveLength(0);
  });

  it("should return all unchecked todos when searchString is empty and todo flag is true", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task one",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      },
      {
        "@_text": "Checked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "Unchecked task two",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "0"
      },
      {
        "@_text": "No checkbox"
      }
    ];

    const result = findMatches({ topics, searchString: "", todo: true });

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("Unchecked task one");
    expect(result[0].done).toBe(false);
    expect(result[1].text).toBe("Unchecked task two");
    expect(result[1].done).toBe(false);
  });

  it("should return empty result when searchString is empty and todo flag is false", () => {
    const topics: Topic[] = [
      { "@_text": "Regular topic" },
      {
        "@_text": "Unchecked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "0"
      }
    ];

    const result = findMatches({ topics, searchString: "", todo: false });

    expect(result).toHaveLength(0);
  });

  it("should include url, date, and notes for todos with empty searchString", () => {
    const topics: Topic[] = [
      {
        "@_text": "Task with metadata",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "25",
        "@_date": "01-01-2026",
        link: { "@_urllink": "https://example.com" },
        children: {
          text: {
            note: { "#text": "Important note" }
          }
        }
      }
    ];

    const result = findMatches({ topics, searchString: "", todo: true });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Task with metadata");
    expect(result[0].url).toBe("https://example.com");
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].notes).toEqual(["Important note"]);
  });

  it("should filter to only checked tasks when done flag is true", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      },
      {
        "@_text": "Checked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "No checkbox task"
      }
    ];

    const result = findMatches({ topics, searchString: "task", done: true });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Checked task");
    expect(result[0].done).toBe(true);
  });

  it("should filter to only checked tasks with exact phrase", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task with exact phrase",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "0"
      },
      {
        "@_text": "Checked task with exact phrase",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      }
    ];

    const result = findMatches({
      topics,
      searchString: "exact phrase",
      done: true,
      exactPhrase: true
    });

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Checked task with exact phrase");
  });

  it("should return empty result when no checked tasks match", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      },
      {
        "@_text": "No checkbox task"
      }
    ];

    const result = findMatches({ topics, searchString: "task", done: true });

    expect(result).toHaveLength(0);
  });

  it("should return all checked tasks when searchString is empty and done flag is true", () => {
    const topics: Topic[] = [
      {
        "@_text": "Unchecked task",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "50"
      },
      {
        "@_text": "Checked task one",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "Checked task two",
        "@_checkbox-mode": "checkbox",
        "@_checkbox": "true",
        "@_progress": "100"
      },
      {
        "@_text": "No checkbox"
      }
    ];

    const result = findMatches({ topics, searchString: "", done: true });

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("Checked task one");
    expect(result[0].done).toBe(true);
    expect(result[1].text).toBe("Checked task two");
    expect(result[1].done).toBe(true);
  });
});
