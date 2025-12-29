import createDebug from "debug";
import { CONFIG_FILE_NAME } from "../constants";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

const debug = createDebug("simple-mind-search:tests:teardown");

export function teardown() {
  debug("\n\n*** TEARDOWN ***\n\n");
  const configPath = path.join(os.homedir(), CONFIG_FILE_NAME);
  const backupConfigPath = `${configPath}.bak`;
  debug("configPath: %s", configPath);
  debug("backupConfigPath: %s", backupConfigPath);
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    debug("deleted test config file at %s", configPath);
  } else {
    debug("no test config file found at %s", configPath);
  }
  if (fs.existsSync(backupConfigPath)) {
    fs.copyFileSync(backupConfigPath, configPath);
    fs.unlinkSync(backupConfigPath);
    debug("restored config file from backup");
  } else {
    debug("no backup config file found");
  }
}
