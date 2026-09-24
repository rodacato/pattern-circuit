import { parseCode, resolveRegion, type CodeFile } from '../code/regions'
import { compile } from '../circuit/compile'
import { buildCircuit, codeKey, scenarioFor, type Variant } from './variants'
import { LevelDef, type LevelInput } from '../schema'

export type Level = LevelDef & { codeFiles: Record<string, CodeFile> }

// Los tickets de cambio solo se lanzan sobre el circuito base o sobre una solución real.
export function reachableVariants(level: LevelDef): Variant[] {
  const repairs = level.repairs.map((r) => r.id)
  const variants: Variant[] = [{}]
  if (repairs.length) variants.push({ repairs })
  for (const socket of level.sockets) {
    for (const pattern of socket.inventory) {
      variants.push({ repairs, socket: { id: socket.id, pattern } })
      if (socket.options[pattern]?.outcome !== 'solves') continue
      for (const t of level.changeTickets) variants.push({ repairs, socket: { id: socket.id, pattern }, ticket: t.id })
    }
  }
  for (const t of level.changeTickets) variants.push({ repairs, ticket: t.id })
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
      const file = codeFiles[codeKey(level, v)]
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
