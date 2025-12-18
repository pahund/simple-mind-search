import type { MatchedText } from "./findMatches";

export interface SearchResult {
  file: string;
  createdAt: Date;
  modifiedAt: Date;
  matchedText: MatchedText;
}

export interface PrintResultsParams {
  results: SearchResult[];
}

export function printResults({ results }: PrintResultsParams): void {
  for (const result of results) {
    console.log(`File: ${result.file}`);
    console.log(
      `  Created: ${result.createdAt.toISOString()}, Modified: ${result.modifiedAt.toISOString()}`
    );
    console.log(`  - ${result.matchedText.text.replace(/\\N/g, " ")}`);
    const match = result.matchedText;
    if (match.url) {
      console.log(`    URL: ${match.url}`);
    }
    if (match.done !== undefined) {
      console.log(`    Done: ${match.done ? "✓" : "✗"}`);
    }
    if (match.date instanceof Date) {
      console.log(`    Date: ${match.date.toLocaleDateString()}`);
    }
    if (match.notes && match.notes.length > 0) {
      console.log("    Notes:");
      for (const note of match.notes) {
        console.log(`    - ${note.replace(/\n/g, " ")}`);
      }
    }
  }
}
