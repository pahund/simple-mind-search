import { XMLParser } from "fast-xml-parser";
import type { Config } from "./configure";
import { extractTopics } from "./extractTopics";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";
import { findMatches, type Topic } from "./findMatches";

export async function search(
  config: Config,
  searchString: string,
  ignoreCase = false
): Promise<void> {
  console.log(`Searching for: ${searchString}`);

  const files = await getFilesToSearch(config);
  let totalMatches = 0;
  const parser = new XMLParser({ ignoreAttributes: false });

  for (const { path: file, createdAt, modifiedAt } of files) {
    let xmlString: string;
    try {
      xmlString = unpack(config, file);
    } catch (error) {
      console.warn((error as Error).message);
      continue;
    }

    const parsed = parser.parse(xmlString) as Topic;
    const topics = extractTopics(parsed);
    const { matchedTexts, numberOfMatches } = findMatches(
      topics,
      searchString,
      ignoreCase
    );

    if (numberOfMatches > 0) {
      totalMatches += numberOfMatches;
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
        if (match.notes && match.notes.length > 0) {
          console.log("    Notes:");
          for (const note of match.notes) {
            console.log(`    - ${note.replace(/\n/g, " ")}`);
          }
        }
      }
    }
  }

  console.log(`Total matches found: ${totalMatches}`);
}
