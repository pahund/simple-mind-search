import { escapeRegExp } from "./escapeRegExp";

export interface CountMatchesParams {
  text: string;
  searchString: string;
  ignoreCase: boolean;
}

export function countMatches({
  text,
  searchString,
  ignoreCase
}: CountMatchesParams): number {
  const flags = ignoreCase ? "gi" : "g";
  const escapedSearchString = escapeRegExp(searchString);
  const matches = text.match(new RegExp(escapedSearchString, flags));
  return matches ? matches.length : 0;
}
