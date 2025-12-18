import { countMatches } from "./countMatches";
import { extractDoneStatus } from "./extractDoneStatus";
import { extractNotes } from "./extractNotes";
import { extractUrl } from "./extractUrl";
import type { Topic } from "./types";

export type { Topic } from "./types";

export interface MatchedText {
  text: string;
  url?: string;
  done?: boolean;
  notes?: string[];
}

export interface FindMatchesResult {
  matchedTexts: MatchedText[];
  numberOfMatches: number;
}

export function findMatches(
  topics: Topic[],
  searchString: string,
  ignoreCase = false
): FindMatchesResult {
  let numberOfMatches = 0;
  const matchedTexts: MatchedText[] = [];

  const tokens = searchString
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return { matchedTexts, numberOfMatches };
  }

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
      for (const token of tokens) {
        numberOfMatches += countMatches(text, token, ignoreCase);

        for (const note of notes) {
          numberOfMatches += countMatches(note, token, ignoreCase);
        }
      }

      const url = extractUrl(topic);
      const done = extractDoneStatus(topic);

      matchedTexts.push({ text, url, done, notes });
    }
  }

  return { matchedTexts, numberOfMatches };
}
