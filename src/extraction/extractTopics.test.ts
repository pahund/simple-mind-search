import { describe, it, expect } from "vitest";
import { extractTopics } from "./extractTopics";

describe("extractTopics", () => {
  it("should return empty array for object without topics", () => {
    const input = { "@_text": "Root" };
    const result = extractTopics(input);
    expect(result).toEqual([]);
  });

  it("should extract single topic", () => {
    const topic = { "@_text": "Child Topic" };
    const input = { topic };
    const result = extractTopics(input);
    expect(result).toEqual([topic]);
  });

  it("should extract multiple topics from array", () => {
    const topic1 = { "@_text": "Topic 1" };
    const topic2 = { "@_text": "Topic 2" };
    const input = { topic: [topic1, topic2] };
    const result = extractTopics(input);
    expect(result).toEqual([topic1, topic2]);
  });

  it("should extract nested topics", () => {
    const childTopic = { "@_text": "Child" };
    const parentTopic = { "@_text": "Parent", topic: childTopic };
    const input = { topic: parentTopic };
    const result = extractTopics(input);
    expect(result).toEqual([parentTopic, childTopic]);
  });

  it("should extract deeply nested topics", () => {
    const grandchild = { "@_text": "Grandchild" };
    const child = { "@_text": "Child", topic: grandchild };
    const parent = { "@_text": "Parent", topic: child };
    const input = { topic: parent };
    const result = extractTopics(input);
    expect(result).toEqual([parent, child, grandchild]);
  });

  it("should extract topics from multiple branches", () => {
    const topic1a = { "@_text": "Topic 1a" };
    const topic1 = { "@_text": "Topic 1", topic: topic1a };
    const topic2a = { "@_text": "Topic 2a" };
    const topic2 = { "@_text": "Topic 2", topic: topic2a };
    const input = { topic: [topic1, topic2] };
    const result = extractTopics(input);
    expect(result).toEqual([topic1, topic2, topic1a, topic2a]);
  });

  it("should extract topics from nested objects", () => {
    const topic = { "@_text": "Nested Topic" };
    const input = { root: { branch: { topic } } };
    const result = extractTopics(input);
    expect(result).toEqual([topic]);
  });

  it("should handle mixed arrays and nested topics", () => {
    const leaf1 = { "@_text": "Leaf 1" };
    const leaf2 = { "@_text": "Leaf 2" };
    const branch1 = { "@_text": "Branch 1", topic: leaf1 };
    const branch2 = { "@_text": "Branch 2", topic: leaf2 };
    const root = { "@_text": "Root", topic: [branch1, branch2] };
    const input = { topic: root };
    const result = extractTopics(input);
    expect(result).toEqual([root, branch1, branch2, leaf1, leaf2]);
  });

  it("should ignore null and non-object values", () => {
    const topic = { "@_text": "Valid Topic" };
    const input = {
      topic,
      nullValue: null,
      stringValue: "text",
      numberValue: 42
    };
    const result = extractTopics(input);
    expect(result).toEqual([topic]);
  });

  it("should handle empty topic arrays", () => {
    const input = { topic: [] };
    const result = extractTopics(input);
    expect(result).toEqual([]);
  });

  it("should extract topics with additional properties", () => {
    const topic = {
      "@_text": "Topic with props",
      color: "red",
      position: { x: 10, y: 20 }
    };
    const input = { topic };
    const result = extractTopics(input);
    expect(result).toEqual([topic]);
  });
});
