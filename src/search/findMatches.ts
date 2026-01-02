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

  if (searchString.trim().length === 0) {
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
