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
    // Match the text field with either a space or quote after the topic number
    // This avoids substring matches (e.g., TEST_TOPIC_1 in TEST_TOPIC_10)
    // Matches: "text": "TEST_TOPIC_1" or "text": "TEST_TOPIC_1 ..."
    if (expectedMatchingTopics.includes(i)) {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`"text": "TEST_TOPIC_${i}[ "]`))
      );
    } else {
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`"text": "TEST_TOPIC_${i}[ "]`))
      );
    }
  }
}
