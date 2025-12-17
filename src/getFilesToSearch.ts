import * as os from "os";
import fg from "fast-glob";
import { Config } from "./configure";

export async function getFilesToSearch(config: Config): Promise<string[]> {
  const mindMapsDir = config.MIND_MAPS_DIR.replace(/^~/, os.homedir());

  const files = await fg(config.FILES_TO_SEARCH, {
    cwd: mindMapsDir,
    absolute: true
  });

  return files;
}
