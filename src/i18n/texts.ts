// Spanish texts the game shows, extracted from the source code to require their translation in the tests.
// Literals are searched inside t(…), msg(…), N(…), fx.float(…) and in the text maps marked with `// i18n`.
const CALL = /(?:\bt|\bmsg|\bN|\.float)\(\s*(?:at,\s*)?(?:[\w.!?]+\s*\?\s*)?'((?:[^'\\]|\\.)+)'(?:\s*:\s*'((?:[^'\\]|\\.)+)')?/g
const TERNARY_IN_T = /\bt\([^()']*\?\s*'((?:[^'\\]|\\.)+)'\s*:\s*'((?:[^'\\]|\\.)+)'/g
const MAP_ENTRY = /^\s*(?:[\w-]+|'[\w-]+'):\s*(?:\{\s*label:\s*)?'((?:[^'\\]|\\.)+)'/gm
const MAP_BLOCK = /\/\/ i18n[^\n]*\n([\s\S]*?)\n\}/g

export function extractTexts(source: string): string[] {
  const out = new Set<string>()
  for (const m of source.matchAll(CALL)) [m[1], m[2]].forEach((x) => x && out.add(x))
  for (const m of source.matchAll(TERNARY_IN_T)) [m[1], m[2]].forEach((x) => out.add(x))
  for (const block of source.matchAll(MAP_BLOCK)) for (const m of block[1].matchAll(MAP_ENTRY)) out.add(m[1])
  return [...out].map((x) => x.replace(/\\'/g, "'"))
}
