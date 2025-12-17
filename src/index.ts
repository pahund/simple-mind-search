#!/usr/bin/env node

import { Command } from "commander";
import { printBanner } from "./printBanner";
import { configure } from "./configure";
import { validate } from "./validate";
import { search } from "./search";

const program = new Command();

program
  .argument("<search-string>", "String to search for")
  .action(async (searchString: string) => {
    printBanner();
    const config = configure();
    try {
      await validate(config);
    } catch (error) {
      console.error((error as Error).message);
      process.exit(1);
    }
    await search(config, searchString);
  });

program.parse(process.argv);
