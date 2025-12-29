import { expect } from "vitest";
import { createConsoleLogSpy } from "./createConsoleLogSpy";
import createDebug from "debug";

const debug = createDebug(
  "simple-mind-search:tests:utils:validateSearchResult"
);

export function validateSearchResult({
  consoleLogSpy,
  numberOfTopics,
  expectedMatchingTopics
}: {
  consoleLogSpy: ReturnType<typeof createConsoleLogSpy>;
  numberOfTopics: number;
  expectedMatchingTopics: number[];
}) {
  debug("consoleLogSpy: %o", consoleLogSpy);
  debug("numberOfTopics: %o", numberOfTopics);
  debug("expectedMatchingTopics: %o", expectedMatchingTopics);
  for (let i = 0; i < numberOfTopics; i++) {
    if (expectedMatchingTopics.includes(i)) {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`TEST_TOPIC_${i}`)
      );
    } else {
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(`TEST_TOPIC_${i}`)
      );
    }
  }
}
