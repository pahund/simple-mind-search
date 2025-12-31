import { expect } from "vitest";
import { createConsoleLogSpy } from "./createConsoleLogSpy";

export function validateSearchResult({
  consoleLogSpy,
  numberOfTopics,
  expectedMatchingTopics
}: {
  consoleLogSpy: ReturnType<typeof createConsoleLogSpy>;
  numberOfTopics: number;
  expectedMatchingTopics: number[];
}) {
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
