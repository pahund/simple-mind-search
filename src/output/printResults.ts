import type { Match } from "../search";
import type { DeduplicatedResult } from "../deduplication";

export interface SearchResult {
  file: string;
  createdAt: Date;
  modifiedAt: Date;
  match: Match;
}

export function printResults({
  results,
  locale,
  timeZone
}: {
  results: DeduplicatedResult[];
  locale: string;
  timeZone: string;
}): void {
  for (const result of results) {
    console.log(`File: ${result.file}`);
    console.log(
      `  Created: ${result.createdAt.toLocaleString(locale, { timeZone })}, Modified: ${result.modifiedAt.toLocaleString(locale, { timeZone })}`
    );
    console.log(`  - ${result.text.replace(/\\N/g, " ")}`);
    if (result.url) {
      console.log(`    URL: ${result.url}`);
    }
    if (result.done !== undefined) {
      console.log(`    Done: ${result.done ? "✓" : "✗"}`);
    }
    if (result.date instanceof Date) {
      console.log(
        `    Date: ${result.date.toLocaleDateString(locale, { timeZone })}`
      );
    }
    if (result.notes && result.notes.length > 0) {
      console.log("    Notes:");
      for (const note of result.notes) {
        console.log(`    - ${note.replace(/\n/g, " ")}`);
      }
    }
  }
}
