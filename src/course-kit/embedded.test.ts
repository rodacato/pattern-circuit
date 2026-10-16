import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EmbeddedHostBridge, HostUnavailable, createHostController, embeddingFragment, embeddingOrigin, windowTransport, type HostCommand, type HostHandlers } from '.'

type Listener = (event: MessageEvent) => void

// Two windows of different origins that deliver messages the way a browser does: only to the origin they name,
// carrying the sender's origin and window. `link` says who is on the other side of `postMessage`.
class FakeWindow {
  readonly listeners = new Set<Listener>()
  peer?: FakeWindow
  readonly origin: string
  constructor(origin: string) {
    this.origin = origin
  }
  addEventListener(_type: 'message', l: Listener) { this.listeners.add(l) }
  removeEventListener(_type: 'message', l: Listener) { this.listeners.delete(l) }
  postMessage(data: unknown, targetOrigin: string) {
    const sender = this.peer
    if (!sender || targetOrigin !== this.origin) return
    queueMicrotask(() => this.listeners.forEach((l) => l({ data, origin: sender.origin, source: sender } as unknown as MessageEvent)))
  }
}

const link = (a: FakeWindow, b: FakeWindow) => {
  a.peer = b
  b.peer = a
}

const COURSE = { id: 'demo', version: '1.0.0', protocol: { min: 1, max: 1 } }
const INIT = { locale: 'en', codeLanguage: 'ruby', progress: null, features: { codeRunner: true } }

function pair(handlers: Partial<HostHandlers> = {}, supported = { min: 1, max: 1 }) {
  const host = new FakeWindow('https://dojo.example')
  const frame = new FakeWindow('https://courses.example')
  link(host, frame)
  const controller = createHostController({ transport: windowTransport(host, frame as never, frame.origin), supported, handlers: { init: () => INIT, ...handlers } })
  const bridge = new EmbeddedHostBridge({ transport: windowTransport(frame as never, host as never, host.origin), course: COURSE, retryMs: 100, giveUpMs: 1000 })
  return { host, frame, controller, bridge }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('handshake', () => {
  it('the course greets, the host answers with the negotiated protocol, and the course resolves', async () => {
    const { bridge } = pair()
    const started = bridge.start()
    await vi.advanceTimersByTimeAsync(10)
    expect(await started).toMatchObject({ protocol: 1, locale: 'en', features: { codeRunner: true } })
    expect(bridge.mode).toBe('embedded')
    expect(bridge.codeRunner).toBeDefined()
  })

  it('repeats the greeting until the host is ready, then stops', async () => {
    const host = new FakeWindow('https://dojo.example')
    const frame = new FakeWindow('https://courses.example')
    const posted: unknown[] = []
    const bridge = new EmbeddedHostBridge({ transport: { post: (m) => posted.push(m), listen: () => () => {} }, course: COURSE, retryMs: 100, giveUpMs: 1000 })
    void host, void frame
    const started = bridge.start()
    started.catch(() => {})
    await vi.advanceTimersByTimeAsync(350)
    expect(posted.length).toBe(4)
    await vi.advanceTimersByTimeAsync(1000)
    await expect(started).rejects.toBeInstanceOf(HostUnavailable)
    const after = posted.length
    await vi.advanceTimersByTimeAsync(1000)
    expect(posted.length).toBe(after)
  })

  it('gives up with HostUnavailable when the host speaks other versions', async () => {
    const { bridge } = pair({}, { min: 2, max: 3 })
    const started = bridge.start()
    started.catch(() => {})
    await vi.advanceTimersByTimeAsync(10)
    await expect(started).rejects.toBeInstanceOf(HostUnavailable)
  })
})

describe('trust', () => {
  it('ignores messages from another origin or another window', () => {
    const me = new FakeWindow('https://courses.example')
    const host = new FakeWindow('https://dojo.example')
    const stranger = new FakeWindow('https://evil.example')
    const heard: unknown[] = []
    windowTransport(me, host, host.origin).listen((d) => heard.push(d))
    const deliver = (from: FakeWindow, origin: string, data: string) => me.listeners.forEach((l) => l({ data, origin, source: from } as unknown as MessageEvent))
    deliver(stranger, 'https://evil.example', 'wrong origin and window')
    deliver(stranger, 'https://dojo.example', 'right origin, wrong window')
    deliver(host, 'https://evil.example', 'right window, wrong origin')
    deliver(host, 'https://dojo.example', 'the host')
    expect(heard).toEqual(['the host'])
  })

  it('reads the embedding origin only from a plain http(s) origin', () => {
    expect(embeddingOrigin(embeddingFragment('https://dojo.example', 1))).toBe('https://dojo.example')
    expect(embeddingOrigin('#ck-host=http%3A%2F%2Flocalhost%3A5180&ck-protocol=1')).toBe('http://localhost:5180')
    for (const bad of ['', '#ck-host=javascript%3Aalert(1)', '#ck-host=https%3A%2F%2Fdojo.example%2Fpath', '#ck-host=*', '#other=1']) expect(embeddingOrigin(bad)).toBeUndefined()
  })
})

describe('after the handshake', () => {
  it('the host hears the course events and the course obeys the host commands', async () => {
    const events: string[] = []
    const { bridge, controller } = pair({
      unitStarted: (id) => events.push(`started ${id}`),
      unitCompleted: (id, detail) => events.push(`completed ${id} ${JSON.stringify(detail)}`),
      progress: (rev, p) => events.push(`progress ${rev} ${p.completedUnits.join()}`),
      preferenceRequested: (p) => events.push(`wants ${p.locale}`),
      ready: () => events.push('ready'),
    })
    const started = bridge.start()
    await vi.advanceTimersByTimeAsync(10)
    await started
    const commands: HostCommand[] = []
    bridge.onCommand((c) => commands.push(c))

    bridge.emit({ type: 'ready' })
    bridge.emit({ type: 'unit.started', unitId: 'strategy' })
    bridge.emit({ type: 'unit.completed', unitId: 'strategy', detail: { attempts: 2 } })
    bridge.emit({ type: 'progress', rev: 3, progress: { completedUnits: ['strategy'] } })
    bridge.emit({ type: 'preference.requested', locale: 'es-MX' })
    await vi.advanceTimersByTimeAsync(10)
    expect(events).toEqual(['ready', 'started strategy', 'completed strategy {"attempts":2}', 'progress 3 strategy', 'wants es-MX'])

    controller.send({ type: 'locale', value: 'es-MX' })
    controller.send({ type: 'theme', theme: { mode: 'dark', tokens: { surface: '#101010' } } })
    controller.send({ type: 'visibility', visible: false })
    controller.send({ type: 'navigate', unitId: 'saga' })
    await vi.advanceTimersByTimeAsync(10)
    expect(commands.map((c) => c.type)).toEqual(['locale', 'theme', 'visibility', 'navigate'])
    expect(commands[1]).toMatchObject({ theme: { mode: 'dark', tokens: { surface: '#101010' } } })
  })

  it('runs code through the host and never reports a pass the host did not give', async () => {
    const { bridge } = pair({ runCode: async (r) => ({ kind: 'executed', tests: [{ name: r.entry, passed: true }], stdout: 'ok', stderr: '', durationMs: 5 }) })
    const started = bridge.start()
    await vi.advanceTimersByTimeAsync(10)
    await started
    const run = bridge.codeRunner!.run({ language: 'ruby', files: [{ path: 'a.rb', content: 'puts 1' }], entry: 'a.rb' })
    await vi.advanceTimersByTimeAsync(10)
    expect(await run).toMatchObject({ kind: 'executed', stdout: 'ok' })
  })

  it('answers unavailable when the host cannot run code', async () => {
    const { bridge } = pair()
    const started = bridge.start()
    await vi.advanceTimersByTimeAsync(10)
    await started
    const run = bridge.codeRunner!.run({ language: 'ruby', files: [{ path: 'a.rb', content: '1' }], entry: 'a.rb' })
    await vi.advanceTimersByTimeAsync(10)
    expect(await run).toMatchObject({ kind: 'unavailable' })
  })
})
