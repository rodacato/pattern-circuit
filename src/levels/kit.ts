// Ayudantes para escribir niveles con menos ruido. Solo arman datos: la validación la hace defineLevel.
import type { BehaviorInput, NodeInput, PatternId, WireInput } from '../engine'

type At = [number, number]
type NodeExtra = Partial<Omit<NodeInput, 'id' | 'label' | 'at' | 'behavior'>>

export const actor = (id: string, label: string, at: At): NodeInput => ({ id, label, kind: 'actor', at, behavior: { type: 'source' } })

export const node = (id: string, label: string, className: string, at: At, behavior: BehaviorInput = { type: 'pass' }, extra: NodeExtra = {}): NodeInput => ({
  id,
  label,
  className,
  at,
  behavior,
  codeRef: extra.codeRef ?? className,
  ...extra,
})

export const skinned = (skin: PatternId, n: NodeInput): NodeInput => ({ ...n, skin })

export const wire = (from: string, to: string, extra: Partial<WireInput> = {}): WireInput => ({ from, to, ...extra })

// Dependencia hacia una interfaz: registrar uno nuevo no modifica a quien lo usa.
export const abstract = (from: string, to: string, key?: string): WireInput => ({ from, to, dep: 'abstract', ...(key ? { key } : {}) })

export const chain = (...ids: string[]): WireInput[] => ids.slice(1).map((id, i) => wire(ids[i], id))

export const pulse = (at: number, label: string, tags: string[] = [], data: Record<string, unknown> = {}, from = 'cliente') => ({
  at,
  from,
  tags,
  data,
  label,
})

// El código común va antes del bloque de wiring, para que las clases existan cuando se instancian.
export const withCommon = (common: string) => (code: string) => {
  const wiring = code.search(/^(?:#|\/\/) region: wiring/m)
  return wiring < 0 ? `${code}\n${common}` : `${code.slice(0, wiring)}${common}\n${code.slice(wiring)}`
}
