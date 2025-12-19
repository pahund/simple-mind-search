import { describe, it, expect } from "vitest";
import { extractUrl } from "./extractUrl";
import type { Topic } from "../types";

describe("extractUrl", () => {
  it("should extract URL from single link", () => {
    const topic: Topic = {
      link: { "@_urllink": "https://example.com" }
    };
    expect(extractUrl(topic)).toBe("https://example.com");
  });

  it("should extract URL from link array", () => {
    const topic: Topic = {
      link: [{ "@_otherattr": "value" }, { "@_urllink": "https://example.org" }]
    };
    expect(extractUrl(topic)).toBe("https://example.org");
  });

  it("should return undefined when no link", () => {
    const topic: Topic = {};
    expect(extractUrl(topic)).toBeUndefined();
  });

  it("should return undefined when link has no urllink attribute", () => {
    const topic: Topic = {
      link: { "@_otherattr": "value" }
    };
    expect(extractUrl(topic)).toBeUndefined();
  });

  it("should return first URL when multiple links have urllink", () => {
    const topic: Topic = {
      link: [
        { "@_urllink": "https://first.com" },
        { "@_urllink": "https://second.com" }
      ]
    };
    expect(extractUrl(topic)).toBe("https://first.com");
  });
});
