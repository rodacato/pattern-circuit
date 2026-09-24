// Textos en español que el juego muestra, sacados del código fuente para exigir su traducción en los tests.
// Se buscan literales dentro de t(…), msg(…), N(…), fx.float(…) y en los mapas de textos marcados con `// i18n`.
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
