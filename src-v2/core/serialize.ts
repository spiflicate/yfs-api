export function encodeValue(value: string): string {
  return encodeURIComponent(value);
}

export function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
