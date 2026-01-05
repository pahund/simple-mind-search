import { XMLParser } from "fast-xml-parser";
import type { Config } from "../config";
import { extractTopics } from "../extraction";
import { getFilesToSearch, unpack } from "../files";
import { findMatches, type Topic } from "./findMatches";
import { printResultsYaml, printResultsJson } from "../output";
import type { SearchResult } from "../types";
import { deduplicate } from "../deduplication";
import { filterByDate } from "../deduplication/filterByDate";
import { sort } from "../sort";

export interface SearchParams {
  config: Config;
  searchString: string;
  ignoreCase?: boolean;
  exactPhrase?: boolean;
  verbose?: boolean;
  format?: string;
  todo?: boolean;
  date?: string;
}

export async function search({
  config,
  searchString,
  ignoreCase = false,
  exactPhrase = false,
  verbose = false,
  format = "yaml",
  todo = false,
  date
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
      exactPhrase,
      todo
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

  let deduplicated = deduplicate(results);

  if (verbose) {
    console.log(`Reduced to ${deduplicated.length} by deduplication`);
  }

  if (date) {
    try {
      deduplicated = filterByDate({ results: deduplicated, date });
      if (verbose) {
        console.log(
          `Reduced to ${deduplicated.length} by filtering for date ${date}`
        );
      }
    } catch (error) {
      console.error((error as Error).message);
      process.exit(1);
    }
  }

  const sorted = sort(deduplicated);

  if (format === "json") {
    printResultsJson({
      results: sorted
    });
  } else {
    printResultsYaml({
      results: sorted,
      config
    });
  }
}
