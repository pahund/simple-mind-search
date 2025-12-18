import { XMLParser } from "fast-xml-parser";
import type { Config } from "./configure";
import { extractTopics } from "./extractTopics";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";

interface Topic {
  "@_text"?: string;
  topic?: Topic | Topic[];
  [key: string]: unknown;
}

export async function search(
  config: Config,
  searchString: string
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
    let numberOfMatches = 0;
    const matchedTexts: string[] = [];

    for (const topic of topics) {
      const text = topic["@_text"];
      if (typeof text === "string" && text.includes(searchString)) {
        const matches = text.match(new RegExp(searchString, "g"));
        numberOfMatches += matches ? matches.length : 0;
        matchedTexts.push(text);
      }
    }

    if (numberOfMatches > 0) {
      totalMatches += numberOfMatches;
      console.log(
        `File ${file} contains search string "${searchString}" ${numberOfMatches} times`
      );
      console.log(
        `  Created: ${createdAt.toISOString()}, Modified: ${modifiedAt.toISOString()}`
      );
      for (const text of matchedTexts) {
        console.log(`  - ${text.replace(/\\N/g, " ")}`);
      }
    }
  }

  console.log(`Total matches found: ${totalMatches}`);
}
