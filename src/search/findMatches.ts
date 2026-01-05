import {
  extractDate,
  extractDoneStatus,
  extractNotes,
  extractUrl
} from "../extraction";
import type { Topic } from "../types";

export type { Topic } from "../types";

export interface Match {
  text: string;
  url?: string;
  done?: boolean;
  date?: Date;
  notes?: string[];
}

export interface FindMatchesParams {
  topics: Topic[];
  searchString: string;
  ignoreCase?: boolean;
  exactPhrase?: boolean;
  todo?: boolean;
}

export function findMatches({
  topics,
  searchString,
  ignoreCase = false,
  exactPhrase = false,
  todo = false
}: FindMatchesParams): Match[] {
  const matches: Match[] = [];

  // When todo flag is set and searchString is empty, return all topics with unchecked checkboxes
  if (searchString.trim().length === 0) {
    if (todo) {
      for (const topic of topics) {
        const text = topic["@_text"];
        if (typeof text !== "string") {
          continue;
        }

        const done = extractDoneStatus(topic);

        // Only include topics with unchecked checkboxes
        if (done === false) {
          const url = extractUrl(topic);
          const date = extractDate(topic);
          const notes = extractNotes(topic);

          matches.push({
            text,
            url,
            done,
            date,
            notes: notes.length > 0 ? notes : undefined
          });
        }
      }
    }
    return matches;
  }

  if (exactPhrase) {
    for (const topic of topics) {
      const text = topic["@_text"];
      if (typeof text !== "string") {
        continue;
      }

      const notes = extractNotes(topic);
      const allContent = [text, ...notes];

      const phraseFound = allContent.some((content) =>
        ignoreCase
          ? content.toLowerCase().includes(searchString.toLowerCase())
          : content.includes(searchString)
      );

      if (phraseFound) {
        const url = extractUrl(topic);
        const done = extractDoneStatus(topic);
        const date = extractDate(topic);

        // If todo flag is set, only include topics with unchecked checkboxes
        if (todo && done !== false) {
          continue;
        }

        const matchingNotes = notes.filter((note) =>
          ignoreCase
            ? note.toLowerCase().includes(searchString.toLowerCase())
            : note.includes(searchString)
        );

        matches.push({
          text,
          url,
          done,
          date,
          notes: matchingNotes.length > 0 ? matchingNotes : undefined
        });
      }
    }
  } else {
    const tokens = searchString
      .trim()
      .split(/\s+/)
      .filter((token) => token.length > 0);

    for (const topic of topics) {
      const text = topic["@_text"];
      if (typeof text !== "string") {
        continue;
      }

      const notes = extractNotes(topic);
      const allContent = [text, ...notes].join(" ");

      const allTokensFound = tokens.every((token) =>
        ignoreCase
          ? allContent.toLowerCase().includes(token.toLowerCase())
          : allContent.includes(token)
      );

      if (allTokensFound) {
        const url = extractUrl(topic);
        const done = extractDoneStatus(topic);
        const date = extractDate(topic);

        // If todo flag is set, only include topics with unchecked checkboxes
        if (todo && done !== false) {
          continue;
        }

        const matchingNotes = notes.filter((note) =>
          tokens.some((token) =>
            ignoreCase
              ? note.toLowerCase().includes(token.toLowerCase())
              : note.includes(token)
          )
        );

        matches.push({
          text,
          url,
          done,
          date,
          notes: matchingNotes.length > 0 ? matchingNotes : undefined
        });
      }
    }
  }

  return matches;
}
