import * as fs from "fs";
import * as os from "os";
import type { Config } from "./configure";
import { getFilesToSearch } from "./getFilesToSearch";

export async function validate(config: Config): Promise<void> {
  const mindMapsDir = config.MIND_MAPS_DIR.replace(/^~/, os.homedir());
  if (!fs.existsSync(mindMapsDir)) {
    throw new Error(`MIND_MAPS_DIR does not exist: ${config.MIND_MAPS_DIR}`);
  }

  const files = await getFilesToSearch(config);

  if (files.length === 0) {
    throw new Error(
      `No files found matching pattern "${config.FILES_TO_SEARCH}" in ${config.MIND_MAPS_DIR}`
    );
  }
}
