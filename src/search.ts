import { Config } from "./configure";
import { getFilesToSearch } from "./getFilesToSearch";
import { unpack } from "./unpack";

export async function search(
  config: Config,
  searchString: string
): Promise<void> {
  console.log(`Searching for: ${searchString}`);

  const files = await getFilesToSearch(config);
  let totalMatches = 0;

  for (const file of files) {
    let xmlString: string;
    try {
      xmlString = unpack(config, file);
    } catch (error) {
      console.warn((error as Error).message);
      continue;
    }

    if (xmlString.includes(searchString)) {
      const matches = xmlString.match(new RegExp(searchString, "g"));
      const numberOfMatches = matches ? matches.length : 0;
      totalMatches += numberOfMatches;
      console.log(
        `File ${file} contains search string "${searchString}" ${numberOfMatches} times`
      );
    }
  }

  console.log(`Total matches found: ${totalMatches}`);
}
