import AdmZip from "adm-zip";
import * as path from "path";
import * as fs from "fs";
import { Config } from "./configure";
import { MINDMAP_XML_PATH } from "./constants";

export function unpack(config: Config, filePath: string): string {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry(MINDMAP_XML_PATH);

  if (!entry) {
    throw new Error(
      `This does not seem to be a SimpleMind file: ${filePath}`
    );
  }

  const baseName = path.basename(filePath, ".smmx");
  const targetPath = path.join(config.TEMP_DIR, `${baseName}.xml`);

  const content = zip.readAsText(entry);
  fs.writeFileSync(targetPath, content);

  return content;
}
