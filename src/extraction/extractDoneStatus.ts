import type { Topic } from "../types";

export function extractDoneStatus(topic: Topic): boolean | undefined {
  if (
    topic["@_checkbox-mode"] === "checkbox" &&
    topic["@_checkbox"] === "true" &&
    topic["@_progress"]
  ) {
    const progress = Number(topic["@_progress"]);
    if (!isNaN(progress)) {
      return progress === 100;
    }
  }
  return undefined;
}
