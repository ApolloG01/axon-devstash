export function appendTag(current: string, tag: string): string {
  const existing = current.split(",").map((t) => t.trim()).filter(Boolean)
  if (existing.includes(tag)) return current
  return existing.length > 0 ? `${current.trim()}, ${tag}` : tag
}
