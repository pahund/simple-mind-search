import { extractDate } from "./extractDate";
import { extractDoneStatus } from "./extractDoneStatus";
import { extractNotes } from "./extractNotes";
import { extractUrl } from "./extractUrl";
import type { Topic } from "./types";

export type { Topic } from "./types";

export interface MatchedText {
  text: string;
  url?: string;
  done?: boolean;
  date?: Date;
  notes?: string[];
}

export interface FindMatchesResult {
  matchedTexts: MatchedText[];
}

export interface FindMatchesParams {
  topics: Topic[];
  searchString: string;
  ignoreCase?: boolean;
  exactPhrase?: boolean;
}

export function findMatches({
  topics,
  searchString,
  ignoreCase = false,
  exactPhrase = false
}: FindMatchesParams): FindMatchesResult {
  const matchedTexts: MatchedText[] = [];

  if (searchString.trim().length === 0) {
    return { matchedTexts };
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

        matchedTexts.push({ text, url, done, date, notes });
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

        matchedTexts.push({ text, url, done, date, notes });
      }
    }
  }

  return { matchedTexts };
}
