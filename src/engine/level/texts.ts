import type { GraphPatch, LevelDef } from '../schema'

// A level never contains prose: each text field is empty (or holds a relative key) and the real text lives in the
// level's catalogs under the key derived from where the field is. `textSlots` is the one place that knows those keys.
export type TextSlot = { key: string; text: string; write: (value: string) => void }

type Patched = { patch: GraphPatch; prefix: string }

const patchesOf = (level: LevelDef): Patched[] => [
  ...level.repairs.map((r) => ({ patch: r.patch, prefix: `repair.${r.id}` })),
  ...level.sockets.flatMap((s) => Object.entries(s.options).flatMap(([pattern, o]) => (o ? [{ patch: o.patch, prefix: `option.${s.id}.${pattern}` }] : []))),
  ...level.changeTickets.flatMap((t) => [
    { patch: t.without, prefix: `ticket.${t.id}.without` },
    { patch: t.with, prefix: `ticket.${t.id}.with` },
  ]),
]

// An update leaves a node's label alone unless it carries one of its own: the schema default '' means "no override".
const dropEmptyOverrides = (level: LevelDef) => {
  for (const { patch } of patchesOf(level)) for (const u of patch.update ?? []) if (u.label === '') delete u.label
}

export function textSlots(level: LevelDef): TextSlot[] {
  const slots: TextSlot[] = []
  const slot = <T extends object>(owner: T, field: keyof T & string, key: string) => {
    const text = owner[field]
    if (typeof text === 'string') slots.push({ key, text, write: (value) => void ((owner as Record<string, unknown>)[field] = value) })
  }
  const node = (n: LevelDef['circuit']['nodes'][number]) => {
    slot(n, 'label', `node.${n.id}`)
    if (n.behavior.type === 'sink') slot(n.behavior, 'message', `node.${n.id}.message`)
  }

  slot(level, 'title', 'title')
  slot(level.brief, 'problem', 'brief.problem')
  slot(level.brief, 'goal', 'brief.goal')
  for (const c of level.checklist) slot(c, 'text', `checklist.${c.on}`)
  level.circuit.nodes.forEach(node)
  for (const socket of level.sockets) {
    slot(socket, 'label', `socket.${socket.id}`)
    for (const [pattern, option] of Object.entries(socket.options)) {
      if (!option) continue
      slot(option.note, 'title', `option.${socket.id}.${pattern}.title`)
      slot(option.note, 'body', `option.${socket.id}.${pattern}.body`)
    }
  }
  for (const t of level.changeTickets) slot(t, 'text', `ticket.${t.id}`)
  for (const r of level.repairs) slot(r, 'prompt', `repair.${r.id}`)
  level.winWhen.forEach((a, i) => slot(a, 'label', `win.${i}`))
  for (const s of level.scenarios) s.pulses.forEach((p, i) => slot(p, 'label', `scenario.${s.id}.${i}`))
  dropEmptyOverrides(level)
  for (const { patch, prefix } of patchesOf(level)) {
    patch.add?.nodes?.forEach(node)
    for (const u of patch.update ?? []) slot(u, 'label', `${prefix}.label.${u.id}`)
  }
  return slots
}

// Keys written by hand are relative and dotted (`node.create.branch`); prose has spaces or capitals.
const isRelativeKey = (text: string) => /^[a-z][\w-]*(\.[\w-]+)+$/.test(text)

// Fills every empty text field with its derived key and qualifies hand-written relative keys with the level id.
// Texts that are still prose (levels not migrated yet) are left alone.
export function qualifyTexts(level: LevelDef): LevelDef {
  const qualified = (key: string) => `levels.${level.id}.${key}`
  for (const s of textSlots(level)) {
    if (s.text === '') s.write(qualified(s.key))
    else if (isRelativeKey(s.text)) s.write(qualified(s.text))
  }
  return level
}

// Machine and breaker states are ids; their text is `state.<id>` in the level's catalog.
export const stateTextKey = (levelId: string, state: string) => `levels.${levelId}.state.${state}`
