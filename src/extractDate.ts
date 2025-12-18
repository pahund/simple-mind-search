import type { Topic } from "./types";

export function extractDate(topic: Topic): Date | undefined {
  if (!topic["@_date"]) {
    return undefined;
  }

  const dateString = topic["@_date"];
  if (typeof dateString !== "string") {
    return undefined;
  }

  const parts = dateString.split("-");
  if (parts.length !== 3) {
    return undefined;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}
