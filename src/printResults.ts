import type { MatchedText } from "./findMatches";

export interface PrintResultsParams {
  file: string;
  searchString: string;
  numberOfMatches: number;
  createdAt: Date;
  modifiedAt: Date;
  matchedTexts: MatchedText[];
}

export function printResults({
  file,
  searchString,
  numberOfMatches,
  createdAt,
  modifiedAt,
  matchedTexts
}: PrintResultsParams): void {
  console.log(
    `File ${file} contains search string "${searchString}" ${numberOfMatches} times`
  );
  console.log(
    `  Created: ${createdAt.toISOString()}, Modified: ${modifiedAt.toISOString()}`
  );
  for (const match of matchedTexts) {
    console.log(`  - ${match.text.replace(/\\N/g, " ")}`);
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
