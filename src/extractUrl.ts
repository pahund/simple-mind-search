import type { Topic } from "./types";

export function extractUrl(topic: Topic): string | undefined {
  if (!topic.link) {
    return undefined;
  }
  const links = Array.isArray(topic.link) ? topic.link : [topic.link];
  for (const link of links) {
    if (typeof link === "object" && link !== null && "@_urllink" in link) {
      const urllink = link["@_urllink"];
      if (typeof urllink === "string") {
        return urllink;
      }
    }
  }
  return undefined;
}
