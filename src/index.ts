#!/usr/bin/env node

import { Command } from "commander";
import { printBanner } from "./output";
import { configure, validate } from "./config";
import { search } from "./search";

const program = new Command();

program
  .argument("<search-terms...>", "Terms to search for (space-separated)")
  .option("-i, --ignore-case", "Ignore case when searching", false)
  .action(async (searchTerms: string[], options: { ignoreCase: boolean }) => {
    printBanner();
    const config = configure();
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
      exactPhrase
    });
  });

program.parse(process.argv);
