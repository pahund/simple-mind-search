import type { Match } from "../search";
import type { DeduplicatedResult } from "../deduplication";
import { escapeYamlString } from "../utils";

export interface SearchResult {
  file: string;
  createdAt: Date;
  modifiedAt: Date;
  match: Match;
}

export function printResultsYaml({
  results,
  locale,
  timeZone
}: {
  results: DeduplicatedResult[];
  locale: string;
  timeZone: string;
}): void {
  for (const result of results) {
    console.log(
      `- text: ${escapeYamlString(result.text.replace(/\\N/g, " "))}`
    );
    if (result.notes && result.notes.length > 0) {
      console.log("  notes:");
      for (const note of result.notes) {
        console.log(`    - ${escapeYamlString(note.replace(/\n/g, " "))}`);
      }
    }
    console.log(`  file: ${escapeYamlString(result.file)}`);
    console.log(
      `  created: ${result.createdAt.toLocaleString(locale, { timeZone })}`
    );
    console.log(
      `  modified: ${result.modifiedAt.toLocaleString(locale, { timeZone })}`
    );
    if (result.url) {
      console.log(`  url: ${escapeYamlString(result.url)}`);
    }
    if (result.done !== undefined) {
      console.log(`  done: ${result.done}`);
    }
    if (result.date instanceof Date) {
      console.log(
        `  date: ${result.date.toLocaleDateString(locale, { timeZone })}`
      );
    }
  }
}
