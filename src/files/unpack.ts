import AdmZip from "adm-zip";
import createDebug from "debug";
import { MINDMAP_XML_PATH } from "../constants";

// intentionally not prefixed with "simple-mind-search" to avoid cluttering the output
const debugXml = createDebug("xml");

export function unpack(filePath: string): string {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry(MINDMAP_XML_PATH);

  if (!entry) {
    throw new Error(`This does not seem to be a SimpleMind file: ${filePath}`);
  }

  const xmlString = zip.readAsText(entry);
  debugXml("Unpacked XML string: %s", xmlString);
  return xmlString;
}
