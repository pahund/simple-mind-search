import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import createDebug from "debug";
import { getConfigPath, type Config } from "../config";

const debug = createDebug("simple-mind-search:e2e:setup");

const testConfigBase = {
  filesToSearch: "**/*.smmx",
  locale: "en-GB",
  timeZone: "CET"
};

export function setup() {
  debug("\n\n*** SETUP ***\n\n");
  const configPath = getConfigPath();
  const fixturesPath = path.join(__dirname, "fixtures");
  debug("configPath: %s", configPath);
  debug("fixturesPath: %s", fixturesPath);
  if (fs.existsSync(configPath)) {
    const backupConfigPath = `${configPath}.bak`;
    fs.copyFileSync(configPath, backupConfigPath);
    debug("wrote backup config file to %s", backupConfigPath);
  } else {
    debug("no existing config file");
  }
  const testConfig: Config = { ...testConfigBase, mindMapsDir: fixturesPath };
  debug("testConfig: %j", testConfig);
  const testConfigYaml = yaml.dump(testConfig);
  debug("testConfigYaml: %s", testConfigYaml);
  fs.writeFileSync(configPath, testConfigYaml);
  debug("wrote test config file to %s", configPath);
  return testConfig;
}
