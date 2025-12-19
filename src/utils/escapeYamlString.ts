export function escapeYamlString(str: string): string {
  if (str.includes(":") || str.includes("#") || str.includes("'")) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}
