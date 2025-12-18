import { XMLParser } from "fast-xml-parser";
import type { Config } from "./configure";
import { extractTopics } from "./extractTopics";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";

interface NoteContent {
  "#text"?: string;
  "@_textfmt"?: string;
  [key: string]: unknown;
}

interface TextNode {
  note?: string | NoteContent;
  [key: string]: unknown;
}

interface Children {
  text?: TextNode | TextNode[];
}

interface Topic {
  "@_text"?: string;
  "@_checkbox-mode"?: string;
  "@_checkbox"?: string;
  "@_progress"?: string;
  topic?: Topic | Topic[];
  link?: Link | Link[];
  children?: Children;
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
  notes?: string[];
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    let numberOfMatches = 0;
    const matchedTexts: MatchedText[] = [];

    for (const topic of topics) {
      const text = topic["@_text"];
      if (typeof text === "string") {
        const notes: string[] = [];
        const topicChildren = topic.children as Children | undefined;
        if (topicChildren?.text) {
          const textNodes = Array.isArray(topicChildren.text)
            ? topicChildren.text
            : [topicChildren.text];
          for (const textNode of textNodes) {
            if (textNode.note) {
              if (typeof textNode.note === "string") {
                notes.push(textNode.note);
              } else if (
                typeof textNode.note === "object" &&
                textNode.note !== null &&
                "#text" in textNode.note
              ) {
                const noteText = textNode.note["#text"];
                if (noteText && typeof noteText === "string") {
                  notes.push(noteText);
                }
              }
            }
          }
        }

        const matchFoundInText = ignoreCase
          ? text.toLowerCase().includes(searchString.toLowerCase())
          : text.includes(searchString);

        let matchFoundInNotes = false;
        for (const note of notes) {
          const noteMatchFound = ignoreCase
            ? note.toLowerCase().includes(searchString.toLowerCase())
            : note.includes(searchString);
          if (noteMatchFound) {
            matchFoundInNotes = true;
            break;
          }
        }

        const matchFound = matchFoundInText || matchFoundInNotes;

        if (matchFound) {
          const flags = ignoreCase ? "gi" : "g";
          const escapedSearchString = escapeRegExp(searchString);
          const textMatches = text.match(
            new RegExp(escapedSearchString, flags)
          );
          numberOfMatches += textMatches ? textMatches.length : 0;

          for (const note of notes) {
            const noteMatches = note.match(
              new RegExp(escapedSearchString, flags)
            );
            numberOfMatches += noteMatches ? noteMatches.length : 0;
          }

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

          matchedTexts.push({ text, url, done, notes });
        }
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
