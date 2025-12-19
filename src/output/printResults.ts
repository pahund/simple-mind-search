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
  locale
}: {
  results: DeduplicatedResult[];
  locale: string;
}): void {
  for (const result of results) {
    console.log(`File: ${result.file}`);
    console.log(
      `  Created: ${result.createdAt.toLocaleString(locale)}, Modified: ${result.modifiedAt.toLocaleString(locale)}`
    );
    console.log(`  - ${result.text.replace(/\\N/g, " ")}`);
    if (result.url) {
      console.log(`    URL: ${result.url}`);
    }
    if (result.done !== undefined) {
      console.log(`    Done: ${result.done ? "✓" : "✗"}`);
    }
    if (result.date instanceof Date) {
      console.log(`    Date: ${result.date.toLocaleDateString(locale)}`);
    }
    if (result.notes && result.notes.length > 0) {
      console.log("    Notes:");
      for (const note of result.notes) {
        console.log(`    - ${note.replace(/\n/g, " ")}`);
      }
    }
  }
}
