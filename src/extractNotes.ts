import type { Topic } from "./types";

export function extractNotes(topic: Topic): string[] {
  const notes: string[] = [];
  const topicChildren = topic.children;
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
  return notes;
}
