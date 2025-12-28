import type { DeduplicatedResult } from "../deduplication";
import createDebug from "debug";

const debug = createDebug("simple-mind-search:output:printResultsJson");

export function printResultsJson({
  results
}: {
  results: DeduplicatedResult[];
}): void {
  const jsonResults = results.map((result) => {
    const jsonResult: Record<string, unknown> = {
      // SimpleMind has a weird way of storing line breaks (only
      // in topics, not in notes) - we replace them with newlines
      // to have a value we can paste into the search field in
      // SimpleMind; yes, you actually have to enter line breaks in
      // the search field to find topics that have line breaks, and
      // line breaks get added automatically when the text in a topic
      // is wrapped
      text: result.text.replace(/\\N/g, " "),
      textWithBreaks: result.text.replace(/\\N/g, "%BREAK%"),
      file: result.file,
      created: result.createdAt.toJSON(),
      modified: result.modifiedAt.toJSON()
    };
    if (result.notes && result.notes.length > 0) {
      jsonResult.notes = result.notes.map((note) => note.replace(/\n/g, " "));
    }
    if (result.url) {
      jsonResult.url = result.url;
    }
    if (result.done !== undefined) {
      jsonResult.done = result.done;
    }
    if (result.date instanceof Date) {
      jsonResult.date = result.date.toJSON();
    }
    return jsonResult;
  });

  debug("jsonResults: %O", jsonResults);
  console.log(JSON.stringify(jsonResults, null, 2));
}
