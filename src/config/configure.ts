import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { DEFAULT_CONFIG_FILE_NAME } from "../constants";
import { getConfigPath } from "./getConfigPath";

export interface Config {
  mindMapsDir: string;
  filesToSearch: string;
  locale: string;
  timeZone: string;
}

export function configure(verbose = false): Config {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    const defaultConfigPath = path.join(
      __dirname,
      "../..",
      DEFAULT_CONFIG_FILE_NAME
    );

    if (!fs.existsSync(defaultConfigPath)) {
      console.error("Default configuration file not found");
      process.exit(1);
    }

    fs.copyFileSync(defaultConfigPath, configPath);
    if (verbose) {
      console.log(`Created new configuration file: ${configPath}`);
    }
  }

  const configString = fs.readFileSync(configPath, "utf-8");
  const config = yaml.load(configString) as Config;

  const requiredKeys: Array<keyof Config> = [
    "mindMapsDir",
    "filesToSearch",
    "locale",
    "timeZone"
  ];

  for (const key of requiredKeys) {
    if (!config[key]) {
      console.error(`Missing required configuration: ${key}`);
      process.exit(1);
    }
  }

  if (verbose) {
    console.log("Using configuration:");
    console.log(config);
  }

  return config;
}
