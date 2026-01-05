#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync } from "fs";
import { join } from "path";
import { search } from "./actions";

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8")
) as { version: string };

const program = new Command();

program
  .version(packageJson.version, "-V, --version", "Output the version number")
  .argument("[search-terms...]", "Terms to search for (space-separated)")
  .option("-i, --ignore-case", "Ignore case when searching", false)
  .option("-v, --verbose", "Enable verbose output", false)
  .option("-f, --format <format>", "Output format (yaml or json)", "yaml")
  .option("--todo", "Only show topics with unchecked checkboxes", false)
  .action(search);

program.parse(process.argv);
