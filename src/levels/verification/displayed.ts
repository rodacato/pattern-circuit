import { codeKey, reachableVariants, type CodeLang, type Level } from '../../engine'

export type Snippet = { id: string; key: string; text: string }

// The code the player can actually see: each variant of a level shows one assembled file, and the parts that only
// exist to be combined (`combo_base`, `extras_base`…) are never shown on their own.
export function displayedCode(level: Level, lang: CodeLang): Snippet[] {
  const keys = [...new Set(reachableVariants(level).map((v) => codeKey(level, v)))]
  return keys.flatMap((key) => {
    const file = level.codeFiles[lang][key]
    return file ? [{ id: `${level.id}/${key}`, key, text: file.text }] : []
  })
}
