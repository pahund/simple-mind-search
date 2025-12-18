import * as fs from "fs";
import * as os from "os";
import type { Config } from "./configure";
import { getFilesToSearch } from "./getFilesToSearch";

export async function validate(config: Config): Promise<void> {
  const mindMapsDir = config.mindMapsDir.replace(/^~/, os.homedir());
  if (!fs.existsSync(mindMapsDir)) {
    throw new Error(`mindMapsDir does not exist: ${config.mindMapsDir}`);
  }

  const files = await getFilesToSearch(config);

  if (files.length === 0) {
    throw new Error(
      `No files found matching pattern "${config.filesToSearch}" in ${config.mindMapsDir}`
    );
  }
}
