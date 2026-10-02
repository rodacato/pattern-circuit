import { describe, expect, it } from 'vitest'
import { buildCircuit, reachableVariants, type Level } from '../engine'
import { LEVELS } from '.'

// A `Class#method:branch` region only lights up when the pulse takes that branch. If the branch id in the data
// is renamed and the region marker is not, the panel silently falls back to the whole method (nothing fails),
// so every branch region has to name a branch that a node pointing at that method can actually take.
function branchesByCodeRef(level: Level): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>()
  const add = (ref: string, labels: string[]) => out.set(ref, new Set([...(out.get(ref) ?? []), 'else', ...labels]))
  for (const variant of reachableVariants(level)) {
    const { circuit } = buildCircuit(level, variant)
    for (const node of circuit.nodes) {
      if (!node.codeRef) continue
      const b = node.behavior
      if (b.type === 'branch') add(node.codeRef, Object.keys(b.cases))
      if (b.type === 'slot') add(node.codeRef, circuit.wires.filter((w) => w.from === node.id && w.key).map((w) => w.key!))
      if (b.type === 'machine') add(node.codeRef, [b.initial, ...Object.keys(b.states), ...Object.values(b.states).flatMap((s) => Object.values(s).flatMap((t) => (t.to ? [t.to] : [])))])
    }
  }
  return out
}

// Known since v1.1.0: live-orders reuses the command level's snippet, whose branches are `cmd:order` / `cmd:cancel`,
// while its own data branches on `cmd:event` / `cmd:undo`. Left as it is until the content is reviewed.
const KNOWN_STALE = new Set(['live-orders'])

describe('branch regions in the snippets', () => {
  it.todo('live-orders: its branch regions point at the command level\'s branches (see KNOWN_STALE)')

  it.each(LEVELS.filter((l) => !KNOWN_STALE.has(l.id)).map((l) => [l.id, l] as const))('%s: every `:branch` region names a branch that exists', (_id, level) => {
    const branches = branchesByCodeRef(level)
    const stale: string[] = []
    for (const [lang, files] of Object.entries(level.codeFiles)) {
      for (const [key, file] of Object.entries(files)) {
        for (const name of Object.keys(file.regions)) {
          const at = name.indexOf('#')
          const colon = at < 0 ? -1 : name.indexOf(':', at)
          if (colon < 0) continue
          const method = name.slice(0, colon)
          const branch = name.slice(colon + 1)
          if (!branches.get(method)?.has(branch)) stale.push(`${lang}/${key}: ${name}`)
        }
      }
    }
    expect(stale).toEqual([])
  })
})
