import { XMLParser } from "fast-xml-parser";
import type { Config } from "./configure";
import { extractTopics } from "./extractTopics";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";
import { findMatches, type Topic } from "./findMatches";
import { printResults, type SearchResult } from "./printResults";

export interface SearchParams {
  config: Config;
  searchString: string;
  ignoreCase?: boolean;
  exactPhrase?: boolean;
}

export async function search({
  config,
  searchString,
  ignoreCase = false,
  exactPhrase = false
}: SearchParams): Promise<void> {
  console.log(`Searching for: ${searchString}`);

  const files = await getFilesToSearch(config);
  const parser = new XMLParser({ ignoreAttributes: false });
  const results: SearchResult[] = [];

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
    const matches = findMatches({
      topics,
      searchString,
      ignoreCase,
      exactPhrase
    });

    for (const match of matches) {
      results.push({
        file,
        createdAt,
        modifiedAt,
        match
      });
    }
  }

  printResults({ results });
}
