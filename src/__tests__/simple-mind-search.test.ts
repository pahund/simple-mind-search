import { setup } from "./setup";
import { teardown } from "./teardown";
import {
  beforeAll,
  afterAll,
  it,
  describe,
  vi,
  beforeEach,
  afterEach
} from "vitest";
import { search } from "../actions";
import createDebug from "debug";
import { validateSearchResult, createConsoleLogSpy } from "./utils";

const numberOfTopics = 5;
const debug = createDebug("simple-mind-search:tests");

beforeAll(() => {
  debug("==================== TEST RUN START ====================");
  setup();
});

describe("the search command", () => {
  let consoleLogSpy: ReturnType<typeof createConsoleLogSpy>;

  beforeEach(() => {
    consoleLogSpy = createConsoleLogSpy();
  });

  describe("when searching for a single term", () => {
    describe("and the search term matches one topic (test case 1)", () => {
      it("should find only the matching topic", async () => {
        debug("-------------------- TEST CASE 1 --------------------");
        await search(["search_term_1"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: [1]
        });
      });
    });
    describe("and the search term matches no topic", () => {
      it("should not find any matching topic (test case 2)", async () => {
        debug("-------------------- TEST CASE 2 --------------------");
        await search(["no_match_anywhere"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: []
        });
      });
    });
  });
  describe("when searching for multiple terms", () => {
    describe("and the search terms matches one topic (test case 3)", () => {
      it("should find only the matching topic", async () => {
        debug("-------------------- TEST CASE 3 --------------------");
        await search(["search_term_2a", "search_term_2b"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: [2]
        });
      });
    });
    describe("and the search terms are not next to each other", () => {
      it("should find the matching topic (test case 4)", async () => {
        debug("-------------------- TEST CASE 4 --------------------");
        await search(["search_term_3a", "search_term_3c"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: [3]
        });
      });
      describe("and the search terms are joined with quotes", () => {
        it("should not find the matching topic (test case 5)", async () => {
          debug("-------------------- TEST CASE 5 --------------------");
          await search(['"search_term_3a search_term_3c"'], {
            ignoreCase: true,
            verbose: false,
            format: "json"
          });
          validateSearchResult({
            consoleLogSpy,
            numberOfTopics,
            expectedMatchingTopics: []
          });
        });
      });
    });

    describe("when the search terms are next to each other", () => {
      describe("and the search terms are joined with quotes", () => {
        it("should find the matching topic (test case 6)", async () => {
          debug("-------------------- TEST CASE 6 --------------------");
          await search(["search_term_3a", "search_term_3b"], {
            ignoreCase: true,
            verbose: false,
            format: "json"
          });
          validateSearchResult({
            consoleLogSpy,
            numberOfTopics,
            expectedMatchingTopics: [3]
          });
        });
      });
    });
    describe("and the search terms are in different topics", () => {
      it("should not find the matching topic (test case 7)", async () => {
        debug("-------------------- TEST CASE 7 --------------------");
        await search(["search_term_1", "search_term_2a"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: []
        });
      });
    });
    describe("and both search terms are in the same topic, one in the text and one in a label on top", () => {
      it("should find the matching topic (test case 8)", async () => {
        debug("-------------------- TEST CASE 8 --------------------");
        await search(["search_term_4a", "search_term_4b"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: [4]
        });
      });
      describe("and the search terms are joined with quotes", () => {
        it("should not find the matching topic (test case 9)", async () => {
          debug("-------------------- TEST CASE 9 --------------------");
          await search(['"search_term_4a search_term_4b"'], {
            ignoreCase: true,
            verbose: false,
            format: "json"
          });
          validateSearchResult({
            consoleLogSpy,
            numberOfTopics,
            expectedMatchingTopics: []
          });
        });
      });
    });
    describe("and both search terms are in the same topic, one in the text and one in a label embedded in the topic", () => {
      it("should find the matching topic (test case 10)", async () => {
        debug("-------------------- TEST CASE 10 --------------------");
        await search(["search_term_5a", "search_term_5b"], {
          ignoreCase: true,
          verbose: false,
          format: "json"
        });
        validateSearchResult({
          consoleLogSpy,
          numberOfTopics,
          expectedMatchingTopics: [5]
        });
      });
      describe("and the search terms are joined with quotes", () => {
        it("should not find the matching topic (test case 11)", async () => {
          debug("-------------------- TEST CASE 11 --------------------");
          await search(['"search_term_5a search_term_5b"'], {
            ignoreCase: true,
            verbose: false,
            format: "json"
          });
          validateSearchResult({
            consoleLogSpy,
            numberOfTopics,
            expectedMatchingTopics: []
          });
        });
      });
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
});

afterAll(teardown);
