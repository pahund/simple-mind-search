import { XMLParser } from "fast-xml-parser";
import type { Config } from "./configure";
import { extractTopics } from "./extractTopics";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";

interface Topic {
  "@_text"?: string;
  "@_checkbox-mode"?: string;
  "@_checkbox"?: string;
  "@_progress"?: string;
  topic?: Topic | Topic[];
  link?: Link | Link[];
  [key: string]: unknown;
}

interface Link {
  "@_urllink"?: string;
  [key: string]: unknown;
}

interface MatchedText {
  text: string;
  url?: string;
  done?: boolean;
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
    const matchedTexts: MatchedText[] = [];

    for (const topic of topics) {
      const text = topic["@_text"];
      if (typeof text === "string" && text.includes(searchString)) {
        const matches = text.match(new RegExp(searchString, "g"));
        numberOfMatches += matches ? matches.length : 0;

        let url: string | undefined;
        if (topic.link) {
          const links = Array.isArray(topic.link) ? topic.link : [topic.link];
          for (const link of links) {
            if (
              typeof link === "object" &&
              link !== null &&
              "@_urllink" in link
            ) {
              const urllink = (link as Link)["@_urllink"];
              if (typeof urllink === "string") {
                url = urllink;
                break;
              }
            }
          }
        }

        let done: boolean | undefined;
        if (
          topic["@_checkbox-mode"] === "checkbox" &&
          topic["@_checkbox"] === "true" &&
          topic["@_progress"]
        ) {
          const progress = Number(topic["@_progress"]);
          if (!isNaN(progress)) {
            done = progress === 100;
          }
        }

        matchedTexts.push({ text, url, done });
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
      for (const match of matchedTexts) {
        console.log(`  - ${match.text.replace(/\\N/g, " ")}`);
        if (match.url) {
          console.log(`    URL: ${match.url}`);
        }
        if (match.done !== undefined) {
          console.log(`    Done: ${match.done ? "✓" : "✗"}`);
        }
      }
    }
  }

  console.log(`Total matches found: ${totalMatches}`);
}
