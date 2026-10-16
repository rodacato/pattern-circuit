// Helpers to write levels with less noise. They only build data: validation is done by defineLevel.
import type { BehaviorInput, LevelInput, NodeInput, PatternId, WireInput } from '../engine'

type At = [number, number]
type ScenarioPulseInput = NonNullable<LevelInput['scenarios']>[number]['pulses'][number]
type NodeExtra = Partial<Omit<NodeInput, 'id' | 'label' | 'at' | 'behavior'>>

// Texts are never written here: a node's label is `node.<id>` in the level's catalog.
export const actor = (id: string, at: At): NodeInput => ({ id, kind: 'actor', at, behavior: { type: 'source' } })

export const node = (id: string, className: string, at: At, behavior: BehaviorInput = { type: 'pass' }, extra: NodeExtra = {}): NodeInput => ({
  id,
  className,
  at,
  behavior,
  codeRef: extra.codeRef ?? className,
  ...extra,
})

export const skinned = (skin: PatternId, n: NodeInput): NodeInput => ({ ...n, skin })

export const wire = (from: string, to: string, extra: Partial<WireInput> = {}): WireInput => ({ from, to, ...extra })

// Dependency on an interface: registering a new one does not modify its user.
export const abstract = (from: string, to: string, key?: string): WireInput => ({ from, to, dep: 'abstract', ...(key ? { key } : {}) })

export const chain = (...ids: string[]): WireInput[] => ids.slice(1).map((id, i) => wire(ids[i], id))

// A pulse's label is `scenario.<scenario id>.<position>` in the level's catalog.
export const pulse = (at: number, tags: string[] = [], data: Record<string, unknown> = {}, from = 'customer'): ScenarioPulseInput => ({ at, from, tags, data, label: '' })

// Common code goes before the wiring block, so the classes exist when they are instantiated.
export const withCommon = (common: string) => (code: string) => {
  const wiring = code.search(/^(?:#|\/\/) region: wiring/m)
  return wiring < 0 ? `${code}\n${common}` : `${code.slice(0, wiring)}${common}\n${code.slice(wiring)}`
}
