import type { DeduplicatedResult } from "../deduplication";

export function sort(results: DeduplicatedResult[]): DeduplicatedResult[] {
  return [...results].sort(
    (a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()
  );
}
