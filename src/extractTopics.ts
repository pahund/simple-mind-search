interface Topic {
  "@_text"?: string;
  topic?: Topic | Topic[];
  [key: string]: unknown;
}

export function extractTopics(obj: Topic): Topic[] {
  const topics: Topic[] = [];

  function traverse(node: Topic): void {
    if (typeof node !== "object" || node === null) return;

    if (node.topic) {
      const topicArray = Array.isArray(node.topic) ? node.topic : [node.topic];
      topics.push(...topicArray);
      for (const topic of topicArray) {
        traverse(topic);
      }
    }

    for (const key in node) {
      if (
        key !== "topic" &&
        typeof node[key] === "object" &&
        node[key] !== null
      ) {
        traverse(node[key] as Topic);
      }
    }
  }

  traverse(obj);
  return topics;
}
