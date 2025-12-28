import * as path from "path";
import * as os from "os";
import { CONFIG_FILE_NAME } from "../constants";

export function getConfigPath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}
