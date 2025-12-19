import type { DeduplicatedResult } from "../deduplication";

export function sort(results: DeduplicatedResult[]): DeduplicatedResult[] {
  return [...results].sort((a, b) => {
    const modifiedDiff = b.modifiedAt.getTime() - a.modifiedAt.getTime();

    if (modifiedDiff !== 0) {
      return modifiedDiff;
    }

    const aLifetime = a.modifiedAt.getTime() - a.createdAt.getTime();
    const bLifetime = b.modifiedAt.getTime() - b.createdAt.getTime();

    return aLifetime - bLifetime;
  });
}
