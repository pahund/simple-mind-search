import * as os from "os";
import * as fs from "fs/promises";
import fg from "fast-glob";
import type { Config } from "../config";

export interface FileMetadata {
  path: string;
  createdAt: Date;
  modifiedAt: Date;
}

export async function getFilesToSearch(
  config: Config,
  verbose = false
): Promise<FileMetadata[]> {
  const mindMapsDir = config.mindMapsDir.replace(/^~/, os.homedir());

  const files = await fg(config.filesToSearch, {
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

  if (verbose) {
    console.log(`Found ${filesWithMetadata.length} files to search`);
  }

  return filesWithMetadata;
}
