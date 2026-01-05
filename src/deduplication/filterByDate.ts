import type { DeduplicatedResult } from "./deduplicate";

export interface FilterByDateParams {
  results: DeduplicatedResult[];
  date: string;
}

export function filterByDate({
  results,
  date
}: FilterByDateParams): DeduplicatedResult[] {
  const targetDate = new Date(date);

  // Check if date is valid
  if (isNaN(targetDate.getTime())) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
  }

  return results.filter((result) => {
    // Target date must be >= createdAt and <= modifiedAt
    return targetDate >= result.createdAt && targetDate <= result.modifiedAt;
  });
}
