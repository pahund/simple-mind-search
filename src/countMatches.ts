import { escapeRegExp } from "./escapeRegExp";

export function countMatches(
  text: string,
  searchString: string,
  ignoreCase: boolean
): number {
  const flags = ignoreCase ? "gi" : "g";
  const escapedSearchString = escapeRegExp(searchString);
  const matches = text.match(new RegExp(escapedSearchString, flags));
  return matches ? matches.length : 0;
}
