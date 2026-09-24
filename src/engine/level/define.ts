import { parseCode, resolveRegion, type CodeFile } from '../code/regions'
import { compile } from '../circuit/compile'
import { buildCircuit, codeKey, scenarioFor, solvesAll, type Plug, type Variant } from './variants'
import { CODE_LANGS, LevelDef, type CodeLang, type LevelInput } from '../schema'

// codeFiles[lenguaje][clave]: los lenguajes que el nivel no trae quedan vacíos.
export type Level = LevelDef & { codeFiles: Record<CodeLang, Record<string, CodeFile>> }

// Las reparaciones se hacen de a una, en cualquier orden: cualquier subconjunto es alcanzable.
const subsets = <T>(items: T[]): T[][] => items.reduce<T[][]>((acc, x) => acc.flatMap((s) => [s, [...s, x]]), [[]])

// Los tickets de cambio solo se lanzan sobre el circuito base o con todos los sockets resueltos.
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

// Valida el esquema y además que cada variante alcanzable compile, tenga escenario y código.
export function defineLevel(input: LevelInput): Level {
  const level = LevelDef.parse(input)
  const errors: string[] = []
  const codeFiles = Object.fromEntries(CODE_LANGS.map((lang) => [lang, {}])) as Level['codeFiles']
  const langs = CODE_LANGS.filter((lang) => level.code[lang])

  for (const lang of langs) {
    const sources = level.code[lang]!
    for (const [key, source] of Object.entries(sources)) {
      try {
        codeFiles[lang][key] = parseCode(source)
      } catch (e) {
        errors.push(`código ${lang}/${key}: ${(e as Error).message}`)
      }
    }
    // Otro lenguaje cuenta la misma historia: los mismos fragmentos que en Ruby.
    for (const key of Object.keys(level.code.rb)) if (!(key in sources)) errors.push(`código ${lang}: falta ${key}`)
  }
  for (const socket of level.sockets) {
    for (const pattern of socket.inventory) {
      if (!socket.options[pattern]) errors.push(`socket ${socket.id}: ${pattern} en inventario sin opción`)
    }
  }
  const fail = () => {
    throw new Error(`Nivel ${level.id} inválido:\n- ${[...new Set(errors)].join('\n- ')}`)
  }
  if (errors.length) fail() // sin inventario coherente no se pueden recorrer las variantes

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
          errors.push(`${label}: falta el código ${where}`)
          continue
        }
        for (const n of circuit.nodes) {
          if (n.codeRef && !resolveRegion(file, n.codeRef)) errors.push(`${label}: ${n.id} apunta a ${n.codeRef}, que no está en ${where}`)
        }
      }
    } catch (e) {
      errors.push(`${label}: ${(e as Error).message}`)
    }
  }

  if (errors.length) fail()
  return { ...level, codeFiles }
}
