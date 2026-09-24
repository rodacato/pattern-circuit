import { parseCode, resolveRegion, type CodeFile } from '../code/regions'
import { compile } from '../circuit/compile'
import { buildCircuit, codeKey, scenarioFor, solvesAll, type Plug, type Variant } from './variants'
import { LevelDef, type LevelInput } from '../schema'

export type Level = LevelDef & { codeFiles: Record<string, CodeFile> }

// Los tickets de cambio solo se lanzan sobre el circuito base o con todos los sockets resueltos.
export function reachableVariants(level: LevelDef): Variant[] {
  const repairs = level.repairs.map((r) => r.id)
  const combos = level.sockets.reduce<Plug[][]>(
    (acc, socket) => acc.flatMap((plugs) => [plugs, ...socket.inventory.map((pattern) => [...plugs, { id: socket.id, pattern }])]),
    [[]],
  )
  const variants: Variant[] = []
  for (const sockets of combos) {
    const v: Variant = sockets.length ? { repairs, sockets } : repairs.length ? { repairs } : {}
    variants.push(v)
    if (sockets.length === 0 && repairs.length) variants.push({})
    if (sockets.length === 0 || solvesAll(level, v)) for (const t of level.changeTickets) variants.push({ ...v, ticket: t.id })
  }
  return variants
}

// Valida el esquema y además que cada variante alcanzable compile, tenga escenario y código.
export function defineLevel(input: LevelInput): Level {
  const level = LevelDef.parse(input)
  const errors: string[] = []
  const codeFiles: Record<string, CodeFile> = {}

  for (const [key, source] of Object.entries(level.code.rb)) {
    try {
      codeFiles[key] = parseCode(source)
    } catch (e) {
      errors.push(`código ${key}: ${(e as Error).message}`)
    }
  }
  for (const socket of level.sockets) {
    for (const pattern of socket.inventory) {
      if (!socket.options[pattern]) errors.push(`socket ${socket.id}: ${pattern} en inventario sin opción`)
    }
  }

  for (const v of reachableVariants(level)) {
    const label = JSON.stringify(v)
    try {
      const { circuit } = buildCircuit(level, v)
      compile(circuit)
      scenarioFor(level, v)
      const key = codeKey(level, v)
      if (!codeFiles[key] && key.includes('+')) codeFiles[key] = parseCode(key.split('+').map((k) => level.code.rb[k] ?? '').join('\n'))
      const file = codeFiles[key]
      if (!file) {
        errors.push(`${label}: falta el código ${codeKey(level, v)}`)
        continue
      }
      for (const n of circuit.nodes) {
        if (n.codeRef && !resolveRegion(file, n.codeRef)) {
          errors.push(`${label}: ${n.id} apunta a ${n.codeRef}, que no está en ${codeKey(level, v)}`)
        }
      }
    } catch (e) {
      errors.push(`${label}: ${(e as Error).message}`)
    }
  }

  if (errors.length) throw new Error(`Nivel ${level.id} inválido:\n- ${[...new Set(errors)].join('\n- ')}`)
  return { ...level, codeFiles }
}
