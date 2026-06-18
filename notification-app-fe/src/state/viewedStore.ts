// Track which notification IDs have been viewed (in-memory, no DB)
const viewedIds = new Set<string>();

export function markViewed(id: string): void {
  viewedIds.add(id);
}

export function isViewed(id: string): boolean {
  return viewedIds.has(id);
}
