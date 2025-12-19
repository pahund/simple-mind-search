export function areNotesEqual(
  notes1: string[] | undefined,
  notes2: string[] | undefined
): boolean {
  const array1 = notes1 ?? [];
  const array2 = notes2 ?? [];

  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}
