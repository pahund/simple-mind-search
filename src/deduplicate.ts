import type { SearchResult } from "./printResults";
import { areItemsEqual } from "./areItemsEqual";

export interface DeduplicatedResult {
  text: string;
  notes?: string[];
  url?: string;
  file: string;
  createdAt: Date;
  modifiedAt: Date;
  done?: boolean;
  date?: Date;
}

export function deduplicate(results: SearchResult[]): DeduplicatedResult[] {
  const deduplicatedMap = new Map<string, DeduplicatedResult>();

  for (const result of results) {
    let foundKey: string | undefined;

    for (const [key, dedupResult] of deduplicatedMap.entries()) {
      const existingResult: SearchResult = {
        file: dedupResult.file,
        createdAt: dedupResult.createdAt,
        modifiedAt: dedupResult.modifiedAt,
        match: {
          text: dedupResult.text,
          notes: dedupResult.notes,
          url: dedupResult.url,
          done: dedupResult.done,
          date: dedupResult.date
        }
      };

      if (areItemsEqual(result, existingResult)) {
        foundKey = key;
        break;
      }
    }

    const key =
      foundKey ??
      `${result.match.text}|${result.match.notes?.join("|") ?? ""}|${result.match.url ?? ""}`;

    if (deduplicatedMap.has(key)) {
      const existing = deduplicatedMap.get(key)!;

      const oldestCreatedAt =
        result.createdAt < existing.createdAt
          ? result.createdAt
          : existing.createdAt;

      const latestModifiedAt =
        result.modifiedAt > existing.modifiedAt
          ? result.modifiedAt
          : existing.modifiedAt;

      const useCurrentResult = result.modifiedAt > existing.modifiedAt;

      deduplicatedMap.set(key, {
        text: result.match.text,
        notes: result.match.notes,
        url: result.match.url,
        file: useCurrentResult ? result.file : existing.file,
        createdAt: oldestCreatedAt,
        modifiedAt: latestModifiedAt,
        done: useCurrentResult ? result.match.done : existing.done,
        date: useCurrentResult ? result.match.date : existing.date
      });
    } else {
      deduplicatedMap.set(key, {
        text: result.match.text,
        notes: result.match.notes,
        url: result.match.url,
        file: result.file,
        createdAt: result.createdAt,
        modifiedAt: result.modifiedAt,
        done: result.match.done,
        date: result.match.date
      });
    }
  }

  return Array.from(deduplicatedMap.values());
}
