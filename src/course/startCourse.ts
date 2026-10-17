import { EmbeddedHostBridge, PROTOCOL_VERSION, StandaloneHostBridge, embeddingOrigin, windowTransport, type HostBridge, type HostInit } from '../course-kit'
import { detectLocale } from '../i18n/registry'
import { createBrowserStorage, type BrowserStorage, type Preference } from './browserStorage'
import { fromHostLanguage, storedLanguage, toHostLanguage } from './codeLanguages'
import { HostProgressStore } from './hostProgress'

declare const __APP_VERSION__: string

export type Course = {
  bridge: HostBridge
  init: HostInit
  storage: BrowserStorage
  // The host this page was told about did not answer: the course runs on its own and says so.
  hostUnavailable?: boolean
  // Embedded, progress is kept by the host; this sends what is still waiting (the page is going away).
  flush?: () => void
}

const COURSE = { id: 'pattern-circuit', version: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0', protocol: { min: PROTOCOL_VERSION, max: PROTOCOL_VERSION } }

// What the browser itself knows: used when there is no host.
function standaloneInit(storage: BrowserStorage, languages: readonly string[]): HostInit {
  return {
    protocol: PROTOCOL_VERSION,
    locale: detectLocale(storage.locale.load(), languages),
    codeLanguage: toHostLanguage(storedLanguage(storage.codeLanguage.load())),
    progress: null,
    features: { codeRunner: false },
  }
}

async function standalone(languages: readonly string[], hostUnavailable = false): Promise<Course> {
  const storage = createBrowserStorage()
  const bridge = new StandaloneHostBridge(() => standaloneInit(storage, languages))
  return { bridge, init: await bridge.start(), storage, hostUnavailable }
}

// A preference changed by the player is requested from the host (which owns preferences); what the host itself
// sends is acknowledged so it is not requested back.
function hostPreference(bridge: HostBridge, kind: 'locale' | 'codeLanguage', initial: string | undefined, toHost: (value: string) => string = (v) => v): Preference {
  let current = initial ?? null
  return {
    load: () => current,
    save(value) {
      if (value === current) return
      current = value
      bridge.emit({ type: 'preference.requested', [kind]: toHost(value) })
    },
    acknowledge: (value) => void (current = value),
  }
}

async function embedded(hostOrigin: string): Promise<Course> {
  const bridge = new EmbeddedHostBridge({ transport: windowTransport(window, window.parent, hostOrigin), course: COURSE })
  const init = await bridge.start()
  const progress = new HostProgressStore(init.progress, (rev, snapshot) => bridge.emit({ type: 'progress', rev, progress: snapshot }))
  const storage: BrowserStorage = {
    progress,
    locale: hostPreference(bridge, 'locale', init.locale),
    codeLanguage: hostPreference(bridge, 'codeLanguage', fromHostLanguage(init.codeLanguage) ?? 'rb', (v) => toHostLanguage(storedLanguage(v))),
    // The protocol has no field for it: whether the guide was seen stays in this browser.
    walkthrough: createBrowserStorage().walkthrough,
  }
  bridge.onCommand((command) => {
    if (command.type === 'progress') progress.replace(command.progress)
  })
  return { bridge, init, storage, flush: () => progress.flush() }
}

export async function startCourse(languages: readonly string[] = navigator.languages ?? []): Promise<Course> {
  const hostOrigin = typeof window !== 'undefined' && window.parent !== window ? embeddingOrigin(window.location.hash) : undefined
  if (!hostOrigin) return standalone(languages)
  try {
    return await embedded(hostOrigin)
  } catch {
    return standalone(languages, true)
  }
}
