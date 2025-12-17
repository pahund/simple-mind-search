#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const program = new Command();

program.action(() => {
  console.log("==================");
  console.log("Simple Mind Search");
  console.log("==================");
  const configPath = path.join(os.homedir(), ".simple-mind-search");

  if (!fs.existsSync(configPath)) {
    const defaultConfigPath = path.join(__dirname, "..", ".simple-mind-search.default");
    
    if (!fs.existsSync(defaultConfigPath)) {
      console.error("Default configuration file not found");
      process.exit(1);
    }

    fs.copyFileSync(defaultConfigPath, configPath);
    console.log(`Created new configuration file: ${configPath}`);
  }

  const config = fs.readFileSync(configPath, "utf-8");
  console.log("Using configuration:");
  console.log(config);
});

program.parse(process.argv);
