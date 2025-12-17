import AdmZip from "adm-zip";
import { Config } from "./configure";
import { MINDMAP_XML_PATH } from "./constants";

export function unpack(config: Config, filePath: string): string {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry(MINDMAP_XML_PATH);

  if (!entry) {
    throw new Error(`This does not seem to be a SimpleMind file: ${filePath}`);
  }

  return zip.readAsText(entry);
}
