import { XMLParser } from "fast-xml-parser";
import { Config } from "./configure";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";

export async function search(
  config: Config,
  searchString: string
): Promise<void> {
  console.log(`Searching for: ${searchString}`);

  const files = await getFilesToSearch(config);
  let totalMatches = 0;
  const parser = new XMLParser({ ignoreAttributes: false });

  for (const file of files) {
    let xmlString: string;
    try {
      xmlString = unpack(config, file);
    } catch (error) {
      console.warn((error as Error).message);
      continue;
    }

    const parsed = parser.parse(xmlString);
    const topics = extractTopics(parsed);
    let numberOfMatches = 0;
    const matchedTexts: string[] = [];

    for (const topic of topics) {
      const text = topic["@_text"];
      if (text && text.includes(searchString)) {
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
      for (const text of matchedTexts) {
        console.log(`  - ${text.replace(/\\N/g, " ")}`);
      }
    }
  }

  console.log(`Total matches found: ${totalMatches}`);
}

function extractTopics(obj: any): any[] {
  const topics: any[] = [];

  function traverse(node: any) {
    if (typeof node !== "object" || node === null) return;

    if (node.topic) {
      const topicArray = Array.isArray(node.topic) ? node.topic : [node.topic];
      topics.push(...topicArray);
      for (const topic of topicArray) {
        traverse(topic);
      }
    }

    for (const key in node) {
      if (key !== "topic") {
        traverse(node[key]);
      }
    }
  }

  traverse(obj);
  return topics;
}
