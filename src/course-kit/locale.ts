// The locale a host gives a course: the exact tag, then another variant of the same language, then the default.
export function negotiateLocale(preferred: readonly string[], supported: readonly string[], fallback: string): string {
  const language = (tag: string) => tag.split('-')[0]?.toLowerCase()
  for (const tag of preferred) {
    const match = supported.find((s) => s === tag) ?? supported.find((s) => language(s) === language(tag))
    if (match) return match
  }
  return fallback
}
