import * as fs from "fs";
import * as path from "path";
import { Config } from "./configure";

export function prepare(config: Config): void {
  if (fs.existsSync(config.TEMP_DIR)) {
    const files = fs.readdirSync(config.TEMP_DIR);
    for (const file of files) {
      const filePath = path.join(config.TEMP_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
    console.log("Deleted contents from temp dir")
  } else {
    fs.mkdirSync(config.TEMP_DIR, { recursive: true });
    console.log("Created temp dir")
  }
}
