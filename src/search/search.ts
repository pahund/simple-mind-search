import { XMLParser } from "fast-xml-parser";
import type { Config } from "../config";
import { extractTopics } from "../extraction";
import { getFilesToSearch, unpack } from "../files";
import { findMatches, type Topic } from "./findMatches";
import { printResultsYaml, printResultsJson } from "../output";
import type { SearchResult } from "../types";
import { deduplicate } from "../deduplication";

export interface SearchParams {
  config: Config;
  searchString: string;
  ignoreCase?: boolean;
  exactPhrase?: boolean;
  verbose?: boolean;
  format?: string;
}

export async function search({
  config,
  searchString,
  ignoreCase = false,
  exactPhrase = false,
  verbose = false,
  format = "yaml"
}: SearchParams): Promise<void> {
  if (verbose) {
    console.log(`Searching for: ${searchString}`);
  }

  const files = await getFilesToSearch(config, verbose);
  const parser = new XMLParser({ ignoreAttributes: false });
  const results: SearchResult[] = [];

  for (const { path: file, createdAt, modifiedAt } of files) {
    let xmlString: string;
    try {
      xmlString = unpack(file);
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

  if (verbose) {
    console.log(`Found ${results.length} matches`);
  }

  const deduplicated = deduplicate(results);

  if (verbose) {
    console.log(`Reduced to ${deduplicated.length} by deduplication`);
  }

  if (format === "json") {
    printResultsJson({
      results: deduplicated
    });
  } else {
    printResultsYaml({
      results: deduplicated,
      config
    });
  }
}
