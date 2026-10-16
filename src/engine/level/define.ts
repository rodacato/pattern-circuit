import { parseCode, resolveRegion, type CodeFile } from '../code/regions'
import { qualifyTexts } from './texts'
import { compile } from '../circuit/compile'
import { buildCircuit, codeKey, scenarioFor, solvesAll, type Plug, type Variant } from './variants'
import { CODE_LANGS, LevelDef, type CodeLang, type LevelInput } from '../schema'

// codeFiles[language][key]: languages the level does not provide stay empty.
export type Level = LevelDef & { codeFiles: Record<CodeLang, Record<string, CodeFile>> }

// Repairs are made one at a time, in any order: any subset is reachable.
const subsets = <T>(items: T[]): T[][] => items.reduce<T[][]>((acc, x) => acc.flatMap((s) => [s, [...s, x]]), [[]])

// Change tickets only launch on the base circuit or with every socket resolved.
export function reachableVariants(level: LevelDef): Variant[] {
  const all = level.repairs.map((r) => r.id)
  const partial = subsets(all).filter((s) => s.length < all.length)
  const combos = level.sockets.reduce<Plug[][]>(
    (acc, socket) => acc.flatMap((plugs) => [plugs, ...socket.inventory.map((pattern) => [...plugs, { id: socket.id, pattern }])]),
    [[]],
  )
  const variants: Variant[] = []
  for (const sockets of combos) {
    const v: Variant = sockets.length ? { repairs: all, sockets } : all.length ? { repairs: all } : {}
    variants.push(v)
    if (sockets.length === 0) variants.push(...partial.map((repairs) => (repairs.length ? { repairs } : {})))
    if (sockets.length === 0 || solvesAll(level, v)) for (const t of level.changeTickets) variants.push({ ...v, ticket: t.id })
  }
  return variants
}

// Validates the schema, and that every reachable variant compiles and has a scenario and code.
export function defineLevel(input: LevelInput): Level {
  const level = qualifyTexts(JSON.parse(JSON.stringify(LevelDef.parse(input)))) // breaks objects shared in the source: each field gets its own key
  const errors: string[] = []
  const codeFiles = Object.fromEntries(CODE_LANGS.map((lang) => [lang, {}])) as Level['codeFiles']
  const langs = CODE_LANGS.filter((lang) => level.code[lang])

  for (const lang of langs) {
    const sources = level.code[lang]!
    for (const [key, source] of Object.entries(sources)) {
      try {
        codeFiles[lang][key] = parseCode(source)
      } catch (e) {
        errors.push(`code ${lang}/${key}: ${(e as Error).message}`)
      }
    }
    // Another language tells the same story: the same fragments as in Ruby.
    for (const key of Object.keys(level.code.rb)) if (!(key in sources)) errors.push(`code ${lang}: missing ${key}`)
  }
  for (const socket of level.sockets) {
    for (const pattern of socket.inventory) {
      if (!socket.options[pattern]) errors.push(`socket ${socket.id}: ${pattern} is in the inventory without an option`)
    }
  }
  const fail = () => {
    throw new Error(`Invalid level ${level.id}:\n- ${[...new Set(errors)].join('\n- ')}`)
  }
  if (errors.length) fail() // without a coherent inventory the variants cannot be walked

  for (const v of reachableVariants(level)) {
    const label = JSON.stringify(v)
    try {
      const { circuit } = buildCircuit(level, v)
      compile(circuit)
      scenarioFor(level, v)
      const key = codeKey(level, v)
      for (const lang of langs) {
        const files = codeFiles[lang]
        if (!files[key] && key.includes('+')) files[key] = parseCode(key.split('+').map((k) => level.code[lang]![k] ?? '').join('\n'))
        const file = files[key]
        const where = lang === 'rb' ? key : `${lang}/${key}`
        if (!file) {
          errors.push(`${label}: missing code ${where}`)
          continue
        }
        for (const n of circuit.nodes) {
          if (n.codeRef && !resolveRegion(file, n.codeRef)) errors.push(`${label}: ${n.id} points at ${n.codeRef}, which is not in ${where}`)
        }
      }
    } catch (e) {
      errors.push(`${label}: ${(e as Error).message}`)
    }
  }

  if (errors.length) fail()
  return { ...level, codeFiles }
}
