import { beforeAll, describe, expect, it } from 'vitest'
import { LEVELS } from '.'
import { displayedCode } from './verification/displayed'
import { hasRuby, runRuby, runTypeScript, type Run } from './verification/verification.testing'

// The code the player sees has to run, not only parse: every file a variant can show is executed with the outside
// world stubbed, and the two languages must print the same. (A snippet is a teaching excerpt, so most only build
// their objects; the point is that nothing in them is misspelled or missing.)
const ruby = new Map<string, Run>()
const typescript = new Map<string, Run>()

// Known since v1.1.0: TypeScript cannot reopen a class the way Ruby does, and these combinations declare the same
// class twice, so the code shown is not valid TypeScript. Reported as content to fix; listed so it cannot grow.
const KNOWN_BROKEN_TYPESCRIPT = new Set([
  'proxy/singleton',
  ...['combo_base', 'combo_composite', 'combo_strategy', 'combo_facade'].flatMap((combo) => ['extras_adapter', 'extras_singleton'].map((extras) => `combos-with-extras/base+${combo}+${extras}`)),
  ...['events_base', 'events_command'].flatMap((e) => ['states_base', 'states_state'].flatMap((s) => ['notices_base', 'notices_observer'].map((n) => `live-orders/base+${e}+${s}+${n}`))),
])

describe('toolchain', () => {
  it.skipIf(!process.env.CI)('CI has Ruby, in the version the hub runs (3.0)', () => {
    expect(hasRuby).toBe(true)
    expect(runRuby('print RUBY_VERSION')).toEqual({ ok: true, stdout: expect.stringMatching(/^3\.0\./) })
  })
})

describe.skipIf(!hasRuby)('the code players can see runs', () => {
  beforeAll(() => {
    for (const level of LEVELS) {
      for (const s of displayedCode(level, 'rb')) ruby.set(s.id, runRuby(s.text))
      for (const s of displayedCode(level, 'ts')) typescript.set(s.id, runTypeScript(s.text))
    }
  }, 120_000)

  const failed = (runs: Map<string, Run>) => [...runs].flatMap(([id, run]) => (run.ok ? [] : [`${id}: ${run.error}`]))

  it('every Ruby file runs', () => {
    expect(failed(ruby)).toEqual([])
  })

  it('every TypeScript file runs, except the ones known to declare a class twice', () => {
    expect(failed(typescript).filter((line) => !KNOWN_BROKEN_TYPESCRIPT.has(line.split(':')[0]))).toEqual([])
    expect([...KNOWN_BROKEN_TYPESCRIPT].filter((id) => typescript.get(id)?.ok)).toEqual([]) // fixed ones leave the list
  })

  it('Ruby and TypeScript print the same', () => {
    const different = [...ruby].flatMap(([id, r]) => {
      const t = typescript.get(id)
      return r.ok && t?.ok && r.stdout !== t.stdout ? [`${id}: ${JSON.stringify(r.stdout)} vs ${JSON.stringify(t.stdout)}`] : []
    })
    expect(different).toEqual([])
  })

  it('the tutorial prints what its circuit shows once the wire is repaired', () => {
    const expected = 'Charged: espresso\nPreparing espresso...\nespresso ready!'
    expect(ruby.get('tutorial/repaired')).toEqual({ ok: true, stdout: expected })
    expect(typescript.get('tutorial/repaired')).toEqual({ ok: true, stdout: expected })
  })

  it('every level shows code in both languages', () => {
    expect(LEVELS.filter((l) => !displayedCode(l, 'rb').length || !displayedCode(l, 'ts').length).map((l) => l.id)).toEqual([])
  })
})
