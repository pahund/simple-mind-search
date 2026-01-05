import { configure } from "../config";
import { validate } from "../config";
import { printBanner } from "../output";
import { search as searchFunction } from "../search";

export async function search(
  searchTerms: string[],
  options: {
    ignoreCase: boolean;
    verbose: boolean;
    format: string;
    todo?: boolean;
    date?: string;
  }
) {
  // Validate that search terms are provided when --todo is not used
  // When using --date without --todo, search terms are required
  if (!options.todo && (!searchTerms || searchTerms.length === 0)) {
    console.error("error: missing required argument 'search-terms'");
    process.exit(1);
  }

  if (options.verbose) {
    printBanner();
  }
  const config = configure(options.verbose);
  try {
    await validate(config);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
  if (options.format !== "yaml" && options.format !== "json") {
    console.error("Invalid format. Must be 'yaml' or 'json'.");
    process.exit(1);
  }
  const searchString = searchTerms?.join(" ") ?? "";
  const exactPhrase = searchTerms?.length === 1;
  await searchFunction({
    config,
    searchString,
    ignoreCase: options.ignoreCase,
    exactPhrase,
    verbose: options.verbose,
    format: options.format,
    todo: options.todo ?? false,
    date: options.date
  });
}
