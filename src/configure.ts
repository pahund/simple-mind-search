import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { parse } from "dotenv";
import { CONFIG_FILE_NAME, DEFAULT_CONFIG_FILE_NAME } from "./constants";

export interface Config {
  MIND_MAPS_DIR: string;
  FILES_TO_SEARCH: string;
}

export function configure(): Config {
  const configPath = path.join(os.homedir(), CONFIG_FILE_NAME);

  if (!fs.existsSync(configPath)) {
    const defaultConfigPath = path.join(
      __dirname,
      "..",
      DEFAULT_CONFIG_FILE_NAME
    );

    if (!fs.existsSync(defaultConfigPath)) {
      console.error("Default configuration file not found");
      process.exit(1);
    }

    fs.copyFileSync(defaultConfigPath, configPath);
    console.log(`Created new configuration file: ${configPath}`);
  }

  const configString = fs.readFileSync(configPath, "utf-8");
  const config = parse(configString) as unknown as Config;

  const requiredKeys: Array<keyof Config> = [
    "MIND_MAPS_DIR",
    "FILES_TO_SEARCH"
  ];

  for (const key of requiredKeys) {
    if (!config[key]) {
      console.error(`Missing required configuration: ${key}`);
      process.exit(1);
    }
  }

  for (const key of Object.keys(config)) {
    if (process.env[key]) {
      console.log(`Overriding ${key} with environment variable`);
      config[key as keyof Config] = process.env[key] as string;
    }
  }

  console.log("Using configuration:");
  console.log(config);

  return config;
}
