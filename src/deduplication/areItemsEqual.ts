import type { SearchResult } from "../types";
import { areNotesEqual } from "./areNotesEqual";

export function areItemsEqual(
  item1: SearchResult,
  item2: SearchResult
): boolean {
  return (
    item1.match.text === item2.match.text &&
    areNotesEqual(item1.match.notes, item2.match.notes) &&
    item1.match.url === item2.match.url
  );
}
