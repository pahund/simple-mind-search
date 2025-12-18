import * as os from "os";
import * as fs from "fs/promises";
import fg from "fast-glob";
import type { Config } from "./configure";

export interface FileMetadata {
  path: string;
  createdAt: Date;
  modifiedAt: Date;
}

export async function getFilesToSearch(
  config: Config
): Promise<FileMetadata[]> {
  const mindMapsDir = config.MIND_MAPS_DIR.replace(/^~/, os.homedir());

  const files = await fg(config.FILES_TO_SEARCH, {
    cwd: mindMapsDir,
    absolute: true
  });

  const filesWithMetadata = await Promise.all(
    files.map(async (filePath) => {
      const stats = await fs.stat(filePath);
      return {
        path: filePath,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    })
  );

  return filesWithMetadata;
}
