import { describe, expect, it } from 'vitest'
import { CHANNEL, CourseManifest, HostInit, LIMITS, PROTOCOL_VERSION, Progress, StandaloneHostBridge, Theme, negotiateLocale, parseCourseMessage, parseHostMessage } from '.'

const envelope = (type: string, payload: unknown) => ({ channel: CHANNEL, v: PROTOCOL_VERSION, type, id: 'm1', payload })

describe('messages', () => {
  it('accepts a well-formed message and keeps its type', () => {
    const m = parseCourseMessage(envelope('course.unit.completed', { unitId: 'strategy', detail: { attempts: 2 } }))
    expect(m?.type).toBe('course.unit.completed')
  })

  it('drops what does not parse: another channel, unknown type, bad payload, direction mixed up', () => {
    expect(parseCourseMessage({ ...envelope('course.ready', {}), channel: 'other' })).toBeUndefined()
    expect(parseCourseMessage(envelope('course.nothing', {}))).toBeUndefined()
    expect(parseCourseMessage(envelope('course.unit.completed', { unitId: 7 }))).toBeUndefined()
    expect(parseCourseMessage(envelope('host.init', {}))).toBeUndefined()
    expect(parseHostMessage(envelope('course.ready', {}))).toBeUndefined()
    expect(parseCourseMessage('hello')).toBeUndefined()
  })

  it('strips unknown fields so a newer peer can add them', () => {
    const m = parseCourseMessage(envelope('course.unit.started', { unitId: 'a', future: true }))
    expect(m?.payload).toEqual({ unitId: 'a' })
  })

  it('refuses oversized messages and course state', () => {
    expect(parseCourseMessage(envelope('course.unit.started', { unitId: 'a', pad: 'x'.repeat(LIMITS.message) }))).toBeUndefined()
    expect(Progress.safeParse({ completedUnits: [], state: 'x'.repeat(LIMITS.state + 1) }).success).toBe(false)
    expect(Progress.safeParse({ completedUnits: ['a'], state: { notes: [] } }).success).toBe(true)
  })

  it('requires the executed outcome to say what ran: syntax checks are never a pass', () => {
    const base = envelope('host.code.result', { outcome: { kind: 'syntax-checked', diagnostics: [{ line: 3, message: 'unexpected end' }] } })
    expect(parseHostMessage(base)?.type).toBe('host.code.result')
    expect(parseHostMessage(envelope('host.code.result', { outcome: { kind: 'passed' } }))).toBeUndefined()
  })
})

describe('theme', () => {
  it('keeps colors, fonts and radii and drops anything that could load or inject something', () => {
    const theme = Theme.parse({
      mode: 'dark',
      tokens: { surface: '#0b1222', textPrimary: 'red', border: 'url(https://x/y)', fontSans: 'Inter, system-ui, sans-serif', fontMono: 'x; background: url(a)', radiusMd: '6px', unknown: '#ffffff' },
    })
    expect(theme.tokens).toEqual({ surface: '#0b1222', fontSans: 'Inter, system-ui, sans-serif', radiusMd: '6px' })
  })
})

describe('host init', () => {
  it('needs the negotiated protocol and what the host offers', () => {
    expect(HostInit.safeParse({ protocol: 1, locale: 'en', progress: null, features: { codeRunner: false } }).success).toBe(true)
    expect(HostInit.safeParse({ protocol: 1, locale: 'en', progress: null }).success).toBe(false)
  })
})

describe('manifest', () => {
  const valid = {
    schema: 1,
    id: 'demo',
    version: '1.0.0',
    protocol: { min: 1, max: 1 },
    title: { en: 'Demo' },
    description: { en: 'A demo' },
    locales: ['en'],
    defaultLocale: 'en',
    codeLanguages: ['ruby'],
    entry: './index.html',
    groups: [{ id: 'one', title: { en: 'One' } }],
    units: [{ id: 'first', group: 'one', title: { en: 'First' } }],
    completion: { requires: 'all' },
    capabilities: { codeRunner: 'none', persistsOwnState: false },
  }

  it('accepts a valid one', () => {
    expect(CourseManifest.safeParse(valid).success).toBe(true)
  })

  it.each([
    ['a default locale that is not offered', { defaultLocale: 'es' }],
    ['a unit in an unknown group', { units: [{ id: 'first', group: 'two', title: { en: 'First' } }] }],
    ['a completion rule for a unit that does not exist', { completion: { requires: ['ghost'] } }],
    ['a text missing a locale', { title: {} }],
    ['an id that is not a slug', { id: 'My Course' }],
  ])('rejects %s', (_name, change) => {
    expect(CourseManifest.safeParse({ ...valid, ...change }).success).toBe(false)
  })
})

describe('locale negotiation', () => {
  it('goes from the exact tag to the same language to the fallback', () => {
    expect(negotiateLocale(['es-AR', 'en'], ['es-MX', 'en'], 'en')).toBe('es-MX')
    expect(negotiateLocale(['en-GB'], ['es-MX', 'en'], 'es-MX')).toBe('en')
    expect(negotiateLocale(['ja'], ['es-MX', 'en'], 'en')).toBe('en')
  })
})

describe('standalone bridge', () => {
  it('answers from the browser, lets the course watch its own events and runs commands', async () => {
    const seen: string[] = []
    const bridge = new StandaloneHostBridge(
      () => ({ protocol: 1, locale: 'en', progress: null, features: { codeRunner: false } }),
      (e) => seen.push(e.type),
    )
    expect(bridge.mode).toBe('standalone')
    expect((await bridge.start()).locale).toBe('en')
    bridge.emit({ type: 'unit.started', unitId: 'a' })
    const commands: string[] = []
    const off = bridge.onCommand((c) => commands.push(c.type))
    bridge.dispatch({ type: 'locale', value: 'es-MX' })
    off()
    bridge.dispatch({ type: 'locale', value: 'en' })
    expect(seen).toEqual(['unit.started'])
    expect(commands).toEqual(['locale'])
  })
})
