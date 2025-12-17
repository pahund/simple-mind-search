#!/usr/bin/env node

import { Command } from "commander";
import { printBanner } from "./printBanner";
import { configure } from "./configure";
import { validate } from "./validate";

const program = new Command();

program.action(async () => {
  printBanner();
  const config = configure();
  try {
    await validate(config);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
});

program.parse(process.argv);
