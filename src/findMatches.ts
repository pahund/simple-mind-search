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

  for (const topic of topics) {
    const text = topic["@_text"];
    if (typeof text !== "string") {
      continue;
    }

    const notes = extractNotes(topic);

    const matchFoundInText = ignoreCase
      ? text.toLowerCase().includes(searchString.toLowerCase())
      : text.includes(searchString);

    let matchFoundInNotes = false;
    for (const note of notes) {
      const noteMatchFound = ignoreCase
        ? note.toLowerCase().includes(searchString.toLowerCase())
        : note.includes(searchString);
      if (noteMatchFound) {
        matchFoundInNotes = true;
        break;
      }
    }

    const matchFound = matchFoundInText || matchFoundInNotes;

    if (matchFound) {
      numberOfMatches += countMatches(text, searchString, ignoreCase);

      for (const note of notes) {
        numberOfMatches += countMatches(note, searchString, ignoreCase);
      }

      const url = extractUrl(topic);
      const done = extractDoneStatus(topic);

      matchedTexts.push({ text, url, done, notes });
    }
  }

  return { matchedTexts, numberOfMatches };
}
