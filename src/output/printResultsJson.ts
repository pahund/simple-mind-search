import type { DeduplicatedResult } from "../deduplication";

export function printResultsJson({
  results
}: {
  results: DeduplicatedResult[];
}): void {
  const jsonResults = results.map((result) => {
    const jsonResult: Record<string, unknown> = {
      text: result.text.replace(/\\N/g, " "),
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

  console.log(JSON.stringify(jsonResults, null, 2));
}
