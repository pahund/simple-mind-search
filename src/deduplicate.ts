import type { SearchResult } from "./printResults";

export interface DeduplicatedResult {
  text: string;
  notes?: string[];
  url?: string;
  createdAt: Date;
  modifiedAt: Date;
  done?: boolean;
  date?: Date;
}

function areNotesEqual(
  notes1: string[] | undefined,
  notes2: string[] | undefined
): boolean {
  const array1 = notes1 ?? [];
  const array2 = notes2 ?? [];

  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

function areItemsEqual(item1: SearchResult, item2: SearchResult): boolean {
  return (
    item1.match.text === item2.match.text &&
    areNotesEqual(item1.match.notes, item2.match.notes) &&
    item1.match.url === item2.match.url
  );
}

export function deduplicate(results: SearchResult[]): DeduplicatedResult[] {
  const deduplicatedMap = new Map<string, DeduplicatedResult>();

  for (const result of results) {
    let foundKey: string | undefined;

    for (const [key, dedupResult] of deduplicatedMap.entries()) {
      const existingResult: SearchResult = {
        file: "",
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
        createdAt: result.createdAt,
        modifiedAt: result.modifiedAt,
        done: result.match.done,
        date: result.match.date
      });
    }
  }

  return Array.from(deduplicatedMap.values());
}
