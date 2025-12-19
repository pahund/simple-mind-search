#!/usr/bin/env node

import { Command } from "commander";
import { printBanner } from "./output";
import { configure, validate } from "./config";
import { search } from "./search";

const program = new Command();

program
  .argument("<search-terms...>", "Terms to search for (space-separated)")
  .option("-i, --ignore-case", "Ignore case when searching", false)
  .option("-v, --verbose", "Enable verbose output", false)
  .action(
    async (
      searchTerms: string[],
      options: { ignoreCase: boolean; verbose: boolean }
    ) => {
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
      const searchString = searchTerms.join(" ");
      const exactPhrase = searchTerms.length === 1;
      await search({
        config,
        searchString,
        ignoreCase: options.ignoreCase,
        exactPhrase,
        verbose: options.verbose
      });
    }
  );

program.parse(process.argv);
