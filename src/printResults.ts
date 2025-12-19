import type { Match } from "./findMatches";
import type { DeduplicatedResult } from "./deduplicate";

export interface SearchResult {
  file: string;
  createdAt: Date;
  modifiedAt: Date;
  match: Match;
}

export function printResults(results: DeduplicatedResult[]): void {
  for (const result of results) {
    console.log(`File: ${result.file}`);
    console.log(
      `  Created: ${result.createdAt.toISOString()}, Modified: ${result.modifiedAt.toISOString()}`
    );
    console.log(`  - ${result.text.replace(/\\N/g, " ")}`);
    if (result.url) {
      console.log(`    URL: ${result.url}`);
    }
    if (result.done !== undefined) {
      console.log(`    Done: ${result.done ? "✓" : "✗"}`);
    }
    if (result.date instanceof Date) {
      console.log(`    Date: ${result.date.toLocaleDateString()}`);
    }
    if (result.notes && result.notes.length > 0) {
      console.log("    Notes:");
      for (const note of result.notes) {
        console.log(`    - ${note.replace(/\n/g, " ")}`);
      }
    }
  }
}
