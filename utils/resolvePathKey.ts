// Utility to resolve pathway key from pathway name
export function resolvePathKey(pathName: string): string {
  // Example: convert to lowercase and replace spaces with underscores
  return pathName.trim().toLowerCase().replace(/\s+/g, '_');
}
