import { setup } from "./setup";
import { teardown } from "./teardown";
import {
  beforeAll,
  afterAll,
  expect,
  it,
  describe,
  vi,
  beforeEach,
  afterEach
} from "vitest";
import { search } from "../actions";
import createDebug from "debug";

const debug = createDebug(
  "simple-mind-search:__tests__:simple-mind-search.test"
);

beforeAll(setup);

describe("simple-mind-search", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("search", () => {
    it("for a single term that matches one topic", async () => {
      debug("\n\n*** TEST CASE 1 ***\n\n");
      await search(["test"], {
        ignoreCase: true,
        verbose: false,
        format: "json"
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("TEST_TOPIC_1")
      );
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

afterAll(teardown);
